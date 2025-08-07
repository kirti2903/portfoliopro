const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
  if (err) {
    console.error('Error creating database:', err.message);
    return;
  }
  console.log('Database created successfully!');
  
  connection.query(`USE ${process.env.DB_NAME}`, (err) => {
    if (err) {
      console.error('Error using database:', err.message);
      return;
    }
    
    // Create tables and insert data
    const queries = [
      `CREATE TABLE IF NOT EXISTS assets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_name VARCHAR(100) NOT NULL,
        asset_type ENUM('Stock', 'Mutual Fund', 'Crypto') NOT NULL,
        quantity DECIMAL(10, 4) NOT NULL,
        buy_price DECIMAL(10, 2) NOT NULL,
        current_price DECIMAL(10, 2) NOT NULL,
        purchase_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_name VARCHAR(100) NOT NULL,
        transaction_type ENUM('Buy', 'Sell') NOT NULL,
        quantity DECIMAL(10, 4) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_name VARCHAR(100) NOT NULL,
        target_amount DECIMAL(12, 2) NOT NULL,
        current_amount DECIMAL(12, 2) DEFAULT 0,
        target_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    ];
    
    queries.forEach((query, index) => {
      connection.query(query, (err) => {
        if (err) console.error(`Error creating table ${index + 1}:`, err.message);
        else console.log(`Table ${index + 1} created successfully!`);
        
        if (index === queries.length - 1) {
          // Insert sample data
          connection.query('SELECT COUNT(*) as count FROM assets', (err, results) => {
            if (!err && results[0].count === 0) {
              const sampleData = [
                `INSERT INTO assets (asset_name, asset_type, quantity, buy_price, current_price, purchase_date) VALUES
                ('Apple Inc.', 'Stock', 10.0000, 150.00, 175.00, '2023-01-15'),
                ('Tesla Inc.', 'Stock', 5.0000, 200.00, 180.00, '2023-02-20'),
                ('Bitcoin', 'Crypto', 0.5000, 30000.00, 35000.00, '2023-03-10'),
                ('SBI Bluechip Fund', 'Mutual Fund', 100.0000, 50.00, 55.00, '2023-01-01')`,
                `INSERT INTO transactions (asset_name, transaction_type, quantity, price, transaction_date) VALUES
                ('Apple Inc.', 'Buy', 10.0000, 150.00, '2023-01-15'),
                ('Tesla Inc.', 'Buy', 5.0000, 200.00, '2023-02-20'),
                ('Bitcoin', 'Buy', 0.5000, 30000.00, '2023-03-10'),
                ('SBI Bluechip Fund', 'Buy', 100.0000, 50.00, '2023-01-01')`,
                `INSERT INTO goals (goal_name, target_amount, target_date) VALUES
                ('Buy a Car', 500000.00, '2024-12-31'),
                ('Emergency Fund', 200000.00, '2024-06-30')`
              ];
              
              sampleData.forEach(query => {
                connection.query(query, (err) => {
                  if (err) console.error('Error inserting data:', err.message);
                });
              });
              
              console.log('Sample data inserted!');
            }
            connection.end();
            console.log('Setup complete! Now run: npm start');
          });
        }
      });
    });
  });
});