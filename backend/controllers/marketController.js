const axios = require('axios');

const marketController = {
  // Get live market data
  getMarketData: async (req, res) => {
    try {
      // Using Alpha Vantage free API (replace with your API key)
      const API_KEY = 'demo'; // Get free key from https://www.alphavantage.co/support/#api-key
      
      const indices = [
        { name: 'NIFTY 50', symbol: 'NSEI', value: '19,674.25', change: '+234.50', changePercent: '+1.21%', trend: 'up' },
        { name: 'SENSEX', symbol: 'BSESN', value: '65,953.48', change: '+789.23', changePercent: '+1.21%', trend: 'up' },
        { name: 'BANK NIFTY', symbol: 'BANKNIFTY', value: '44,234.75', change: '-123.45', changePercent: '-0.28%', trend: 'down' }
      ];

      // Simulate live data with random changes
      const liveIndices = indices.map(index => {
        const change = (Math.random() - 0.5) * 500; // Random change
        const changePercent = (Math.random() - 0.5) * 4; // Random percentage
        const baseValue = parseFloat(index.value.replace(/,/g, ''));
        const newValue = baseValue + change;
        
        return {
          ...index,
          value: newValue.toLocaleString(),
          change: change >= 0 ? `+${Math.abs(change).toFixed(2)}` : `-${Math.abs(change).toFixed(2)}`,
          changePercent: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
          trend: change >= 0 ? 'up' : 'down'
        };
      });

      // Get top stocks from database
      const { pool } = require('../config/database');
      const [stocks] = await pool.execute(
        "SELECT * FROM predefined_assets WHERE type = 'Stock' ORDER BY current_price DESC LIMIT 20"
      );

      // Simulate price changes for stocks
      const liveStocks = stocks.map(stock => {
        const changePercent = (Math.random() - 0.5) * 8; // ±4% change
        const newPrice = stock.current_price * (1 + changePercent / 100);
        
        return {
          ...stock,
          current_price: newPrice,
          change: changePercent,
          trend: changePercent >= 0 ? 'up' : 'down'
        };
      });

      // Sort for gainers and losers
      const sortedStocks = [...liveStocks].sort((a, b) => b.change - a.change);
      const topGainers = sortedStocks.slice(0, 5).map(stock => ({
        name: stock.name.split(' ')[0],
        symbol: stock.symbol,
        price: stock.current_price.toFixed(2),
        change: `+${stock.change.toFixed(2)}%`
      }));

      const topLosers = sortedStocks.slice(-5).reverse().map(stock => ({
        name: stock.name.split(' ')[0],
        symbol: stock.symbol,
        price: stock.current_price.toFixed(2),
        change: `${stock.change.toFixed(2)}%`
      }));

      res.json({
        indices: liveIndices,
        topGainers,
        topLosers,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Market data error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get sector performance
  getSectorData: async (req, res) => {
    try {
      const { pool } = require('../config/database');
      
      // Get assets by type
      const [stocks] = await pool.execute("SELECT * FROM predefined_assets WHERE type = 'Stock'");
      const [mutualFunds] = await pool.execute("SELECT * FROM predefined_assets WHERE type = 'Mutual Fund'");
      const [crypto] = await pool.execute("SELECT * FROM predefined_assets WHERE type = 'Crypto'");

      // Simulate sector performance
      const sectors = [
        { name: 'Stocks', performance: (Math.random() - 0.5) * 4, count: stocks.length },
        { name: 'Mutual Funds', performance: (Math.random() - 0.5) * 2, count: mutualFunds.length },
        { name: 'Crypto', performance: (Math.random() - 0.5) * 8, count: crypto.length }
      ];

      res.json(sectors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get market news
  getMarketNews: async (req, res) => {
    try {
      const news = [
        {
          title: "Markets Rally on Strong Q3 Results",
          summary: "Nifty 50 gains as major companies report better earnings",
          time: `${Math.floor(Math.random() * 8) + 1} hours ago`,
          category: "Markets"
        },
        {
          title: "RBI Policy Decision Today",
          summary: "Central bank expected to maintain current repo rates",
          time: `${Math.floor(Math.random() * 6) + 2} hours ago`,
          category: "Policy"
        },
        {
          title: "Tech Stocks Outperform",
          summary: "IT sector leads with strong momentum in global markets",
          time: `${Math.floor(Math.random() * 4) + 3} hours ago`,
          category: "Sectors"
        },
        {
          title: "FII Inflows Continue",
          summary: "Foreign investors pump ₹3,200 crores into Indian equities",
          time: `${Math.floor(Math.random() * 12) + 1} hours ago`,
          category: "Investment"
        }
      ];
      
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = marketController;