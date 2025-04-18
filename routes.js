// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUserByWallet,
  getUserDomains
} = require('../controllers/userController');

router.post('/', registerUser);
router.get('/:walletAddress', getUserByWallet);
router.get('/:walletAddress/domains', getUserDomains);

module.exports = router;

// routes/domainRoutes.js
const express = require('express');
const router = express.Router();
const {
  checkDomainAvailability,
  getDomain,
  getDomainSettings,
  updateDomainSettings,
  recordDomainPurchase
} = require('../controllers/domainController');

router.get('/check/:domainName', checkDomainAvailability);
router.get('/:domainName', getDomain);
router.get('/:domainName/settings', getDomainSettings);
router.put('/:domainName/settings', updateDomainSettings);
router.post('/purchase', recordDomainPurchase);

module.exports = router;

// routes/ipRoutes.js
const express = require('express');
const router = express.Router();
const {
  getIpRecord,
  recordIpAllocation
} = require('../controllers/ipController');

router.get('/:ipAddress', getIpRecord);
router.post('/', recordIpAllocation);

module.exports = router;

// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const {
  getWalletTransactions,
  getDomainTransactions,
  createTransaction,
  updateTransactionStatus
} = require('../controllers/transactionController');

router.get('/wallet/:walletAddress', getWalletTransactions);
router.get('/domain/:domainName', getDomainTransactions);
router.post('/', createTransaction);
router.put('/:transactionHash', updateTransactionStatus);

module.exports = router;
