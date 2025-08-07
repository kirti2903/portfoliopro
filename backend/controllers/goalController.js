const { pool } = require('../config/database');

const goalController = {
  // Get all goals
  getAllGoals: async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM goals ORDER BY created_at DESC');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new goal
  createGoal: async (req, res) => {
    try {
      const { goal_name, target_amount, target_date } = req.body;
      const [result] = await pool.execute(
        'INSERT INTO goals (goal_name, target_amount, target_date) VALUES (?, ?, ?)',
        [goal_name, target_amount, target_date]
      );
      res.status(201).json({ id: result.insertId, message: 'Goal created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update goal progress
  updateGoalProgress: async (req, res) => {
    try {
      const { current_amount } = req.body;
      const [result] = await pool.execute(
        'UPDATE goals SET current_amount = ? WHERE id = ?',
        [current_amount, req.params.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      res.json({ message: 'Goal progress updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete goal
  deleteGoal: async (req, res) => {
    try {
      const [result] = await pool.execute('DELETE FROM goals WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = goalController;