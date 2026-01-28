const mongoose = require('mongoose');

const CryptoSettingsSchema = new mongoose.Schema({
  bitcoin: {
    address: {
      type: String,
      default: ''
    },
    qrCode: {
      type: String, // Base64 encoded image or URL
      default: ''
    }
  },
  usdt: {
    address: {
      type: String,
      default: ''
    },
    qrCode: {
      type: String, // Base64 encoded image or URL
      default: ''
    },
    network: {
      type: String,
      default: 'TRC20', // TRC20, ERC20, BEP20
      enum: ['TRC20', 'ERC20', 'BEP20']
    }
  },
  whatsappCommunityLink: {
    type: String,
    default: 'https://chat.whatsapp.com/your-community-link'
  },
  instructions: {
    type: String,
    default: 'After making payment, join our WhatsApp community and send the transaction screenshot to receive your credentials.'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
CryptoSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('CryptoSettings', CryptoSettingsSchema);