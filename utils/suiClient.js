// utils/suiClient.js
const { getFullnodeUrl, SuiClient } = require('@mysten/sui.js/client');

// Create a Sui client instance
const getSuiClient = () => {
  return new SuiClient({ url: getFullnodeUrl('testnet') });
};

// Helper function to interact with the Domain Service contract
const DOMAIN_SERVICE_PACKAGE_ID = process.env.DOMAIN_SERVICE_PACKAGE_ID || '';
const DOMAIN_REGISTRY_ID = process.env.DOMAIN_REGISTRY_ID || '';
const IP_REGISTRY_ID = process.env.IP_REGISTRY_ID || '';

// Example function to check domain availability on-chain
const checkDomainOnChain = async (domainName) => {
  const client = getSuiClient();
  
  try {
    // This is a placeholder - implement actual contract call
    // You would need to call the check_domain function from your smart contract
    
    // For example:
    /*
    const response = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x...', // admin address or similar
    });
    */
    
    return { available: true }; // Placeholder response
  } catch (error) {
    console.error('Error checking domain on chain:', error);
    throw error;
  }
};

// Add more helper functions for different contract interactions

module.exports = {
  getSuiClient,
  checkDomainOnChain
};
