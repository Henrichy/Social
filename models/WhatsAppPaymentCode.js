const mongoose = require('mongoose');

const WhatsAppPaymentCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cartItems: [{
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    title: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'expired', 'cancelled'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Expire after 24 hours
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Generate unique payment code
WhatsAppPaymentCodeSchema.statics.generateCode = function() {
  const prefix = 'WA';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Auto-expire codes
WhatsAppPaymentCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('WhatsAppPaymentCode', WhatsAppPaymentCodeSchema);