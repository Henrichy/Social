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
  // Array of credential text blocks (supports multiple logins)
  credentials: [{
    type: String,
    trim: true
  }],
  // Legacy fields for backward compatibility
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

// Virtual field to get available credentials count (simplified)
AccountSchema.virtual('availableCredentialsCount').get(function() {
  // If using credentials array, return count of non-empty credentials if not sold
  if (this.credentials && Array.isArray(this.credentials)) {
    const validCredentials = this.credentials.filter(cred => cred && cred.trim());
    return this.isSold ? 0 : validCredentials.length;
  }
  
  // Fallback to legacy inventory system
  if (!this.credentialsInventory || !Array.isArray(this.credentialsInventory)) {
    return 0;
  }
  return this.credentialsInventory.filter(cred => !cred.isSold).length;
});

// Virtual field to get total credentials count (simplified)
AccountSchema.virtual('totalCredentialsCount').get(function() {
  // If using credentials array, return count of non-empty credentials
  if (this.credentials && Array.isArray(this.credentials)) {
    return this.credentials.filter(cred => cred && cred.trim()).length;
  }
  
  // Fallback to legacy inventory system
  if (!this.credentialsInventory || !Array.isArray(this.credentialsInventory)) {
    return 0;
  }
  return this.credentialsInventory.length;
});

// Ensure virtual fields are serialized
AccountSchema.set('toJSON', { virtuals: true });
AccountSchema.set('toObject', { virtuals: true });

// Pre-save hook to ensure credentials are properly formatted
AccountSchema.pre('save', function(next) {
  // Ensure credentials is always an array of strings
  if (!Array.isArray(this.credentials)) {
    if (typeof this.credentials === 'string' && this.credentials.trim()) {
      this.credentials = [this.credentials.trim()];
    } else {
      this.credentials = [];
    }
  } else {
    // Filter out non-string or empty credentials
    this.credentials = this.credentials.filter(cred => 
      typeof cred === 'string' && cred.trim()
    );
  }
  
  // Ensure credentialsInventory is always an array
  if (!Array.isArray(this.credentialsInventory)) {
    this.credentialsInventory = [];
  }
  
  // Auto-manage isSold status based on credentials availability
  const hasValidCredentials = this.credentials.length > 0;
  
  // If account has valid credentials but is marked as sold, make it available
  if (hasValidCredentials && this.isSold) {
    console.log(`Account ${this.title}: Has credentials but was marked as sold - making available`);
    this.isSold = false;
    this.isAvailable = true;
  }
  
  // If account has no credentials but is not marked as sold, mark it as sold
  if (!hasValidCredentials && !this.isSold) {
    console.log(`Account ${this.title}: No credentials available - marking as sold`);
    this.isSold = true;
    this.isAvailable = false;
  }
  
  next();
});

module.exports = mongoose.model('Account', AccountSchema);