const { pool } = require('../config/database');

const portfolioController = {
  // Get portfolio summary with real-time calculations
  getPortfolioSummary: async (req, res) => {
    try {
      const [assets] = await pool.execute('SELECT * FROM assets ORDER BY updated_at DESC');
      
      let totalInvestment = 0;
      let currentValue = 0;
      
      assets.forEach(asset => {
        const investment = parseFloat(asset.quantity) * parseFloat(asset.buy_price);
        const value = parseFloat(asset.quantity) * parseFloat(asset.current_price);
        totalInvestment += investment;
        currentValue += value;
      });
      
      const totalProfitLoss = currentValue - totalInvestment;
      const roi = totalInvestment > 0 ? ((totalProfitLoss / totalInvestment) * 100) : 0;
      
      res.json({
        totalInvestment: totalInvestment.toFixed(2),
        currentValue: currentValue.toFixed(2),
        totalProfitLoss: totalProfitLoss.toFixed(2),
        roi: roi.toFixed(2),
        totalAssets: assets.length,
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get asset distribution for charts with real-time data
  getAssetDistribution: async (req, res) => {
    try {
      const [assets] = await pool.execute('SELECT asset_name, asset_type, quantity, current_price, buy_price FROM assets ORDER BY updated_at DESC');
      
      const distribution = assets.map(asset => {
        const value = parseFloat(asset.quantity) * parseFloat(asset.current_price);
        const investment = parseFloat(asset.quantity) * parseFloat(asset.buy_price);
        const profitLoss = value - investment;
        
        return {
          name: asset.asset_name,
          type: asset.asset_type,
          value: value.toFixed(2),
          quantity: parseFloat(asset.quantity),
          price: parseFloat(asset.current_price),
          profitLoss: profitLoss.toFixed(2)
        };
      });
      
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get real-time portfolio metrics
  getRealTimeMetrics: async (req, res) => {
    try {
      const [assets] = await pool.execute('SELECT * FROM assets');
      const [transactions] = await pool.execute('SELECT COUNT(*) as total_transactions FROM transactions');
      
      let totalInvestment = 0;
      let currentValue = 0;
      let topPerformer = null;
      let worstPerformer = null;
      let maxGain = -Infinity;
      let maxLoss = Infinity;
      
      assets.forEach(asset => {
        const investment = asset.quantity * asset.buy_price;
        const value = asset.quantity * asset.current_price;
        const gain = value - investment;
        const gainPercent = investment > 0 ? (gain / investment) * 100 : 0;
        
        totalInvestment += investment;
        currentValue += value;
        
        if (gainPercent > maxGain) {
          maxGain = gainPercent;
          topPerformer = { name: asset.asset_name, gain: gainPercent };
        }
        
        if (gainPercent < maxLoss) {
          maxLoss = gainPercent;
          worstPerformer = { name: asset.asset_name, loss: gainPercent };
        }
      });
      
      res.json({
        totalInvestment: totalInvestment.toFixed(2),
        currentValue: currentValue.toFixed(2),
        totalProfitLoss: (currentValue - totalInvestment).toFixed(2),
        roi: totalInvestment > 0 ? (((currentValue - totalInvestment) / totalInvestment) * 100).toFixed(2) : '0.00',
        totalAssets: assets.length,
        totalTransactions: transactions[0].total_transactions,
        topPerformer: topPerformer,
        worstPerformer: worstPerformer,
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = portfolioController;