const request = require('supertest');
const app = require('./test-server');

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn()
  }
}));

const { pool } = require('../config/database');

describe('Portfolio API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/portfolio/summary', () => {
    it('should return portfolio summary', async () => {
      const mockAssets = [
        { quantity: 10, buy_price: 150, current_price: 175 },
        { quantity: 5, buy_price: 200, current_price: 180 }
      ];
      pool.execute.mockResolvedValue([mockAssets]);

      const response = await request(app).get('/api/portfolio/summary');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalInvestment');
      expect(response.body).toHaveProperty('currentValue');
      expect(response.body).toHaveProperty('totalProfitLoss');
      expect(response.body).toHaveProperty('roi');
    });

    it('should handle empty portfolio', async () => {
      pool.execute.mockResolvedValue([[]]);

      const response = await request(app).get('/api/portfolio/summary');
      
      expect(response.status).toBe(200);
      expect(response.body.totalInvestment).toBe('0.00');
      expect(response.body.currentValue).toBe('0.00');
      expect(response.body.totalProfitLoss).toBe('0.00');
      expect(response.body.roi).toBe('0.00');
    });

    it('should handle database errors', async () => {
      pool.execute.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/portfolio/summary');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/portfolio/distribution', () => {
    it('should return asset distribution', async () => {
      const mockDistribution = [
        { name: 'Apple Inc.', value: '10500.00' },
        { name: 'Tesla Inc.', value: '7000.00' }
      ];
      pool.execute.mockResolvedValue([mockDistribution]);

      const response = await request(app).get('/api/portfolio/distribution');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDistribution);
    });

    it('should handle empty distribution', async () => {
      pool.execute.mockResolvedValue([[]]);

      const response = await request(app).get('/api/portfolio/distribution');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle database errors', async () => {
      pool.execute.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/portfolio/distribution');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/portfolio/metrics', () => {
    it('should return real-time metrics', async () => {
      const mockAssets = [{ quantity: 10, buy_price: 100, current_price: 110, asset_name: 'Test' }];
      const mockTransactions = [{ total_transactions: 5 }];
      pool.execute.mockResolvedValueOnce([mockAssets]).mockResolvedValueOnce([mockTransactions]);

      const response = await request(app).get('/api/portfolio/metrics');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalInvestment');
      expect(response.body).toHaveProperty('currentValue');
      expect(response.body).toHaveProperty('totalAssets');
    });
  });
});