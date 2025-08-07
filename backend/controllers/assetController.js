const { pool } = require('../config/database');

const assetController = {
  // Get all assets
  getAllAssets: async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM assets ORDER BY created_at DESC');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get asset by ID
  getAssetById: async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM assets WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new asset
  createAsset: async (req, res) => {
    try {
      const { asset_name, asset_type, quantity, buy_price, current_price, purchase_date } = req.body;
      const [result] = await pool.execute(
        'INSERT INTO assets (asset_name, asset_type, quantity, buy_price, current_price, purchase_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [asset_name, asset_type, parseFloat(quantity), parseFloat(buy_price), parseFloat(current_price), purchase_date]
      );
      res.status(201).json({ id: result.insertId, message: 'Asset created successfully', timestamp: Date.now() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update asset
  updateAsset: async (req, res) => {
    try {
      const { asset_name, asset_type, quantity, buy_price, current_price, purchase_date } = req.body;
      
      console.log('Updating asset:', req.params.id, req.body);
      
      const [result] = await pool.execute(
        'UPDATE assets SET asset_name = ?, asset_type = ?, quantity = ?, buy_price = ?, current_price = ?, purchase_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [asset_name, asset_type, parseFloat(quantity), parseFloat(buy_price), parseFloat(current_price), purchase_date, req.params.id]
      );
      
      console.log('Update result:', result);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      res.json({ message: 'Asset updated successfully', timestamp: Date.now() });
    } catch (error) {
      console.error('Asset update error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete asset
  deleteAsset: async (req, res) => {
    try {
      const [result] = await pool.execute('DELETE FROM assets WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      res.json({ message: 'Asset deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = assetController;