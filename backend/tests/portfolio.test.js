const request = require('supertest');
const app = require('../server');

jest.mock('../config/database', () => ({
  execute: jest.fn()
}));

const pool = require('../config/database');

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
  });

  describe('GET /api/portfolio/distribution', () => {
    it('should return asset distribution', async () => {
      const mockAssets = [
        { asset_name: 'Apple Inc.', asset_type: 'Stock', quantity: 10, current_price: 175 }
      ];
      pool.execute.mockResolvedValue([mockAssets]);

      const response = await request(app).get('/api/portfolio/distribution');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});