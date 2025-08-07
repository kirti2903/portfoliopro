const request = require('supertest');
const app = require('./test-server');

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn()
  }
}));

const { pool } = require('../config/database');

describe('Transactions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/transactions', () => {
    it('should return all transactions', async () => {
      const mockTransactions = [
        { id: 1, asset_name: 'Apple Inc.', transaction_type: 'Buy', quantity: 10, price: 150, transaction_date: '2023-01-15' },
        { id: 2, asset_name: 'Tesla Inc.', transaction_type: 'Sell', quantity: 5, price: 180, transaction_date: '2023-02-20' }
      ];
      pool.execute.mockResolvedValue([mockTransactions]);

      const response = await request(app).get('/api/transactions');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTransactions);
    });

    it('should handle database errors', async () => {
      pool.execute.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/transactions');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const newTransaction = {
        asset_name: 'Tesla Inc.',
        transaction_type: 'Buy',
        quantity: 5,
        price: 200,
        transaction_date: '2023-02-20'
      };
      pool.execute.mockResolvedValue([{ insertId: 1 }]);

      const response = await request(app)
        .post('/api/transactions')
        .send(newTransaction);
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Transaction created successfully');
      expect(response.body.id).toBe(1);
    });

    it('should validate transaction type', async () => {
      const invalidTransaction = {
        asset_name: 'Tesla Inc.',
        transaction_type: 'Invalid',
        quantity: 5,
        price: 200,
        transaction_date: '2023-02-20'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(invalidTransaction);
      
      expect(response.status).toBe(500);
    });

    it('should validate required fields', async () => {
      const invalidTransaction = {
        asset_name: '',
        transaction_type: 'Buy'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(invalidTransaction);
      
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete a transaction', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app).delete('/api/transactions/1');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Transaction deleted successfully');
    });

    it('should return 404 for non-existent transaction', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 0 }]);

      const response = await request(app).delete('/api/transactions/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Transaction not found');
    });
  });
});