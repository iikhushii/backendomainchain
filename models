// models/User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    sparse: true
  },
  username: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

module.exports = mongoose.model('User', userSchema);

// models/Domain.js
const mongoose = require('mongoose');

const domainSchema = mongoose.Schema({
  domainName: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  ownerAddress: {
    type: String,
    required: true,
    ref: 'User'
  },
  websiteCode: String,
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  transactionHash: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Domain', domainSchema);

// models/IpRecord.js
const mongoose = require('mongoose');

const ipRecordSchema = mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true
  },
  websiteCode: String,
  ownerAddress: {
    type: String,
    required: true,
    ref: 'User'
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('IpRecord', ipRecordSchema);

// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['PURCHASE', 'TRANSFER', 'ALLOT_IP', 'ASSIGN_DOMAIN', 'WITHDRAW_FEES']
  },
  fromAddress: String,
  toAddress: String,
  domainName: {
    type: String,
    ref: 'Domain'
  },
  amount: Number, // in MIST (smallest SUI unit)
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'CONFIRMED', 'FAILED'],
    default: 'PENDING'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);

// models/DomainSetting.js
const mongoose = require('mongoose');

const domainSettingSchema = mongoose.Schema({
  domainName: {
    type: String,
    required: true,
    unique: true,
    ref: 'Domain'
  },
  dnsRecords: {
    type: Object,
    default: {}
  },
  privacyEnabled: {
    type: Boolean,
    default: false
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  customMetadata: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('DomainSetting', domainSettingSchema);
