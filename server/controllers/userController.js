// server/controllers/userController.js
const User = require('../models/userModel');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

/**
 * Controller for handling user-related operations
 */
exports.getUsers = async (req, res) => {
  try {
    console.log('getUsers controller called with query:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Extract filter parameters from query
    const filters = {
      legalname: req.query.legalname,
      email: req.query.email,
      subscription_type: req.query.subscription_type,
      account_status: req.query.account_status,
      searchTerm: req.query.searchTerm
    };

    // Only keep defined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    console.log('Applying filters:', filters);

    const result = await User.getAllUsers(filters, page, limit);
    console.log(`Returning ${result.data.length} users to client, total: ${result.pagination.total}`);
    res.json(result);
  } catch (error) {
    console.error('Error in getUsers controller:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Fetching user with ID: ${userId}`);

    // Try to get user from database
    const user = await User.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(`Error in getUserById controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    
    // Log update information for debugging
    console.log(`Updating user ${userId} with data:`, userData);
    
    // Validate user exists
    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user data
    const success = await User.updateUser(userId, userData);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to update user' });
    }
    
    // Get updated user data
    const updatedUser = await User.getUserById(userId);
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error(`Error in updateUser controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.clearDeviceId = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate user exists
    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Clear device ID
    const success = await User.clearDeviceId(userId);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to clear device ID' });
    }
    
    res.json({ message: 'Device ID cleared successfully' });
  } catch (error) {
    console.error(`Error in clearDeviceId controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    // Validate user exists
    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Reset password
    const success = await User.resetPassword(userId, newPassword);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to reset password' });
    }
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(`Error in resetPassword controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const userId = req.params.id;
    const { subscriptionType, isTrialPeriod } = req.body;
    
    // Validate required fields
    if (!subscriptionType) {
      return res.status(400).json({ message: 'Subscription type is required' });
    }
    
    // Validate user exists
    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update subscription
    const success = await User.updateSubscription(userId, subscriptionType, isTrialPeriod);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to update subscription' });
    }
    
    const updatedUser = await User.getUserById(userId);
    res.json({ 
      message: `Subscription updated to ${subscriptionType}${isTrialPeriod ? ' (trial)' : ''}`,
      user: updatedUser
    });
  } catch (error) {
    console.error(`Error in updateSubscription controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAccountStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({ message: 'Account status is required' });
    }
    
    // Validate status value
    const validStatuses = ['active', 'banned', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Status must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Validate user exists
    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update account status
    const success = await User.updateAccountStatus(userId, status);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to update account status' });
    }
    
    const message = status === 'banned' ? 'User banned successfully' : 
                   status === 'active' ? 'User account restored successfully' :
                   'User account status updated successfully';
                   
    res.json({ message });
  } catch (error) {
    console.error(`Error in updateAccountStatus controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.exportUsers = async (req, res) => {
  try {
    // Extract filter parameters from query
    const filters = {
      legalname: req.query.legalname,
      pseudonym: req.query.pseudonym,
      email: req.query.email,
      subscription_type: req.query.subscription_type,
      account_status: req.query.account_status,
      expired: req.query.expired === 'true',
      closed: req.query.closed === 'true'
    };
    
    // Only keep defined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    console.log('Exporting users with filters:', filters);
    
    // Get users based on filters
    const users = await User.exportUsersToCsv(filters);
    
    // Format dates in user data
    const formattedUsers = users.map(user => {
      return {
        id: user.id,
        email: user.email,
        legalname: user.legalname,
        pseudonym: user.pseudonym,
        age: user.age,
        subscription_type: user.subscription_type,
        last_login: user.last_login ? new Date(user.last_login).toISOString() : '',
        account_status: user.account_status,
        created_at: user.created_at ? new Date(user.created_at).toISOString() : '',
        last_subscribed_at: user.last_subscribed_at ? new Date(user.last_subscribed_at).toISOString() : ''
      };
    });
    
    // Create CSV writer
    const csvStringifier = createCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'email', title: 'Email' },
        { id: 'legalname', title: 'Legal Name' },
        { id: 'pseudonym', title: 'Pseudonym' },
        { id: 'age', title: 'Age' },
        { id: 'subscription_type', title: 'Subscription Type' },
        { id: 'last_login', title: 'Last Login' },
        { id: 'account_status', title: 'Account Status' },
        { id: 'created_at', title: 'Created At' },
        { id: 'last_subscribed_at', title: 'Last Subscribed At' }
      ]
    });
    
    // Generate CSV
    const csvHeader = csvStringifier.getHeaderString();
    const csvContent = csvStringifier.stringifyRecords(formattedUsers);
    const csv = csvHeader + csvContent;
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    
    // Send CSV response
    res.send(csv);
  } catch (error) {
    console.error('Error in exportUsers controller:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    console.log('getUserStats controller called');
    // Use the User model method to get stats
    const stats = await User.getStats();
    console.log('Stats from model:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error in getUserStats controller:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Ban a user
 */
exports.banUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason = 'Banned by admin' } = req.body;
    
    console.log(`Attempting to ban user ${userId} with reason: ${reason}`);
    
    // Validate user exists
    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Ban the user by updating account status
    const success = await User.updateAccountStatus(userId, 'banned');
    
    if (!success) {
      return res.status(400).json({ 
        success: false,
        message: 'Failed to ban user' 
      });
    }
    
    console.log(`User ${userId} banned successfully`);
    res.json({ 
      success: true,
      message: 'User banned successfully' 
    });
  } catch (error) {
    console.error(`Error in banUser controller for ID ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Unban a user
 */
exports.unbanUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    console.log(`Attempting to unban user ${userId}`);
    
    // Validate user exists
    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Unban the user by updating account status to active
    const success = await User.updateAccountStatus(userId, 'active');
    
    if (!success) {
      return res.status(400).json({ 
        success: false,
        message: 'Failed to unban user' 
      });
    }
    
    console.log(`User ${userId} unbanned successfully`);
    res.json({ 
      success: true,
      message: 'User unbanned successfully' 
    });
  } catch (error) {
    console.error(`Error in unbanUser controller for ID ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Verify a user - Updated to only use is_email_verified
 */
exports.verifyUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate user exists
    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update only the is_email_verified field
    const success = await User.updateUser(userId, { 
      is_email_verified: true 
    });
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to verify user' });
    }
    
    res.json({ message: 'User verified successfully' });
  } catch (error) {
    console.error(`Error in verifyUser controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Remove verification from a user - Updated to only use is_email_verified
 */
exports.removeVerification = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate user exists
    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update only the is_email_verified field
    const success = await User.updateUser(userId, { 
      is_email_verified: false 
    });
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to remove verification' });
    }
    
    res.json({ message: 'User verification removed successfully' });
  } catch (error) {
    console.error(`Error in removeVerification controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};