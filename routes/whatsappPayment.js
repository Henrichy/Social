const express = require('express');
const router = express.Router();
const WhatsAppPaymentSettings = require('../models/WhatsAppPaymentSettings');
const WhatsAppPaymentCode = require('../models/WhatsAppPaymentCode');
const Order = require('../models/Order');
const Account = require('../models/Account');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { migrateAccountsCredentials } = require('../utils/migrateAccounts');

// Get WhatsApp payment settings (public route)
router.get('/settings', async (req, res) => {
  try {
    const settings = await WhatsAppPaymentSettings.getSettings();
    
    // Return only necessary public information
    res.json({
      success: true,
      settings: {
        bankName: settings.bankName,
        accountName: settings.accountName,
        accountNumber: settings.accountNumber,
        instructions: settings.instructions,
        isEnabled: settings.isEnabled
      }
    });
  } catch (error) {
    console.error('Error fetching WhatsApp payment settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update WhatsApp payment settings (admin only)
router.put('/settings', auth, adminAuth, async (req, res) => {
  try {
    console.log('WhatsApp payment settings update request received');
    console.log('User ID:', req.userId);
    console.log('Request body:', req.body);

    const {
      bankName,
      accountName,
      accountNumber,
      instructions,
      isEnabled
    } = req.body;

    // Validate required fields if enabling the payment method
    if (isEnabled && (!bankName?.trim() || !accountName?.trim() || !accountNumber?.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Bank name, account name, and account number are required when enabling WhatsApp payment'
      });
    }

    const settings = await WhatsAppPaymentSettings.getSettings();
    console.log('Current settings:', settings);

    // Update settings
    if (bankName !== undefined) settings.bankName = bankName.trim();
    if (accountName !== undefined) settings.accountName = accountName.trim();
    if (accountNumber !== undefined) settings.accountNumber = accountNumber.trim();
    if (instructions !== undefined) settings.instructions = instructions;
    if (isEnabled !== undefined) settings.isEnabled = isEnabled;

    await settings.save();
    console.log('Settings saved successfully');

    res.json({
      success: true,
      message: 'WhatsApp payment settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating WhatsApp payment settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Generate payment code for user
router.post('/generate-code', auth, async (req, res) => {
  try {
    const { cartItems, totalAmount } = req.body;
    
    if (!cartItems || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Cart items and total amount are required'
      });
    }

    // Check if WhatsApp payment is enabled and configured
    const settings = await WhatsAppPaymentSettings.getSettings();
    if (!settings.isEnabled) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp payment is currently disabled'
      });
    }

    if (!settings.bankName || !settings.accountName || !settings.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp payment is not properly configured. Please contact support.'
      });
    }

    // Validate cart items
    const validatedItems = [];
    for (const item of cartItems) {
      const account = await Account.findById(item._id);
      if (!account) {
        return res.status(400).json({
          success: false,
          message: `Account not found: ${item.title}`
        });
      }
      
      validatedItems.push({
        account: account._id,
        quantity: item.quantity || 1,
        price: account.price,
        title: account.title
      });
    }

    // Generate unique payment code
    let code;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      code = WhatsAppPaymentCode.generateCode();
      const existingCode = await WhatsAppPaymentCode.findOne({ code });
      if (!existingCode) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique payment code'
      });
    }

    // Create payment code record
    const paymentCode = new WhatsAppPaymentCode({
      code,
      buyer: req.userId,
      cartItems: validatedItems,
      totalAmount
    });

    await paymentCode.save();

    res.json({
      success: true,
      message: 'Payment code generated successfully',
      data: {
        code,
        totalAmount,
        expiresAt: paymentCode.expiresAt
      }
    });
  } catch (error) {
    console.error('Error generating payment code:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all pending payment codes (admin only)
router.get('/pending-codes', auth, adminAuth, async (req, res) => {
  try {
    const pendingCodes = await WhatsAppPaymentCode.find({ 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
    .populate('buyer', 'name email')
    .populate('cartItems.account', 'title')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingCodes
    });
  } catch (error) {
    console.error('Error fetching pending codes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Verify payment code and create order (admin only)
router.post('/verify-code', auth, adminAuth, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Payment code is required'
      });
    }

    // Find the payment code
    const paymentCode = await WhatsAppPaymentCode.findOne({ code })
      .populate('buyer', 'name email')
      .populate('cartItems.account');

    if (!paymentCode) {
      return res.status(404).json({
        success: false,
        message: 'Payment code not found'
      });
    }

    if (paymentCode.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment code is already ${paymentCode.status}`
      });
    }

    if (paymentCode.expiresAt < new Date()) {
      paymentCode.status = 'expired';
      await paymentCode.save();
      return res.status(400).json({
        success: false,
        message: 'Payment code has expired'
      });
    }

    // Validate and prepare order items with credentials
    const orderItems = [];
    for (const cartItem of paymentCode.cartItems) {
      const account = await Account.findById(cartItem.account._id);
      if (!account) {
        return res.status(404).json({
          success: false,
          message: `Account not found: ${cartItem.title}`
        });
      }

      // Check available credentials
      const availableCredentials = account.credentialsInventory && Array.isArray(account.credentialsInventory) 
        ? account.credentialsInventory.filter(cred => !cred.isSold)
        : [];
      if (availableCredentials.length < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough credentials available for ${account.title}. Available: ${availableCredentials.length}, Requested: ${cartItem.quantity}`
        });
      }

      // Mark credentials as sold
      const credentialsToSell = availableCredentials.slice(0, cartItem.quantity);
      for (const credential of credentialsToSell) {
        credential.isSold = true;
        credential.soldAt = new Date();
        credential.soldTo = paymentCode.buyer._id;
      }

      // Add to order items
      orderItems.push({
        account: account._id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        credentials: credentialsToSell.map(cred => ({
          email: cred.email,
          password: cred.password,
          username: cred.username,
          phone: cred.phone,
          recoveryEmail: cred.recoveryEmail,
          additionalInfo: cred.additionalInfo
        }))
      });

      await account.save();
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create order
    const order = new Order({
      orderNumber,
      buyer: paymentCode.buyer._id,
      items: orderItems,
      totalAmount: paymentCode.totalAmount,
      paymentMethod: 'whatsapp-bank',
      paymentReference: code,
      paymentStatus: 'completed',
      orderStatus: 'completed',
      deliveryStatus: 'delivered'
    });

    await order.save();

    // Update payment code
    paymentCode.status = 'verified';
    paymentCode.verifiedBy = req.userId;
    paymentCode.verifiedAt = new Date();
    paymentCode.orderId = order._id;
    await paymentCode.save();

    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      data: {
        orderNumber: order.orderNumber,
        buyerName: paymentCode.buyer.name,
        buyerEmail: paymentCode.buyer.email,
        totalAmount: order.totalAmount,
        itemCount: order.items.length
      }
    });
  } catch (error) {
    console.error('Error verifying payment code:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get payment code status (for user to check)
router.get('/code-status/:code', auth, async (req, res) => {
  try {
    const { code } = req.params;
    
    const paymentCode = await WhatsAppPaymentCode.findOne({ 
      code,
      buyer: req.userId 
    }).populate('orderId');

    if (!paymentCode) {
      return res.status(404).json({
        success: false,
        message: 'Payment code not found'
      });
    }

    const responseData = {
      code: paymentCode.code,
      status: paymentCode.status,
      totalAmount: paymentCode.totalAmount,
      createdAt: paymentCode.createdAt,
      expiresAt: paymentCode.expiresAt,
      verifiedAt: paymentCode.verifiedAt
    };

    // If payment is verified and order exists, include full order details
    if (paymentCode.status === 'verified' && paymentCode.orderId) {
      const fullOrder = await Order.findById(paymentCode.orderId)
        .populate('buyer', 'name email')
        .populate({
          path: 'items.account',
          select: 'title platform price productType'
        });

      console.log('Full order found:', fullOrder ? 'Yes' : 'No');
      console.log('Order details:', {
        orderNumber: fullOrder?.orderNumber,
        totalAmount: fullOrder?.totalAmount,
        itemsCount: fullOrder?.items?.length
      });

      responseData.orderNumber = fullOrder.orderNumber;
      responseData.order = fullOrder;
    } else if (paymentCode.orderId) {
      responseData.orderNumber = paymentCode.orderId.orderNumber;
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching code status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Migration endpoint (admin only) - run once to fix existing accounts
router.post('/migrate-accounts', auth, adminAuth, async (req, res) => {
  try {
    const result = await migrateAccountsCredentials();
    
    if (result.success) {
      res.json({
        success: true,
        message: `Successfully migrated ${result.migratedCount} accounts`,
        migratedCount: result.migratedCount
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Migration failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error running migration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during migration',
      error: error.message
    });
  }
});

module.exports = router;