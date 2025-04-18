// controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Domain = require('../models/Domain');

// @desc    Register or update user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { walletAddress, email, username } = req.body;

  if (!walletAddress) {
    res.status(400);
    throw new Error('Wallet address is required');
  }

  // Check if user exists
  const userExists = await User.findOne({ walletAddress });

  if (userExists) {
    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { walletAddress },
      { email, username, lastLogin: Date.now() },
      { new: true }
    );
    
    res.status(200).json(updatedUser);
  } else {
    // Create user
    const user = await User.create({
      walletAddress,
      email,
      username,
      lastLogin: Date.now()
    });

    if (user) {
      res.status(201).json(user);
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  }
});

// @desc    Get user by wallet address
// @route   GET /api/users/:walletAddress
// @access  Public
const getUserByWallet = asyncHandler(async (req, res) => {
  const user = await User.findOne({ walletAddress: req.params.walletAddress });
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get domains by owner
// @route   GET /api/users/:walletAddress/domains
// @access  Public
const getUserDomains = asyncHandler(async (req, res) => {
  const domains = await Domain.find({ ownerAddress: req.params.walletAddress });
  res.json(domains);
});

module.exports = {
  registerUser,
  getUserByWallet,
  getUserDomains
};

// controllers/domainController.js
const asyncHandler = require('express-async-handler');
const Domain = require('../models/Domain');
const DomainSetting = require('../models/DomainSetting');
const Transaction = require('../models/Transaction');
const { getSuiClient } = require('../utils/suiClient');

// @desc    Check domain availability
// @route   GET /api/domains/check/:domainName
// @access  Public
const checkDomainAvailability = asyncHandler(async (req, res) => {
  const { domainName } = req.params;
  
  // Check local database first
  const domainExists = await Domain.findOne({ domainName });
  
  if (domainExists) {
    return res.json({ name: domainName, available: false });
  }
  
  // If not in database, check on-chain
  try {
    const suiClient = getSuiClient();
    // This is a placeholder - you'll need to implement the actual call to your smart contract
    // using moveCall or similar methods from the Sui SDK
    
    // For now, let's assume it's available if not in our local DB
    return res.json({ name: domainName, available: true });
  } catch (error) {
    console.error('Error checking domain on chain:', error);
    res.status(500);
    throw new Error('Error checking domain availability on blockchain');
  }
});

// @desc    Get domain by name
// @route   GET /api/domains/:domainName
// @access  Public
const getDomain = asyncHandler(async (req, res) => {
  const domain = await Domain.findOne({ domainName: req.params.domainName });
  
  if (domain) {
    res.json(domain);
  } else {
    res.status(404);
    throw new Error('Domain not found');
  }
});

// @desc    Get domain settings
// @route   GET /api/domains/:domainName/settings
// @access  Public
const getDomainSettings = asyncHandler(async (req, res) => {
  const settings = await DomainSetting.findOne({ domainName: req.params.domainName });
  
  if (settings) {
    res.json(settings);
  } else {
    res.json({ domainName: req.params.domainName, dnsRecords: {}, privacyEnabled: false, autoRenew: false, customMetadata: {} });
  }
});

// @desc    Update domain settings
// @route   PUT /api/domains/:domainName/settings
// @access  Private
const updateDomainSettings = asyncHandler(async (req, res) => {
  const { dnsRecords, privacyEnabled, autoRenew, customMetadata } = req.body;
  const { domainName } = req.params;
  
  // Check if domain exists
  const domain = await Domain.findOne({ domainName });
  
  if (!domain) {
    res.status(404);
    throw new Error('Domain not found');
  }
  
  // Check if user is domain owner
  if (domain.ownerAddress !== req.body.walletAddress) {
    res.status(403);
    throw new Error('You do not have permission to update this domain');
  }
  
  // Find and update or create settings
  let settings = await DomainSetting.findOne({ domainName });
  
  if (settings) {
    settings = await DomainSetting.findOneAndUpdate(
      { domainName },
      { dnsRecords, privacyEnabled, autoRenew, customMetadata },
      { new: true }
    );
  } else {
    settings = await DomainSetting.create({
      domainName,
      dnsRecords,
      privacyEnabled,
      autoRenew,
      customMetadata
    });
  }
  
  res.json(settings);
});

// @desc    Record domain purchase
// @route   POST /api/domains/purchase
// @access  Public
const recordDomainPurchase = asyncHandler(async (req, res) => {
  const { domainName, ipAddress, ownerAddress, transactionHash, amount } = req.body;
  
  // Create domain record
  const domain = await Domain.create({
    domainName,
    ipAddress,
    ownerAddress,
    transactionHash,
    purchaseDate: Date.now(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  });
  
  // Create transaction record
  const transaction = await Transaction.create({
    transactionHash,
    transactionType: 'PURCHASE',
    fromAddress: ownerAddress,
    domainName,
    amount,
    status: 'CONFIRMED'
  });
  
  res.status(201).json({ domain, transaction });
});

module.exports = {
  checkDomainAvailability,
  getDomain,
  getDomainSettings,
  updateDomainSettings,
  recordDomainPurchase
};

// controllers/ipController.js
const asyncHandler = require('express-async-handler');
const IpRecord = require('../models/IpRecord');

// @desc    Get IP record details
// @route   GET /api/ips/:ipAddress
// @access  Public
const getIpRecord = asyncHandler(async (req, res) => {
  const ipRecord = await IpRecord.findOne({ ipAddress: req.params.ipAddress });
  
  if (ipRecord) {
    res.json(ipRecord);
  } else {
    res.status(404);
    throw new Error('IP record not found');
  }
});

// @desc    Record new IP allocation
// @route   POST /api/ips
// @access  Public
const recordIpAllocation = asyncHandler(async (req, res) => {
  const { ipAddress, websiteCode, ownerAddress } = req.body;
  
  // Check if IP already exists
  const ipExists = await IpRecord.findOne({ ipAddress });
  
  if (ipExists) {
    res.status(400);
    throw new Error('IP address already allocated');
  }
  
  // Create IP record
  const ipRecord = await IpRecord.create({
    ipAddress,
    websiteCode,
    ownerAddress
  });
  
  res.status(201).json(ipRecord);
});

module.exports = {
  getIpRecord,
  recordIpAllocation
};

// controllers/transactionController.js
const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');

// @desc    Get all transactions for a wallet
// @route   GET /api/transactions/wallet/:walletAddress
// @access  Public
const getWalletTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ 
    $or: [
      { fromAddress: req.params.walletAddress },
      { toAddress: req.params.walletAddress }
    ]
  }).sort({ timestamp: -1 });
  
  res.json(transactions);
});

// @desc    Get all transactions for a domain
// @route   GET /api/transactions/domain/:domainName
// @access  Public
const getDomainTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ 
    domainName: req.params.domainName 
  }).sort({ timestamp: -1 });
  
  res.json(transactions);
});

// @desc    Record a new transaction
// @route   POST /api/transactions
// @access  Public
const createTransaction = asyncHandler(async (req, res) => {
  const { 
    transactionHash, 
    transactionType, 
    fromAddress, 
    toAddress, 
    domainName, 
    amount, 
    status 
  } = req.body;
  
  // Create transaction
  const transaction = await Transaction.create({
    transactionHash,
    transactionType,
    fromAddress,
    toAddress,
    domainName,
    amount,
    status: status || 'PENDING'
  });
  
  res.status(201).json(transaction);
});

// @desc    Update transaction status
// @route   PUT /api/transactions/:transactionHash
// @access  Public
const updateTransactionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const transaction = await Transaction.findOneAndUpdate(
    { transactionHash: req.params.transactionHash },
    { status },
    { new: true }
  );
  
  if (transaction) {
    res.json(transaction);
  } else {
    res.status(404);
    throw new Error('Transaction not found');
  }
});

module.exports = {
  getWalletTransactions,
  getDomainTransactions,
  createTransaction,
  updateTransactionStatus
};
