const request = require('supertest');
const app = require('../server');

// Mock the database
jest.mock('../config/database', () => ({
  execute: jest.fn()
}));

const pool = require('../config/database');

describe('Assets API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/assets', () => {
    it('should return all assets', async () => {
      const mockAssets = [
        { id: 1, asset_name: 'Apple Inc.', asset_type: 'Stock', quantity: 10, buy_price: 150, current_price: 175 }
      ];
      pool.execute.mockResolvedValue([mockAssets]);

      const response = await request(app).get('/api/assets');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAssets);
    });
  });

  describe('POST /api/assets', () => {
    it('should create a new asset', async () => {
      const newAsset = {
        asset_name: 'Tesla Inc.',
        asset_type: 'Stock',
        quantity: 5,
        buy_price: 200,
        current_price: 180,
        purchase_date: '2023-02-20'
      };
      pool.execute.mockResolvedValue([{ insertId: 1 }]);

      const response = await request(app)
        .post('/api/assets')
        .send(newAsset);
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Asset created successfully');
    });
  });

  describe('PUT /api/assets/:id', () => {
    it('should update an asset', async () => {
      const updatedAsset = {
        asset_name: 'Apple Inc.',
        asset_type: 'Stock',
        quantity: 15,
        buy_price: 150,
        current_price: 180,
        purchase_date: '2023-01-15'
      };
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .put('/api/assets/1')
        .send(updatedAsset);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Asset updated successfully');
    });
  });

  describe('DELETE /api/assets/:id', () => {
    it('should delete an asset', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app).delete('/api/assets/1');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Asset deleted successfully');
    });
  });
});