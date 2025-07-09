// server/routes/create-admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Handle admin creation directly in this route
router.post('/create-admin', async (req, res) => {
  try {
    console.log('Create admin endpoint called with data:', {
      ...req.body,
      password: '[REDACTED]'
    });
    
    const { email, password, firstName, lastName, role } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    try {
      // Check if user already exists
      const checkQuery = 'SELECT id FROM users WHERE email = ?';
      const existingUsers = await db.query(checkQuery, [email]);
      
      if (existingUsers && existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Get current timestamp
      const now = new Date();
      
      // Insert new admin
      const insertQuery = `
        INSERT INTO users 
        (email, password, legal_first_name, legal_last_name, role, is_verified, is_email_verified, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await db.query(insertQuery, [
        email,
        hashedPassword,
        firstName || null,
        lastName || null,
        role || 1,
        0, // is_verified
        0, // is_email_verified
        now,
        now
      ]);
      
      console.log('Admin created with ID:', result.insertId);
      
      // Return success
      res.json({
        success: true,
        message: 'Admin created successfully',
        data: {
          id: result.insertId,
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          role: role || 1
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({
        success: false,
        message: 'Database error',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;