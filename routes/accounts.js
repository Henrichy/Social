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
      .select('-credentials') // Exclude credentials from public API
      .populate('category', 'name')
      .populate('seller', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Account.countDocuments(query);

    res.json({
      accounts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single account
router.get('/:id', async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)
      .select('-credentials') // Exclude credentials from public API
      .populate('category', 'name')
      .populate('seller', 'name email');
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(account);
  } catch (error) {
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
      credentialsInventory
    } = req.body;

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
    
    // Update credentials inventory if provided
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