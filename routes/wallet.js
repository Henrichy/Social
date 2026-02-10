const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('walletBalance');
    
    res.json({
      success: true,
      balance: user?.walletBalance || 0
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add funds to wallet
router.post('/add-funds', auth, async (req, res) => {
  try {
    const { amount, paymentReference, paymentMethod } = req.body;
    
    if (!amount || !paymentReference || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Amount, payment reference, and payment method are required'
      });
    }

    const fundingAmount = Number(amount);
    
    if (fundingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid funding amount'
      });
    }

    if (fundingAmount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum funding amount is ₦100'
      });
    }

    if (fundingAmount > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum funding amount is ₦1,000,000'
      });
    }

    // Find user and update wallet balance
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize wallet balance if it doesn't exist
    if (typeof user.walletBalance !== 'number') {
      user.walletBalance = 0;
    }

    // Add funds to wallet
    user.walletBalance += fundingAmount;
    await user.save();

    console.log(`Wallet funding successful: User ${user.email} added ₦${fundingAmount}. New balance: ₦${user.walletBalance}`);

    res.json({
      success: true,
      message: 'Funds added successfully',
      newBalance: user.walletBalance,
      amountAdded: fundingAmount,
      paymentReference: paymentReference,
      paymentMethod: paymentMethod
    });

  } catch (error) {
    console.error('Error adding funds to wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get wallet transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // This would typically come from a separate WalletTransaction model
    // For now, we'll return an empty array as a placeholder
    res.json({
      success: true,
      transactions: [],
      totalPages: 0,
      currentPage: page,
      total: 0
    });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;