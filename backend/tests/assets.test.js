const request = require('supertest');
const app = require('./test-server');

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn()
  }
}));

const { pool } = require('../config/database');

describe('Assets API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/assets', () => {
    it('should return all assets', async () => {
      const mockAssets = [
        { id: 1, asset_name: 'Apple Inc.', asset_type: 'Stock', quantity: 10, buy_price: 150, current_price: 175 },
        { id: 2, asset_name: 'Tesla Inc.', asset_type: 'Stock', quantity: 5, buy_price: 200, current_price: 180 }
      ];
      pool.execute.mockResolvedValue([mockAssets]);

      const response = await request(app).get('/api/assets');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAssets);
      expect(pool.execute).toHaveBeenCalledWith('SELECT * FROM assets ORDER BY created_at DESC');
    });

    it('should handle database errors', async () => {
      pool.execute.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/assets');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/assets/:id', () => {
    it('should return asset by id', async () => {
      const mockAsset = { id: 1, asset_name: 'Apple Inc.', asset_type: 'Stock', quantity: 10, buy_price: 150, current_price: 175 };
      pool.execute.mockResolvedValue([[mockAsset]]);

      const response = await request(app).get('/api/assets/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAsset);
    });

    it('should return 404 for non-existent asset', async () => {
      pool.execute.mockResolvedValue([[]]);

      const response = await request(app).get('/api/assets/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Asset not found');
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
      expect(response.body.id).toBe(1);
    });

    it('should validate required fields', async () => {
      const invalidAsset = {
        asset_name: '',
        asset_type: 'Stock'
      };
      pool.execute.mockRejectedValue(new Error('Validation error'));

      const response = await request(app)
        .post('/api/assets')
        .send(invalidAsset);
      
      expect(response.status).toBe(500);
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

    it('should return 404 for non-existent asset', async () => {
      const updatedAsset = {
        asset_name: 'Apple Inc.',
        asset_type: 'Stock',
        quantity: 15,
        buy_price: 150,
        current_price: 180,
        purchase_date: '2023-01-15'
      };
      pool.execute.mockResolvedValue([{ affectedRows: 0 }]);

      const response = await request(app)
        .put('/api/assets/999')
        .send(updatedAsset);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Asset not found');
    });
  });

  describe('DELETE /api/assets/:id', () => {
    it('should delete an asset', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app).delete('/api/assets/1');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Asset deleted successfully');
    });

    it('should return 404 for non-existent asset', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 0 }]);

      const response = await request(app).delete('/api/assets/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Asset not found');
    });
  });
});