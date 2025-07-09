// server/server.js
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const linkRoutes = require('./routes/links'); // Added link routes
const createAdminRoute = require('./routes/create-admin');

// Initialize express app
const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', createAdminRoute); 
//app.use('/api/notifications', notificationRoutes);
app.use('/api/links', linkRoutes); // Added link routes

// Root route for API status check
app.get('/api', (req, res) => {
  res.json({ message: 'Cadooga Admin API is running' });
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection on server start
  try {
    if (db.testConnection) {
      const dbConnected = await db.testConnection();
      if (dbConnected) {
        console.log('Database connected successfully');
      } else {
        console.log('Database connection failed - check your connection settings');
      }
    } else {
      console.log('Warning: testConnection function not available');
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
  }
});

module.exports = app;