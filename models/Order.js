const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
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
    credentials: {
      type: mongoose.Schema.Types.Mixed, // Can be string or array of strings
      default: []
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'crypto-bitcoin', 'crypto-usdt', 'whatsapp-bank'],
    required: true
  },
  paymentReference: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'completed', 'cancelled'],
    default: 'processing'
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'delivered'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);