// server/routes/auth.js - THIS FILE IS LIKELY MISSING OR INCOMPLETE

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Log all requests to this router for debugging
router.use((req, res, next) => {
  console.log(`Auth route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', auth, authController.profile);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;