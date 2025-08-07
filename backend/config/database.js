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
      CREATE TABLE IF NOT EXISTS predefined_assets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        type ENUM('Stock', 'Mutual Fund', 'Crypto') NOT NULL,
        current_price DECIMAL(10, 2) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
    const [predefinedRows] = await connection.query('SELECT COUNT(*) as count FROM predefined_assets');
    
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

    if (predefinedRows[0].count === 0) {
      await connection.query(`
        INSERT INTO predefined_assets (symbol, name, type, current_price) VALUES
        -- Top Indian Stocks
        ('RELIANCE', 'Reliance Industries Ltd', 'Stock', 2450.00),
        ('TCS', 'Tata Consultancy Services', 'Stock', 3650.00),
        ('INFY', 'Infosys Ltd', 'Stock', 1580.00),
        ('HDFCBANK', 'HDFC Bank Ltd', 'Stock', 1720.00),
        ('ICICIBANK', 'ICICI Bank Ltd', 'Stock', 980.00),
        ('SBIN', 'State Bank of India', 'Stock', 620.00),
        ('BHARTIARTL', 'Bharti Airtel Ltd', 'Stock', 890.00),
        ('ITC', 'ITC Ltd', 'Stock', 420.00),
        ('HINDUNILVR', 'Hindustan Unilever Ltd', 'Stock', 2680.00),
        ('LT', 'Larsen & Toubro Ltd', 'Stock', 3420.00),
        ('WIPRO', 'Wipro Ltd', 'Stock', 480.00),
        ('MARUTI', 'Maruti Suzuki India Ltd', 'Stock', 10200.00),
        ('BAJFINANCE', 'Bajaj Finance Ltd', 'Stock', 6850.00),
        ('ASIANPAINT', 'Asian Paints Ltd', 'Stock', 3280.00),
        ('NESTLEIND', 'Nestle India Ltd', 'Stock', 2420.00),
        ('KOTAKBANK', 'Kotak Mahindra Bank', 'Stock', 1850.00),
        ('AXISBANK', 'Axis Bank Ltd', 'Stock', 1120.00),
        ('HCLTECH', 'HCL Technologies', 'Stock', 1450.00),
        ('TECHM', 'Tech Mahindra', 'Stock', 1180.00),
        ('TITAN', 'Titan Company Ltd', 'Stock', 3200.00),
        ('ULTRACEMCO', 'UltraTech Cement', 'Stock', 8900.00),
        ('POWERGRID', 'Power Grid Corporation', 'Stock', 245.00),
        ('NTPC', 'NTPC Ltd', 'Stock', 285.00),
        ('ONGC', 'Oil & Natural Gas Corp', 'Stock', 195.00),
        ('COALINDIA', 'Coal India Ltd', 'Stock', 420.00),
        ('JSWSTEEL', 'JSW Steel Ltd', 'Stock', 890.00),
        ('TATASTEEL', 'Tata Steel Ltd', 'Stock', 145.00),
        ('HINDALCO', 'Hindalco Industries', 'Stock', 520.00),
        ('ADANIPORTS', 'Adani Ports & SEZ', 'Stock', 780.00),
        ('DRREDDY', 'Dr Reddys Laboratories', 'Stock', 5800.00),
        ('SUNPHARMA', 'Sun Pharmaceutical', 'Stock', 1150.00),
        ('CIPLA', 'Cipla Ltd', 'Stock', 1380.00),
        ('DIVISLAB', 'Divis Laboratories', 'Stock', 3850.00),
        ('BRITANNIA', 'Britannia Industries', 'Stock', 4950.00),
        ('HEROMOTOCO', 'Hero MotoCorp', 'Stock', 3200.00),
        ('BAJAJ-AUTO', 'Bajaj Auto Ltd', 'Stock', 5400.00),
        ('M&M', 'Mahindra & Mahindra', 'Stock', 1680.00),
        ('EICHERMOT', 'Eicher Motors', 'Stock', 3850.00),
        ('GRASIM', 'Grasim Industries', 'Stock', 2180.00),
        ('SHREECEM', 'Shree Cement Ltd', 'Stock', 26500.00),
        
        -- Popular Mutual Funds
        ('SBIBLUECHIP', 'SBI Bluechip Fund', 'Mutual Fund', 55.00),
        ('HDFCTOP100', 'HDFC Top 100 Fund', 'Mutual Fund', 720.00),
        ('ICICIPRUDENTIAL', 'ICICI Prudential Bluechip Fund', 'Mutual Fund', 68.00),
        ('AXISLARGECAP', 'Axis Bluechip Fund', 'Mutual Fund', 45.00),
        ('MOTILALMIDCAP', 'Motilal Oswal Midcap Fund', 'Mutual Fund', 85.00),
        ('SBISMALLCAP', 'SBI Small Cap Fund', 'Mutual Fund', 125.00),
        ('HDFCMIDCAP', 'HDFC Mid-Cap Opportunities Fund', 'Mutual Fund', 110.00),
        ('ICICIELSS', 'ICICI Prudential ELSS Tax Saver', 'Mutual Fund', 520.00),
        ('UTINIFTY', 'UTI Nifty Index Fund', 'Mutual Fund', 185.00),
        ('SBINIFTY', 'SBI Nifty Index Fund', 'Mutual Fund', 178.00),
        ('HDFCINDEX', 'HDFC Index Fund Nifty 50', 'Mutual Fund', 195.00),
        ('ICICINDEX', 'ICICI Prudential Nifty Index', 'Mutual Fund', 182.00),
        ('AXISINDEX', 'Axis Nifty 100 Index Fund', 'Mutual Fund', 42.00),
        ('DSPEQUITY', 'DSP Equity Fund', 'Mutual Fund', 95.00),
        ('FRANKLINEQUITY', 'Franklin India Equity Fund', 'Mutual Fund', 88.00),
        
        -- Major Cryptocurrencies
        ('BTC', 'Bitcoin', 'Crypto', 4200000.00),
        ('ETH', 'Ethereum', 'Crypto', 280000.00),
        ('BNB', 'Binance Coin', 'Crypto', 35000.00),
        ('ADA', 'Cardano', 'Crypto', 45.00),
        ('DOT', 'Polkadot', 'Crypto', 650.00),
        ('MATIC', 'Polygon', 'Crypto', 85.00),
        ('SOL', 'Solana', 'Crypto', 8500.00),
        ('DOGE', 'Dogecoin', 'Crypto', 8.50),
        ('XRP', 'Ripple', 'Crypto', 52.00),
        ('AVAX', 'Avalanche', 'Crypto', 2800.00),
        ('LINK', 'Chainlink', 'Crypto', 1250.00),
        ('UNI', 'Uniswap', 'Crypto', 680.00),
        ('LTC', 'Litecoin', 'Crypto', 7800.00),
        ('BCH', 'Bitcoin Cash', 'Crypto', 38000.00),
        ('ATOM', 'Cosmos', 'Crypto', 850.00)
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