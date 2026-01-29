const express = require('express');
const Account = require('../models/Account');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const { category, platform, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    
    let query = { isAvailable: true };
    
    if (category) query.category = category;
    if (platform) query.platform = { $regex: platform, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const accounts = await Account.find(query)
      .populate('category', 'name')
      .populate('seller', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Process accounts to exclude credentials but include availability counts
    const processedAccounts = accounts.map(account => {
      const accountObj = account.toObject();
      
      // Calculate availability counts manually
      let availableCredentialsCount = 0;
      let totalCredentialsCount = 0;
      
      if (Array.isArray(accountObj.credentials)) {
        const validCredentials = accountObj.credentials.filter(cred => cred && cred.trim());
        totalCredentialsCount = validCredentials.length;
        availableCredentialsCount = accountObj.isSold ? 0 : validCredentials.length;
      } else if (accountObj.credentialsInventory && Array.isArray(accountObj.credentialsInventory)) {
        // Fallback to legacy inventory system
        totalCredentialsCount = accountObj.credentialsInventory.length;
        availableCredentialsCount = accountObj.credentialsInventory.filter(cred => !cred.isSold).length;
      }
      
      // Remove credentials from response but keep availability counts
      delete accountObj.credentials;
      delete accountObj.credentialsInventory;
      
      // Add calculated counts
      accountObj.availableCredentialsCount = availableCredentialsCount;
      accountObj.totalCredentialsCount = totalCredentialsCount;
      
      return accountObj;
    });

    const total = await Account.countDocuments(query);

    res.json({
      accounts: processedAccounts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single account
router.get('/:id', async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)
      .populate('category', 'name')
      .populate('seller', 'name email');
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    const accountObj = account.toObject();
    
    // Calculate availability counts manually
    let availableCredentialsCount = 0;
    let totalCredentialsCount = 0;
    
    if (Array.isArray(accountObj.credentials)) {
      const validCredentials = accountObj.credentials.filter(cred => cred && cred.trim());
      totalCredentialsCount = validCredentials.length;
      availableCredentialsCount = accountObj.isSold ? 0 : validCredentials.length;
    } else if (accountObj.credentialsInventory && Array.isArray(accountObj.credentialsInventory)) {
      // Fallback to legacy inventory system
      totalCredentialsCount = accountObj.credentialsInventory.length;
      availableCredentialsCount = accountObj.credentialsInventory.filter(cred => !cred.isSold).length;
    }
    
    // Remove credentials from response but keep availability counts
    delete accountObj.credentials;
    delete accountObj.credentialsInventory;
    
    // Add calculated counts
    accountObj.availableCredentialsCount = availableCredentialsCount;
    accountObj.totalCredentialsCount = totalCredentialsCount;
    
    res.json(accountObj);
  } catch (error) {
    console.error('Get single account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create account
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      platform,
      productType,
      followers,
      accountAge,
      duration,
      specifications,
      images,
      features,
      bulkDiscount,
      guarantee,
      credentials,
      credentialsInventory
    } = req.body;

    const account = new Account({
      title,
      description,
      category,
      price,
      platform,
      productType,
      followers,
      accountAge,
      duration,
      specifications,
      images,
      features,
      bulkDiscount,
      guarantee,
      credentials: credentials, // Let pre-save hook handle formatting
      credentialsInventory: credentialsInventory || [],
      seller: req.userId
    });

    await account.save();
    await account.populate(['category', 'seller']);
    
    res.status(201).json(account);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update account
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      platform,
      productType,
      followers,
      accountAge,
      duration,
      specifications,
      images,
      features,
      bulkDiscount,
      guarantee,
      isAvailable,
      credentials,
      credentialsInventory
    } = req.body;

    console.log('Update account request received');
    console.log('Account ID:', req.params.id);
    console.log('Credentials received:', credentials);
    console.log('Credentials type:', typeof credentials);
    console.log('Credentials is array:', Array.isArray(credentials));

    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Update fields
    account.title = title || account.title;
    account.description = description || account.description;
    account.category = category || account.category;
    account.price = price !== undefined ? price : account.price;
    account.platform = platform || account.platform;
    account.productType = productType || account.productType;
    account.followers = followers !== undefined ? followers : account.followers;
    account.accountAge = accountAge || account.accountAge;
    account.duration = duration || account.duration;
    account.specifications = specifications || account.specifications;
    account.images = images || account.images;
    account.features = features || account.features;
    account.bulkDiscount = bulkDiscount !== undefined ? bulkDiscount : account.bulkDiscount;
    account.guarantee = guarantee !== undefined ? guarantee : account.guarantee;
    account.isAvailable = isAvailable !== undefined ? isAvailable : account.isAvailable;
    
    // Update credentials array if provided
    if (credentials !== undefined) {
      console.log('Raw credentials received:', JSON.stringify(credentials, null, 2));
      console.log('Credentials type:', typeof credentials);
      console.log('Account was sold:', account.isSold);
      
      // Let the pre-save hook handle the formatting
      account.credentials = credentials;
      console.log('Credentials set to:', account.credentials);
      
      // Check if new credentials were added and account was previously sold
      const hasValidCredentials = Array.isArray(credentials) 
        ? credentials.some(cred => cred && cred.trim())
        : (credentials && credentials.trim());
      
      if (hasValidCredentials && account.isSold) {
        console.log('Account had new credentials added - marking as available');
        account.isSold = false;
        account.isAvailable = true;
      }
      
      console.log('Account isSold status:', account.isSold);
      console.log('Account isAvailable status:', account.isAvailable);
    }
    
    // Update credentials inventory if provided (for backward compatibility)
    if (credentialsInventory !== undefined) {
      account.credentialsInventory = credentialsInventory;
    }

    await account.save();
    await account.populate(['category', 'seller']);
    
    res.json(account);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Delete account
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    await Account.findByIdAndDelete(req.params.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Validate cart items
router.post('/validate-cart', auth, async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid cart items' 
      });
    }
    
    const invalidItems = [];
    const validItems = [];
    
    for (const cartItem of cartItems) {
      const account = await Account.findById(cartItem._id);
      if (!account) {
        invalidItems.push({
          id: cartItem._id,
          title: cartItem.title || 'Unknown Item'
        });
      } else {
        validItems.push(cartItem);
      }
    }
    
    if (invalidItems.length > 0) {
      return res.json({
        valid: false,
        invalidItems,
        validItems,
        message: 'Some items in your cart are no longer available'
      });
    }
    
    res.json({
      valid: true,
      message: 'All cart items are valid'
    });
    
  } catch (error) {
    console.error('Cart validation error:', error);
    res.status(500).json({
      valid: false,
      message: 'Server error during validation',
      error: error.message
    });
  }
});

module.exports = router;