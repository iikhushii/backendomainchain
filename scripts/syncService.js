// scripts/syncService.js
// This is a separate script you can run to sync blockchain events with your database

const { SuiClient } = require('@mysten/sui.js/client');
const { getFullnodeUrl } = require('@mysten/sui.js/client');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load models
const Domain = require('../models/Domain');
const IpRecord = require('../models/IpRecord');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sui-dns');
    console.log('MongoDB connected');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// SUI Client setup
const client = new SuiClient({
  url: getFullnodeUrl('testnet')
});

// Package and object IDs
const PACKAGE_ID = process.env.DOMAIN_SERVICE_PACKAGE_ID;
const DOMAIN_REGISTRY_ID = process.env.DOMAIN_REGISTRY_ID;
const IP_REGISTRY_ID = process.env.IP_REGISTRY_ID;

// Process domain assigned event
const processDomainAssignedEvent = async (event) => {
  try {
    const { domain_name, ip_address, owner } = event.parsedJson;
    
    // Create or update domain record
    await Domain.findOneAndUpdate(
      { domainName: domain_name },
      {
        domainName: domain_name,
        ipAddress: ip_address,
        ownerAddress: owner,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`Domain record updated: ${domain_name}`);
  } catch (error) {
    console.error(`Error processing DomainAssigned event: ${error.message}`);
  }
};

// Process IP allotted event
const processIPAllottedEvent = async (event) => {
  try {
    const { ip_address, owner } = event.parsedJson;
    
    // Create or update IP record
    await IpRecord.findOneAndUpdate(
      { ipAddress: ip_address },
      {
        ipAddress: ip_address,
        ownerAddress: owner,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`IP record updated: ${ip_address}`);
  } catch (error) {
    console.error(`Error processing IPAllotted event: ${error.message}`);
  }
};

// Process domain purchased event
const processDomainPurchasedEvent = async (event) => {
  try {
    const { domain_name, new_owner, price } = event.parsedJson;
    
    // Update domain ownership
    const domain = await Domain.findOneAndUpdate(
      { domainName: domain_name },
      { 
        ownerAddress: new_owner,
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    if (!domain) {
      console.log(`Domain not found in database: ${domain_name}, creating...`);
      // You might want to fetch more details from the blockchain here
    }
    
    // Record transaction
    await Transaction.create({
      transactionHash: event.id.txDigest,
      transactionType: 'PURCHASE',
      toAddress: new_owner,
      domainName: domain_name,
      amount: price,
      status: 'CONFIRMED'
    });
    
    console.log(`Domain purchase recorded: ${domain_name}`);
  } catch (error) {
    console.error(`Error processing DomainPurchased event: ${error.message}`);
  }
};

// Fetch and process events
const syncEvents = async () => {
  try {
    console.log('Starting event sync...');
    
    // Get domain assigned events
    const domainAssignedEvents = await client.getEvents({
      query: { MoveEventType: `${PACKAGE_ID}::domainservice::DomainAssigned` }
    });
    
    // Get IP allotted events
    const ipAllottedEvents = await client.getEvents({
      query: { MoveEventType: `${PACKAGE_ID}::domainservice::IPAllotted` }
    });
    
    // Get domain purchased events
    const domainPurchasedEvents = await client.getEvents({
      query: { MoveEventType: `${PACKAGE_ID}::domainservice::DomainPurchased` }
    });
    
    // Process events
    console.log(`Processing ${domainAssignedEvents.data.length} domain assigned events`);
    for (const event of domainAssignedEvents.data) {
      await processDomainAssignedEvent(event);
    }
    
    console.log(`Processing ${ipAllottedEvents.data.length} IP allotted events`);
    for (const event of ipAllottedEvents.data) {
      await processIPAllottedEvent(event);
    }
    
    console.log(`Processing ${domainPurchasedEvents.data.length} domain purchased events`);
    for (const event of domainPurchasedEvents.data) {
      await processDomainPurchasedEvent(event);
    }
    
    console.log('Event sync completed');
  } catch (error) {
    console.error(`Error syncing events: ${error.message}`);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await syncEvents();
  
  // Set up interval for continuous syncing
  setInterval(async () => {
    await syncEvents();
  }, 60000); // Run every minute
};

// Run the sync service
main().catch(console.error);
