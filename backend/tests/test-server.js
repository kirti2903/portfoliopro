const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/assets', require('../routes/assets'));
app.use('/api/transactions', require('../routes/transactions'));
app.use('/api/portfolio', require('../routes/portfolio'));
app.use('/api/goals', require('../routes/goals'));

module.exports = app;