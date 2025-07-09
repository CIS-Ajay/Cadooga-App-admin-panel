// server/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const db = require('../config/db');

// Log all requests to this router for debugging
router.use((req, res, next) => {
  console.log(`Admin route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Admin auth route (no auth middleware needed)
router.post('/login', adminController.login);

// Admin user management routes
router.get('/admins', auth, async (req, res) => {
  try {
    console.log('GET /admin/admins route called');
    adminController.getAdmins(req, res);
  } catch (error) {
    console.error('Error in GET /admins route:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in GET /admins route',
      error: error.message
    });
  }
});

// Create admin route
router.post('/admins', auth, async (req, res) => {
  try {
    console.log('POST /admin/admins route called');
    adminController.createAdmin(req, res);
  } catch (error) {
    console.error('Error in POST /admins route:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in POST /admins route',
      error: error.message
    });
  }
});

router.delete('/admins/:id', auth, async (req, res) => {
  try {
    console.log(`DELETE /admin/admins/${req.params.id} route called`);
    adminController.deleteAdmin(req, res);
  } catch (error) {
    console.error('Error in DELETE /admins/:id route:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in DELETE /admins/:id route',
      error: error.message
    });
  }
});

// Health check endpoint - useful for verifying routes are loaded correctly
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Add a default handler for any undefined routes to prevent blank screens
router.get('/', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is working'
  });
});

module.exports = router;