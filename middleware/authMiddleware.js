// middleware/authMiddleware.js
const asyncHandler = require('express-async-handler');

// @desc    Basic authentication middleware to verify wallet signatures
// @usage   Use for protected routes
const protectRoute = asyncHandler(async (req, res, next) => {
  // This is a placeholder for Sui wallet authentication
  // Implement proper wallet signature verification
  
  // For now, we'll just check if a wallet address was provided
  if (!req.body.walletAddress) {
    res.status(401);
    throw new Error('Not authorized, wallet address required');
  }
  
  // In a real implementation, you would:
  // 1. Get the signature from the request headers
  // 2. Verify the signature against the wallet address
  // 3. Check timestamp to prevent replay attacks
  
  next();
});

module.exports = { protectRoute };
