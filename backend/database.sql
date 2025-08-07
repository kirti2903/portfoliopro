-- Portfolio Management System Database Schema

CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Assets table
CREATE TABLE assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_name VARCHAR(100) NOT NULL,
    asset_type ENUM('Stock', 'Mutual Fund', 'Crypto') NOT NULL,
    quantity DECIMAL(10, 4) NOT NULL,
    buy_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_name VARCHAR(100) NOT NULL,
    transaction_type ENUM('Buy', 'Sell') NOT NULL,
    quantity DECIMAL(10, 4) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predefined assets table for suggestions
CREATE TABLE predefined_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type ENUM('Stock', 'Mutual Fund', 'Crypto') NOT NULL,
    current_price DECIMAL(10, 2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0,
    target_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO assets (asset_name, asset_type, quantity, buy_price, current_price, purchase_date) VALUES
('Apple Inc.', 'Stock', 10.0000, 150.00, 175.00, '2023-01-15'),
('Tesla Inc.', 'Stock', 5.0000, 200.00, 180.00, '2023-02-20'),
('Bitcoin', 'Crypto', 0.5000, 30000.00, 35000.00, '2023-03-10'),
('SBI Bluechip Fund', 'Mutual Fund', 100.0000, 50.00, 55.00, '2023-01-01');

INSERT INTO transactions (asset_name, transaction_type, quantity, price, transaction_date) VALUES
('Apple Inc.', 'Buy', 10.0000, 150.00, '2023-01-15'),
('Tesla Inc.', 'Buy', 5.0000, 200.00, '2023-02-20'),
('Bitcoin', 'Buy', 0.5000, 30000.00, '2023-03-10'),
('SBI Bluechip Fund', 'Buy', 100.0000, 50.00, '2023-01-01');

-- Insert predefined assets
INSERT INTO predefined_assets (symbol, name, type, current_price) VALUES
-- Popular Indian Stocks
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

-- Popular Mutual Funds
('SBIBLUECHIP', 'SBI Bluechip Fund', 'Mutual Fund', 55.00),
('HDFCTOP100', 'HDFC Top 100 Fund', 'Mutual Fund', 720.00),
('ICICIPRUDENTIAL', 'ICICI Prudential Bluechip Fund', 'Mutual Fund', 68.00),
('AXISLARGECAP', 'Axis Bluechip Fund', 'Mutual Fund', 45.00),
('MOTILALMIDCAP', 'Motilal Oswal Midcap Fund', 'Mutual Fund', 85.00),
('SBISMALLCAP', 'SBI Small Cap Fund', 'Mutual Fund', 125.00),
('HDFCMIDCAP', 'HDFC Mid-Cap Opportunities Fund', 'Mutual Fund', 110.00),
('ICICIELSS', 'ICICI Prudential ELSS Tax Saver', 'Mutual Fund', 520.00),

-- Popular Cryptocurrencies
('BTC', 'Bitcoin', 'Crypto', 4200000.00),
('ETH', 'Ethereum', 'Crypto', 280000.00),
('BNB', 'Binance Coin', 'Crypto', 35000.00),
('ADA', 'Cardano', 'Crypto', 45.00),
('DOT', 'Polkadot', 'Crypto', 650.00),
('MATIC', 'Polygon', 'Crypto', 85.00),
('SOL', 'Solana', 'Crypto', 8500.00),
('DOGE', 'Dogecoin', 'Crypto', 8.50);

INSERT INTO goals (goal_name, target_amount, target_date) VALUES
('Buy a Car', 500000.00, '2024-12-31'),
('Emergency Fund', 200000.00, '2024-06-30');