// server/controllers/adminController.js
const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Admin login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login attempt for:', email);
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find admin user - removed last_login from SELECT
    const sql = `
      SELECT id, email, password, legal_first_name, legal_last_name, role, is_email_verified
      FROM users 
      WHERE email = ? AND (role = 0 OR role = 1) AND deleted_at IS NULL
    `;
    
    const [admin] = await query(sql, [email]);
    
    if (!admin) {
      console.log('Admin not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      console.log('Invalid password for admin:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role 
      },
      process.env.JWT_SECRET || 'your-default-secret-key',
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...adminData } = admin;
    
    console.log('Admin login successful:', email);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: adminData
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Get all admin users
 */
exports.getAdminUsers = async (req, res) => {
  try {
    console.log('Fetching admin users...');
    
    // Fixed query - removed last_login reference
    const sql = `
      SELECT id, email, legal_first_name, legal_last_name, 
             role, is_email_verified, created_at, updated_at
      FROM users 
      WHERE (role = 0 OR role = 1) AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    
    const adminUsers = await query(sql);
    
    // Map the data to include a full name property for convenience
    const formattedUsers = adminUsers.map(user => ({
      ...user,
      fullName: `${user.legal_first_name || ''} ${user.legal_last_name || ''}`.trim() || 'Unnamed Admin'
    }));
    
    console.log(`Found ${formattedUsers.length} admin users`);
    
    res.json({
      success: true,
      data: formattedUsers,
      message: 'Admin users retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get admin user by ID
 */
exports.getAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching admin user with ID: ${id}`);
    
    // Removed last_login from SELECT
    const sql = `
      SELECT id, email, legal_first_name, legal_last_name, 
             role, is_email_verified, created_at, updated_at
      FROM users 
      WHERE id = ? AND (role = 0 OR role = 1) AND deleted_at IS NULL
    `;
    
    const [admin] = await query(sql, [id]);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    // Format the admin user data
    const formattedAdmin = {
      ...admin,
      fullName: `${admin.legal_first_name || ''} ${admin.legal_last_name || ''}`.trim() || 'Unnamed Admin'
    };
    
    res.json({
      success: true,
      data: formattedAdmin,
      message: 'Admin user retrieved successfully'
    });
  } catch (error) {
    console.error(`Error fetching admin user with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new admin user
 */
exports.createAdminUser = async (req, res) => {
  try {
    const { email, password, legal_first_name, legal_last_name } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Check if email already exists
    const checkSql = 'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL';
    const existingUsers = await query(checkSql, [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new admin user
    const insertSql = `
      INSERT INTO users (
        email, 
        password, 
        legal_first_name, 
        legal_last_name, 
        role, 
        is_email_verified, 
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 1, 1, NOW(), NOW())
    `;
    
    const result = await query(
      insertSql, 
      [email, hashedPassword, legal_first_name || null, legal_last_name || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: result.insertId,
        email
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update admin user
 */
exports.updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { legal_first_name, legal_last_name, email } = req.body;
    
    // Ensure the user exists and is an admin
    const [admin] = await query(
      'SELECT id, role FROM users WHERE id = ? AND (role = 0 OR role = 1) AND deleted_at IS NULL',
      [id]
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    // Any admin can update other admins
    
    // Check if email is being changed and if it's already in use
    if (email) {
      const [existingUser] = await query(
        'SELECT id FROM users WHERE email = ? AND id != ? AND deleted_at IS NULL',
        [email, id]
      );
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }
    
    // Build update query dynamically
    let updateSql = 'UPDATE users SET updated_at = NOW()';
    const values = [];
    
    if (legal_first_name !== undefined) {
      updateSql += ', legal_first_name = ?';
      values.push(legal_first_name || null);
    }
    
    if (legal_last_name !== undefined) {
      updateSql += ', legal_last_name = ?';
      values.push(legal_last_name || null);
    }
    
    if (email) {
      updateSql += ', email = ?';
      values.push(email);
    }
    
    // Add WHERE clause and execute if there are updates
    if (values.length > 0) {
      updateSql += ' WHERE id = ?';
      values.push(id);
      
      await query(updateSql, values);
    }
    
    res.json({
      success: true,
      message: 'Admin user updated successfully'
    });
  } catch (error) {
    console.error(`Error updating admin user with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete admin user (soft delete)
 */
exports.deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the user exists and is an admin
    const [admin] = await query(
      'SELECT id, role FROM users WHERE id = ? AND (role = 0 OR role = 1) AND deleted_at IS NULL',
      [id]
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    // Prevent users from deleting themselves
    if (admin.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Soft delete the user
    await query(
      'UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Admin user deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting admin user with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Reset admin user password
 */
exports.resetAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }
    
    // Ensure the user exists and is an admin
    const [admin] = await query(
      'SELECT id, role FROM users WHERE id = ? AND (role = 0 OR role = 1) AND deleted_at IS NULL',
      [id]
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    // Any admin can reset passwords
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    await query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, id]
    );
    
    res.json({
      success: true,
      message: 'Admin user password reset successfully'
    });
  } catch (error) {
    console.error(`Error resetting password for admin user with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset admin user password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Alias methods to match the route calls
exports.getAdmins = exports.getAdminUsers;
exports.createAdmin = exports.createAdminUser;
exports.deleteAdmin = exports.deleteAdminUser;