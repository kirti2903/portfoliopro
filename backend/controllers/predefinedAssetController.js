const { pool } = require('../config/database');

const predefinedAssetController = {
  // Search assets by name or symbol
  searchAssets: async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || query.trim() === '') {
        // Return all assets when no query
        const [rows] = await pool.execute(
          'SELECT * FROM predefined_assets ORDER BY name ASC'
        );
        return res.json(rows);
      }

      const [rows] = await pool.execute(
        `SELECT * FROM predefined_assets 
         WHERE name LIKE ? OR symbol LIKE ? 
         ORDER BY 
           CASE 
             WHEN symbol LIKE ? THEN 1
             WHEN name LIKE ? THEN 2
             ELSE 3
           END,
           name ASC 
         LIMIT 10`,
        [`%${query}%`, `%${query}%`, `${query}%`, `${query}%`]
      );
      
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get asset by symbol
  getAssetBySymbol: async (req, res) => {
    try {
      const { symbol } = req.params;
      const [rows] = await pool.execute(
        'SELECT * FROM predefined_assets WHERE symbol = ?',
        [symbol]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update asset price (for real-time updates)
  updateAssetPrice: async (req, res) => {
    try {
      const { symbol } = req.params;
      const { price } = req.body;
      
      const [result] = await pool.execute(
        'UPDATE predefined_assets SET current_price = ?, last_updated = CURRENT_TIMESTAMP WHERE symbol = ?',
        [parseFloat(price), symbol]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      
      res.json({ message: 'Price updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = predefinedAssetController;