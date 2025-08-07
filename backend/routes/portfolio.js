const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

router.get('/summary', portfolioController.getPortfolioSummary);
router.get('/distribution', portfolioController.getAssetDistribution);
router.get('/metrics', portfolioController.getRealTimeMetrics);

module.exports = router;