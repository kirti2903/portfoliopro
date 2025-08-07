const request = require('supertest');
const app = require('../server');

jest.mock('../config/database', () => ({
  execute: jest.fn()
}));

const pool = require('../config/database');

describe('Transactions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/transactions', () => {
    it('should return all transactions', async () => {
      const mockTransactions = [
        { id: 1, asset_name: 'Apple Inc.', transaction_type: 'Buy', quantity: 10, price: 150 }
      ];
      pool.execute.mockResolvedValue([mockTransactions]);

      const response = await request(app).get('/api/transactions');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTransactions);
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
    });
  });
});