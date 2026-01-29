const mongoose = require('mongoose');

const WhatsAppPaymentSettingsSchema = new mongoose.Schema({
  bankName: {
    type: String,
    default: ''
  },
  accountName: {
    type: String,
    default: ''
  },
  accountNumber: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: 'Transfer the exact amount to the account details above, then provide the generated payment code to complete your order.'
  },
  isEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
WhatsAppPaymentSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      bankName: '',
      accountName: '',
      accountNumber: '',
      isEnabled: false
    });
  }
  return settings;
};

module.exports = mongoose.model('WhatsAppPaymentSettings', WhatsAppPaymentSettingsSchema);