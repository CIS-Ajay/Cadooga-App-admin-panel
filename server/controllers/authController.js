// server/controllers/authController.js - Fixed version without last_login references

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

/**
 * User login (for AuthContext)
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Auth login attempt for:', email);
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user (admin or regular user) - REMOVED last_login from SELECT
    const sql = `
      SELECT id, email, password, legal_first_name, legal_last_name, role, is_email_verified, created_at, updated_at
      FROM users 
      WHERE email = ? AND deleted_at IS NULL
    `;
    
    const [user] = await query(sql, [email]);
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // OPTIONAL: Update last login (only if you added the column)
    // Uncomment the next line if you added the last_login column
    // await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-default-secret-key',
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...userData } = user;
    
    console.log('User login successful:', email);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
    
  } catch (error) {
    console.error('Auth login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Get user profile (for token verification)
 */
exports.profile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // REMOVED last_login from SELECT
    const sql = `
      SELECT id, email, legal_first_name, legal_last_name, role, is_email_verified, created_at
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `;
    
    const [user] = await query(sql, [userId]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Logout (optional - mainly handled on frontend)
 */
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};