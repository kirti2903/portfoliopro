const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createDatabase } = require('./config/database');
const priceUpdateService = require('./services/priceUpdateService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/assets', require('./routes/assets'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/predefined-assets', require('./routes/predefinedAssets'));
app.use('/api/market', require('./routes/market'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Portfolio Management API is running!' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await createDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Database initialized with sample data!');
      
      // Start price update service
      priceUpdateService.start();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  priceUpdateService.stop();
  process.exit(0);
});

startServer();

module.exports = app;