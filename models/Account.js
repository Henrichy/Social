const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  productType: {
    type: String,
    enum: ['social_account', 'vpn', 'dating_app', 'texting_app', 'proxy', 'apple_service', 'other'],
    default: 'social_account'
  },
  followers: {
    type: Number,
    default: 0
  },
  accountAge: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: ''
  },
  specifications: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  features: [{
    type: String
  }],
  // Multiple account credentials (inventory)
  credentialsInventory: [{
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    username: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    recoveryEmail: {
      type: String,
      default: ''
    },
    additionalInfo: {
      type: String,
      default: ''
    },
    isSold: {
      type: Boolean,
      default: false
    },
    soldAt: {
      type: Date
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Legacy single credential (for backward compatibility)
  credentials: {
    email: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    recoveryEmail: {
      type: String,
      default: ''
    },
    additionalInfo: {
      type: String,
      default: ''
    }
  },
  bulkDiscount: {
    type: Boolean,
    default: false
  },
  guarantee: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isSold: {
    type: Boolean,
    default: false
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual field to get available credentials count
AccountSchema.virtual('availableCredentialsCount').get(function() {
  if (!this.credentialsInventory || !Array.isArray(this.credentialsInventory)) {
    return 0;
  }
  return this.credentialsInventory.filter(cred => !cred.isSold).length;
});

// Virtual field to get total credentials count
AccountSchema.virtual('totalCredentialsCount').get(function() {
  if (!this.credentialsInventory || !Array.isArray(this.credentialsInventory)) {
    return 0;
  }
  return this.credentialsInventory.length;
});

// Ensure virtual fields are serialized
AccountSchema.set('toJSON', { virtuals: true });
AccountSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Account', AccountSchema);