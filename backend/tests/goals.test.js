const request = require('supertest');
const app = require('./test-server');

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn()
  }
}));

const { pool } = require('../config/database');

describe('Goals API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/goals', () => {
    it('should return all goals', async () => {
      const mockGoals = [
        { id: 1, goal_name: 'Retirement Fund', target_amount: 1000000, current_amount: 250000, target_date: '2030-12-31' },
        { id: 2, goal_name: 'House Down Payment', target_amount: 500000, current_amount: 100000, target_date: '2025-06-30' }
      ];
      pool.execute.mockResolvedValue([mockGoals]);

      const response = await request(app).get('/api/goals');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGoals);
      expect(pool.execute).toHaveBeenCalledWith('SELECT * FROM goals ORDER BY created_at DESC');
    });

    it('should handle database errors', async () => {
      pool.execute.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/goals');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /api/goals', () => {
    it('should create a new goal', async () => {
      const newGoal = {
        goal_name: 'Emergency Fund',
        target_amount: 300000,
        target_date: '2024-12-31'
      };
      pool.execute.mockResolvedValue([{ insertId: 1 }]);

      const response = await request(app)
        .post('/api/goals')
        .send(newGoal);
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Goal created successfully');
      expect(response.body.id).toBe(1);
    });

    it('should validate required fields', async () => {
      const invalidGoal = {
        goal_name: '',
        target_amount: 0
      };

      const response = await request(app)
        .post('/api/goals')
        .send(invalidGoal);
      
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/goals/:id/progress', () => {
    it('should update goal progress', async () => {
      const progressUpdate = {
        current_amount: 75000
      };
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .put('/api/goals/1/progress')
        .send(progressUpdate);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Goal progress updated successfully');
    });

    it('should return 404 for non-existent goal', async () => {
      const progressUpdate = {
        current_amount: 75000
      };
      pool.execute.mockResolvedValue([{ affectedRows: 0 }]);

      const response = await request(app)
        .put('/api/goals/999/progress')
        .send(progressUpdate);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Goal not found');
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('should delete a goal', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app).delete('/api/goals/1');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Goal deleted successfully');
    });

    it('should return 404 for non-existent goal', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 0 }]);

      const response = await request(app).delete('/api/goals/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Goal not found');
    });
  });
});