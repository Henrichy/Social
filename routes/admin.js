const express = require('express');
const User = require('../models/User');
const Category = require('../models/Category');
const Account = require('../models/Account');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get admin dashboard stats
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalAccounts = await Account.countDocuments();
    const availableAccounts = await Account.countDocuments({ isAvailable: true });

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentAccounts = await Account.find()
      .populate('category', 'name')
      .populate('seller', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalCategories,
        totalAccounts,
        availableAccounts
      },
      recentUsers,
      recentAccounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all categories for admin
router.get('/categories', [auth, adminAuth], async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users for admin
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all accounts for admin
router.get('/accounts', [auth, adminAuth], async (req, res) => {
  try {
    const accounts = await Account.find()
      .populate('category', 'name')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    
    // Ensure credentials are properly formatted for admin interface
    const formattedAccounts = accounts.map(account => {
      const accountObj = account.toObject();
      
      // Ensure credentials is always an array
      if (!Array.isArray(accountObj.credentials)) {
        if (typeof accountObj.credentials === 'string' && accountObj.credentials.trim()) {
          accountObj.credentials = [accountObj.credentials.trim()];
        } else {
          accountObj.credentials = [];
        }
      } else {
        // Filter out empty credentials
        accountObj.credentials = accountObj.credentials.filter(cred => cred && cred.trim());
      }
      
      return accountObj;
    });
    
    res.json(formattedAccounts);
  } catch (error) {
    console.error('Admin accounts fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;