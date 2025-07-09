// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
require('dotenv').config();

/**
 * Authentication middleware for protecting routes
 * Verifies JWT token and ensures user is an admin (role 0 or 1)
 */
module.exports = async (req, res, next) => {
  try {
    console.log('Checking authentication...');
    
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    // Check if the header has the right format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('Invalid token format');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }
    
    const token = parts[1];
    
    // For development environment - accept dev-token if enabled
    if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_TOKEN === 'true' && token === 'dev-token') {
      console.log('Using development authentication token');
      req.user = {
        id: 1,
        email: 'admin@cadooga.com',
        role: 0, // Super admin for development
        isAdmin: true
      };
      return next();
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user data to request
      req.user = decoded;
      
      // Verify user still exists and is an admin
      const [user] = await query(
        'SELECT id, role FROM users WHERE id = ? AND (role = 0 OR role = 1) AND deleted_at IS NULL',
        [decoded.id]
      );
      
      if (!user) {
        console.log(`User ID ${decoded.id} no longer exists or is not an admin`);
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Check if user has admin privileges
      if (user.role !== 0 && user.role !== 1) {
        console.log(`User ID ${decoded.id} does not have admin role`);
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      // Add isAdmin helper property
      req.user.isAdmin = true;
      req.user.isSuperAdmin = user.role === 0;
      
      console.log(`Authentication successful for admin ID: ${decoded.id}`);
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('Token expired');
        return res.status(401).json({
          success: false,
          message: 'Session expired, please login again'
        });
      }
      
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};