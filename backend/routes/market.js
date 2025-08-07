const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

// Get live market data
router.get('/data', marketController.getMarketData);

// Get sector performance
router.get('/sectors', marketController.getSectorData);

// Get market news
router.get('/news', marketController.getMarketNews);

module.exports = router;