const express = require('express');
const router = express.Router();
const CryptoSettings = require('../models/CryptoSettings');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get crypto settings (public route for payment page)
router.get('/', async (req, res) => {
  try {
    const settings = await CryptoSettings.getSettings();
    
    // Return only necessary public information
    res.json({
      success: true,
      settings: {
        bitcoin: {
          address: settings.bitcoin.address,
          qrCode: settings.bitcoin.qrCode
        },
        usdt: {
          address: settings.usdt.address,
          qrCode: settings.usdt.qrCode,
          network: settings.usdt.network
        },
        whatsappCommunityLink: settings.whatsappCommunityLink,
        instructions: settings.instructions
      }
    });
  } catch (error) {
    console.error('Error fetching crypto settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update crypto settings (admin only)
router.put('/', auth, adminAuth, async (req, res) => {
  try {
    console.log('Crypto settings update request received');
    console.log('User ID:', req.userId);
    console.log('Request body:', req.body);

    const {
      bitcoinAddress,
      bitcoinQrCode,
      usdtAddress,
      usdtQrCode,
      usdtNetwork,
      whatsappCommunityLink,
      instructions
    } = req.body;

    const settings = await CryptoSettings.getSettings();
    console.log('Current settings:', settings);

    // Update Bitcoin settings
    if (bitcoinAddress !== undefined) settings.bitcoin.address = bitcoinAddress;
    if (bitcoinQrCode !== undefined) settings.bitcoin.qrCode = bitcoinQrCode;

    // Update USDT settings
    if (usdtAddress !== undefined) settings.usdt.address = usdtAddress;
    if (usdtQrCode !== undefined) settings.usdt.qrCode = usdtQrCode;
    if (usdtNetwork !== undefined) settings.usdt.network = usdtNetwork;

    // Update other settings
    if (whatsappCommunityLink !== undefined) settings.whatsappCommunityLink = whatsappCommunityLink;
    if (instructions !== undefined) settings.instructions = instructions;

    await settings.save();
    console.log('Settings saved successfully');

    res.json({
      success: true,
      message: 'Crypto settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Error updating crypto settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;