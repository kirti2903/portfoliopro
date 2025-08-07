const { pool } = require('../config/database');

const transactionController = {
  // Get all transactions
  getAllTransactions: async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM transactions ORDER BY transaction_date DESC');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new transaction
  createTransaction: async (req, res) => {
    try {
      const { asset_name, transaction_type, quantity, price, transaction_date } = req.body;
      
      console.log('Creating transaction:', req.body);
      
      const [result] = await pool.execute(
        'INSERT INTO transactions (asset_name, transaction_type, quantity, price, transaction_date, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [asset_name, transaction_type, parseFloat(quantity), parseFloat(price), transaction_date]
      );
      
      console.log('Transaction created with ID:', result.insertId);
      
      res.status(201).json({ id: result.insertId, message: 'Transaction created successfully', timestamp: Date.now() });
    } catch (error) {
      console.error('Transaction creation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete transaction
  deleteTransaction: async (req, res) => {
    try {
      const [result] = await pool.execute('DELETE FROM transactions WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = transactionController;