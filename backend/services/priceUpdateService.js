const { pool } = require('../config/database');

class PriceUpdateService {
  constructor() {
    this.isRunning = false;
  }

  // Simulate real-time price updates
  async updatePrices() {
    try {
      const [assets] = await pool.execute('SELECT * FROM predefined_assets');
      
      for (const asset of assets) {
        // Generate realistic price fluctuation (-2% to +2%)
        const fluctuation = (Math.random() - 0.5) * 0.04; // -2% to +2%
        const newPrice = asset.current_price * (1 + fluctuation);
        
        // Ensure minimum price of 0.01
        const finalPrice = Math.max(0.01, parseFloat(newPrice.toFixed(2)));
        
        await pool.execute(
          'UPDATE predefined_assets SET current_price = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
          [finalPrice, asset.id]
        );
      }
      
      console.log(`Updated prices for ${assets.length} assets`);
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }

  // Start price update service
  start(intervalMs = 30000) { // Update every 30 seconds
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting price update service...');
    
    // Initial update
    this.updatePrices();
    
    // Set interval for periodic updates
    this.interval = setInterval(() => {
      this.updatePrices();
    }, intervalMs);
  }

  // Stop price update service
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('Price update service stopped');
  }
}

module.exports = new PriceUpdateService();