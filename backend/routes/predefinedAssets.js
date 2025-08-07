const express = require('express');
const router = express.Router();
const predefinedAssetController = require('../controllers/predefinedAssetController');

// Search assets
router.get('/search', predefinedAssetController.searchAssets);

// Get asset by symbol
router.get('/:symbol', predefinedAssetController.getAssetBySymbol);

// Update asset price
router.put('/:symbol/price', predefinedAssetController.updateAssetPrice);

module.exports = router;