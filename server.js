const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express
const app = express();

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/domains', require('./routes/domainRoutes'));
app.use('/api/ips', require('./routes/ipRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Error handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Create blockchain event listener (optional - for syncing with the blockchain)
const startBlockchainSync = async () => {
  try {
    // Implement blockchain event listening/sync logic here
    console.log('Blockchain sync service started');
  } catch (error) {
    console.error('Error starting blockchain sync:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Uncomment to start blockchain sync
  // startBlockchainSync();
});
