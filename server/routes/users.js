// server/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes with specific non-parameterized paths MUST come BEFORE /:id routes
// GET all users (this should come before /:id)
router.get('/', userController.getUsers);

// GET user stats (this MUST come before /:id)
router.get('/stats', userController.getUserStats);

// Export users to CSV (also must come before /:id)
router.get('/export', userController.exportUsers);

// NOW the parameterized routes
// GET user by ID
router.get('/:id', userController.getUserById);

// UPDATE user by ID
router.put('/:id', userController.updateUser);

// PATCH user by ID (partial update)
router.patch('/:id', userController.updateUser);

// Reset password
router.patch('/:id/reset-password', userController.resetPassword);
router.post('/:id/reset-password', userController.resetPassword);

// Update subscription
router.patch('/:id/subscription', userController.updateSubscription);

// Update account status
router.patch('/:id/status', userController.updateAccountStatus);

// Clear device ID
router.patch('/:id/clear-device', userController.clearDeviceId);

// Ban user route
router.patch('/:id/ban', userController.banUser);
router.post('/:id/ban', userController.banUser);

// Unban user route
router.patch('/:id/unban', userController.unbanUser);
router.post('/:id/unban', userController.unbanUser);

// Verify user route
router.patch('/:id/verify', userController.verifyUser);
router.post('/:id/verify', userController.verifyUser);

// Remove verification route
router.patch('/:id/remove-verification', userController.removeVerification);
router.post('/:id/remove-verification', userController.removeVerification);

module.exports = router;