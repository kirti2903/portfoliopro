const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection without database first
const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);
    
    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_name VARCHAR(100) NOT NULL,
        asset_type ENUM('Stock', 'Mutual Fund', 'Crypto') NOT NULL,
        quantity DECIMAL(10, 4) NOT NULL,
        buy_price DECIMAL(10, 2) NOT NULL,
        current_price DECIMAL(10, 2) NOT NULL,
        purchase_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_name VARCHAR(100) NOT NULL,
        transaction_type ENUM('Buy', 'Sell') NOT NULL,
        quantity DECIMAL(10, 4) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_name VARCHAR(100) NOT NULL,
        target_amount DECIMAL(12, 2) NOT NULL,
        current_amount DECIMAL(12, 2) DEFAULT 0,
        target_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert sample data if tables are empty
    const [assetRows] = await connection.query('SELECT COUNT(*) as count FROM assets');
    if (assetRows[0].count === 0) {
      await connection.query(`
        INSERT INTO assets (asset_name, asset_type, quantity, buy_price, current_price, purchase_date) VALUES
        ('Apple Inc.', 'Stock', 10.0000, 150.00, 175.00, '2023-01-15'),
        ('Tesla Inc.', 'Stock', 5.0000, 200.00, 180.00, '2023-02-20'),
        ('Bitcoin', 'Crypto', 0.5000, 30000.00, 35000.00, '2023-03-10'),
        ('SBI Bluechip Fund', 'Mutual Fund', 100.0000, 50.00, 55.00, '2023-01-01')
      `);

      await connection.query(`
        INSERT INTO transactions (asset_name, transaction_type, quantity, price, transaction_date) VALUES
        ('Apple Inc.', 'Buy', 10.0000, 150.00, '2023-01-15'),
        ('Tesla Inc.', 'Buy', 5.0000, 200.00, '2023-02-20'),
        ('Bitcoin', 'Buy', 0.5000, 30000.00, '2023-03-10'),
        ('SBI Bluechip Fund', 'Buy', 100.0000, 50.00, '2023-01-01')
      `);

      await connection.query(`
        INSERT INTO goals (goal_name, target_amount, target_date) VALUES
        ('Buy a Car', 500000.00, '2024-12-31'),
        ('Emergency Fund', 200000.00, '2024-06-30')
      `);
    }

    await connection.end();
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup error:', error.message);
    process.exit(1);
  }
};

// Create pool with database
const pool = mysql.createPool({
  ...dbConfig,
  database: process.env.DB_NAME
});

module.exports = { pool, createDatabase };