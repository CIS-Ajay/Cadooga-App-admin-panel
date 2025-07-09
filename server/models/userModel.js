// server/models/userModel.js - Fixed version without account_status column
const db = require('../config/db');

/**
 * Helper function to convert month names to numbers
 */
function getMonthNumber(monthName) {
  if (!monthName || typeof monthName !== 'string') return 1;
  
  const months = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
  };
  
  return months[monthName.toLowerCase()] || 1;
}

/**
 * User model for handling user data operations
 */
class User {
  /**
   * Get all users with pagination and filtering - FIXED VERSION
   */
  static async getAllUsers(filters = {}, page = 1, limit = 10) {
    try {
      const usePagination = limit <= 500;
      const offset = usePagination ? (page - 1) * limit : 0;
      const effectiveLimit = usePagination ? limit : 10000;
      
      // Build WHERE clause - Include banned users in results
      let whereClause = ' WHERE 1=1';
      const whereParams = [];
      
      // Handle the searchTerm - search across multiple fields
      if (filters.searchTerm) {
        whereClause += ' AND (email LIKE ? OR legal_first_name LIKE ? OR legal_last_name LIKE ? OR username LIKE ? OR nickname LIKE ?)';
        const searchValue = `%${filters.searchTerm}%`;
        whereParams.push(searchValue, searchValue, searchValue, searchValue, searchValue);
      } else {
        if (filters.legalname) {
          whereClause += ' AND (legal_first_name LIKE ? OR legal_last_name LIKE ?)';
          whereParams.push(`%${filters.legalname}%`, `%${filters.legalname}%`);
        }
        
        if (filters.email) {
          whereClause += ' AND email LIKE ?';
          whereParams.push(`%${filters.email}%`);
        }
      }
      
      if (filters.subscription_type) {
        whereClause += ' AND subscription_type = ?';
        whereParams.push(filters.subscription_type);
      }
      
      // Handle account status filter using existing columns
      if (filters.account_status) {
        if (filters.account_status === 'active') {
          whereClause += ' AND deleted_at IS NULL AND theliveapp_status = 1';
        } else if (filters.account_status === 'banned') {
          whereClause += ' AND (deleted_at IS NOT NULL OR theliveapp_status = 0)';
        } else if (filters.account_status === 'closed') {
          whereClause += ' AND deleted_at IS NOT NULL';
        }
      }

      // Handle user IDs for export
      if (filters.userIds) {
        const userIdArray = filters.userIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        if (userIdArray.length > 0) {
          whereClause += ` AND id IN (${userIdArray.map(() => '?').join(',')})`;
          whereParams.push(...userIdArray);
        }
      }
      
      // Count total users
      const countSql = `SELECT COUNT(*) AS total FROM users${whereClause}`;
      const countResult = await db.query(countSql, whereParams);
      const total = countResult[0]?.total || 0;
      
      // FIXED: Get users with existing columns only (removed account_status)
      const usersSql = `
        SELECT id, email, username, legal_first_name, legal_last_name, nickname,
               birth_day, birth_month, birth_year, is_email_verified, is_verified,
               is_subscription, role, theliveapp_status, created_at, updated_at, deleted_at
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${parseInt(effectiveLimit)} OFFSET ${parseInt(offset)}
      `;
      
      console.log(`Fetching up to ${effectiveLimit} users with filters: ${JSON.stringify(filters)}`);
      
      const users = await db.query(usersSql, whereParams);
      console.log(`Retrieved ${users.length} users from database`);
      
      // Transform the data with proper status detection using existing columns
      const transformedUsers = users.map(user => {
        // Determine account status using existing columns
        let accountStatus = 'active';
        if (user.deleted_at) {
          accountStatus = 'closed';
        } else if (user.theliveapp_status === 0) {
          accountStatus = 'banned';
        }
        
        // Handle legal name
        let legalName = '';
        if (user.legal_first_name || user.legal_last_name) {
          legalName = `${user.legal_first_name || ''} ${user.legal_last_name || ''}`.trim();
        }
        
        // For pseudonym, use nickname or username
        const pseudonym = user.nickname || user.username || '';
        
        // Calculate age
        let age = null;
        if (user.birth_year) {
          const today = new Date();
          const currentYear = today.getFullYear();
          const currentMonth = today.getMonth() + 1;
          const currentDay = today.getDate();
          
          let calculatedAge = currentYear - user.birth_year;
          
          if (user.birth_month && user.birth_day) {
            const birthMonth = typeof user.birth_month === 'string' 
              ? getMonthNumber(user.birth_month) 
              : user.birth_month;
              
            if (birthMonth > currentMonth || 
                (birthMonth === currentMonth && user.birth_day > currentDay)) {
              calculatedAge--;
            }
          }
          
          age = calculatedAge > 0 ? calculatedAge : null;
        }

        // Determine subscription type
        let subscription_type = 'None';
        if (user.is_subscription === 1) {
          subscription_type = 'Premium';
        }
        
        return {
          id: user.id,
          email: user.email || '',
          username: user.username || '',
          legal_first_name: user.legal_first_name || null,
          legal_last_name: user.legal_last_name || null,
          legalname: legalName,
          nickname: user.nickname || null,
          pseudonym: pseudonym,
          birth_day: user.birth_day,
          birth_month: user.birth_month,
          birth_year: user.birth_year,
          age: age,
          role: user.role,
          is_subscription: user.is_subscription,
          subscription_type: subscription_type,
          is_email_verified: user.is_email_verified,
          is_verified: user.is_verified,
          theliveapp_status: user.theliveapp_status,
          account_status: accountStatus,
          status: accountStatus,
          created_at: user.created_at,
          updated_at: user.updated_at,
          deleted_at: user.deleted_at,
          last_login: user.updated_at,
          // Add these fields for ban detection
          is_banned: accountStatus === 'banned',
          banned: accountStatus === 'banned'
        };
      });
      
      return {
        data: transformedUsers,
        pagination: {
          total,
          page: usePagination ? page : 1,
          limit: usePagination ? limit : total,
          pages: usePagination ? Math.ceil(total / limit) : 1
        }
      };
    } catch (error) {
      console.error('Error in getAllUsers model:', error);
      throw error;
    }
  }

  /**
   * Get user by ID with related data
   */
// Updated getUserById method in userModel.js
static async getUserById(userId) {
  try {
    if (isNaN(parseInt(userId))) {
      return null;
    }
    
    // Get complete user info including face_token (device ID)
    const userSql = `
      SELECT id, email, username, legal_first_name, legal_last_name, 
             nickname, birth_day, birth_month, birth_year, gender,
             relationship_status, sexual_identity, fav_food, about_me,
             fav_place, astrology, is_verified, is_subscription, 
             face_token, is_email_verified, theliveapp_status, 
             created_at, updated_at, deleted_at
      FROM users
      WHERE id = ?
    `;
    
    const users = await db.query(userSql, [parseInt(userId)]);
    
    if (users.length === 0) {
      return null;
    }
    
    const user = users[0];
    
    // Add formatted device ID to the response
    const formattedUser = {
      ...user,
      device_id: user.face_token || null,
      formatted_device_id: user.face_token ? user.face_token.substring(0, 20) + '...' : 'No device ID'
    };
    
    console.log(`User data retrieved for ID ${userId}:`, JSON.stringify(formattedUser, null, 2));
    
    return formattedUser;
  } catch (error) {
    console.error(`Error in getUserById model for ID ${userId}:`, error);
    throw error;
  }
}
  
  /**
   * Update user data
   */
  static async updateUser(userId, userData) {
    try {
      const dbFields = {};
      
      if (userData.firstName !== undefined) {
        dbFields.legal_first_name = userData.firstName;
      }
      
      if (userData.lastName !== undefined) {
        dbFields.legal_last_name = userData.lastName;
      }
      
      if (userData.nickname !== undefined) {
        dbFields.nickname = userData.nickname;
      }
      
      Object.keys(userData).forEach(key => {
        if (!['firstName', 'lastName', 'nickname'].includes(key)) {
          if (dbFields[key] === undefined) {
            dbFields[key] = userData[key];
          }
        }
      });
      
      if (Object.keys(dbFields).length === 0) {
        return true;
      }
      
      const setParts = [];
      const values = [];
      
      Object.keys(dbFields).forEach(key => {
        setParts.push(`${key} = ?`);
        values.push(dbFields[key]);
      });
      
      setParts.push('updated_at = NOW()');
      values.push(parseInt(userId));
      
      const updateSql = `
        UPDATE users
        SET ${setParts.join(', ')}
        WHERE id = ?
      `;
      
      const result = await db.query(updateSql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error in updateUser model for ID ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Reset user password
   */
  static async resetPassword(userId, newPassword) {
    try {
      const updateSql = `
        UPDATE users
        SET password = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const result = await db.query(updateSql, [newPassword, parseInt(userId)]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error in resetPassword model for ID ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update subscription
   */
  static async updateSubscription(userId, subscriptionType, isTrialPeriod = false) {
    try {
      let is_subscription = 0;
      if (subscriptionType === 'Premium' || subscriptionType === 'Paid') {
        is_subscription = 1;
      }
      
      const updateSql = `
        UPDATE users
        SET is_subscription = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const result = await db.query(updateSql, [is_subscription, parseInt(userId)]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error in updateSubscription model for ID ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update account status using existing columns
   */
  static async updateAccountStatus(userId, status) {
    try {
      let updateSql = '';
      let values = [];
      
      if (status === 'banned') {
        // For banned users, set theliveapp_status = 0
        updateSql = `
          UPDATE users
          SET theliveapp_status = 0, updated_at = NOW()
          WHERE id = ?
        `;
        values = [parseInt(userId)];
      } else if (status === 'closed') {
        // For closed accounts, set deleted_at
        updateSql = `
          UPDATE users
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE id = ?
        `;
        values = [parseInt(userId)];
      } else if (status === 'active') {
        // For active users, clear deleted_at and set theliveapp_status = 1
        updateSql = `
          UPDATE users
          SET deleted_at = NULL, theliveapp_status = 1, updated_at = NOW()
          WHERE id = ?
        `;
        values = [parseInt(userId)];
      } else {
        return false;
      }
      
      const result = await db.query(updateSql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error in updateAccountStatus model for ID ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Clear user device ID (face_token)
   */
  static async clearDeviceId(userId) {
    try {
      const updateSql = `
        UPDATE users
        SET face_token = NULL, updated_at = NOW()
        WHERE id = ?
      `;
      
      const result = await db.query(updateSql, [parseInt(userId)]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error in clearDeviceId model for ID ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get user statistics for dashboard
   */
  static async getStats() {
    try {
      // Total users - users with deleted_at IS NULL
      const totalUsersSql = 'SELECT COUNT(*) AS count FROM users WHERE deleted_at IS NULL';
      const totalUsersResult = await db.query(totalUsersSql);
      let totalUsers = 0;
      if (totalUsersResult && totalUsersResult.length > 0) {
        if (totalUsersResult[0].count !== undefined) {
          totalUsers = parseInt(totalUsersResult[0].count);
        } else if (totalUsersResult[0]['COUNT(*)'] !== undefined) {
          totalUsers = parseInt(totalUsersResult[0]['COUNT(*)']);
        }
      }
      
      // Active subscriptions - count users with is_subscription = 1
      const activeSubscriptionsSql = 'SELECT COUNT(*) AS count FROM users WHERE is_subscription = 1 AND deleted_at IS NULL';
      const activeSubscriptionsResult = await db.query(activeSubscriptionsSql);
      let activeSubscriptions = 0;
      if (activeSubscriptionsResult && activeSubscriptionsResult.length > 0) {
        if (activeSubscriptionsResult[0].count !== undefined) {
          activeSubscriptions = parseInt(activeSubscriptionsResult[0].count);
        } else if (activeSubscriptionsResult[0]['COUNT(*)'] !== undefined) {
          activeSubscriptions = parseInt(activeSubscriptionsResult[0]['COUNT(*)']);
        }
      }
      
      // Closed accounts - users with deleted_at IS NOT NULL
      const closedAccountsSql = 'SELECT COUNT(*) AS count FROM users WHERE deleted_at IS NOT NULL';
      const closedAccountsResult = await db.query(closedAccountsSql);
      let closedAccounts = 0;
      if (closedAccountsResult && closedAccountsResult.length > 0) {
        if (closedAccountsResult[0].count !== undefined) {
          closedAccounts = parseInt(closedAccountsResult[0].count);
        } else if (closedAccountsResult[0]['COUNT(*)'] !== undefined) {
          closedAccounts = parseInt(closedAccountsResult[0]['COUNT(*)']);
        }
      }
      
      // Recent logins - we don't have a login table, so use recent updates
      const recentLoginsSql = 'SELECT COUNT(*) AS count FROM users WHERE updated_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) AND deleted_at IS NULL';
      const recentLoginsResult = await db.query(recentLoginsSql);
      let recentLogins = 0;
      if (recentLoginsResult && recentLoginsResult.length > 0) {
        if (recentLoginsResult[0].count !== undefined) {
          recentLogins = parseInt(recentLoginsResult[0].count);
        } else if (recentLoginsResult[0]['COUNT(*)'] !== undefined) {
          recentLogins = parseInt(recentLoginsResult[0]['COUNT(*)']);
        }
      }
      
      const stats = {
        totalUsers,
        activeSubscriptions,
        closedAccounts,
        recentLogins
      };
      
      console.log('Final stats computed:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getStats model:', error);
      throw error;
    }
  }
  
  /**
   * Export users to CSV - FIXED VERSION
   */
  static async exportUsersToCsv(filters = {}) {
    try {
      // FIXED: Removed account_status from SELECT
      let sql = `
        SELECT id, email, username, legal_first_name, legal_last_name, nickname,
               birth_day, birth_month, birth_year, is_subscription, 
               is_verified, theliveapp_status, created_at, updated_at, deleted_at
        FROM users
      `;
      
      const whereConditions = [];
      const values = [];
      
      if (filters.searchTerm) {
        whereConditions.push('(email LIKE ? OR legal_first_name LIKE ? OR legal_last_name LIKE ? OR username LIKE ? OR nickname LIKE ?)');
        const searchValue = `%${filters.searchTerm}%`;
        values.push(searchValue, searchValue, searchValue, searchValue, searchValue);
      } else {
        if (filters.legalname) {
          whereConditions.push('(legal_first_name LIKE ? OR legal_last_name LIKE ?)');
          values.push(`%${filters.legalname}%`, `%${filters.legalname}%`);
        }
        
        if (filters.pseudonym) {
          whereConditions.push('(nickname LIKE ? OR username LIKE ?)');
          values.push(`%${filters.pseudonym}%`, `%${filters.pseudonym}%`);
        }
        
        if (filters.email) {
          whereConditions.push('email LIKE ?');
          values.push(`%${filters.email}%`);
        }
      }

      // Handle user IDs for export
      if (filters.userIds) {
        const userIdArray = filters.userIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        if (userIdArray.length > 0) {
          whereConditions.push(`id IN (${userIdArray.map(() => '?').join(',')})`);
          values.push(...userIdArray);
        }
      }
      
      if (filters.subscription_type) {
        if (filters.subscription_type.toLowerCase() === 'paid') {
          whereConditions.push('is_subscription = 1');
        } else if (filters.subscription_type.toLowerCase() === 'free') {
          whereConditions.push('is_subscription = 0');
        }
      }
      
      if (filters.account_status) {
        if (filters.account_status.toLowerCase() === 'active') {
          whereConditions.push('deleted_at IS NULL AND theliveapp_status = 1');
        } else if (filters.account_status.toLowerCase() === 'banned') {
          whereConditions.push('theliveapp_status = 0');
        } else if (filters.account_status.toLowerCase() === 'closed') {
          whereConditions.push('deleted_at IS NOT NULL');
        }
      }
      
      if (whereConditions.length > 0) {
        sql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      sql += ' ORDER BY created_at DESC';
      
      const users = await db.query(sql, values);
      
      return users.map(user => {
        let age = null;
        if (user.birth_year) {
          const today = new Date();
          const birthYear = user.birth_year;
          const birthMonth = typeof user.birth_month === 'string' 
            ? getMonthNumber(user.birth_month) 
            : (user.birth_month || 1);
          const birthDay = user.birth_day || 1;
          
          age = today.getFullYear() - birthYear;
          
          if (today.getMonth() + 1 < birthMonth || 
              (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
            age--;
          }
          
          if (age < 0) age = null;
        }
        
        const legalname = [
          user.legal_first_name || '',
          user.legal_last_name || ''
        ].filter(Boolean).join(' ') || null;
        
        const pseudonym = user.nickname || user.username || null;
        
        // Determine status using existing columns
        let accountStatus = 'active';
        if (user.deleted_at) {
          accountStatus = 'closed';
        } else if (user.theliveapp_status === 0) {
          accountStatus = 'banned';
        }
        
        return {
          id: user.id,
          email: user.email || '',
          legalname: legalname,
          pseudonym: pseudonym,
          age: age,
          subscription_type: user.is_subscription === 1 ? 'PAID' : 'FREE',
          last_login: user.updated_at,
          account_status: accountStatus,
          created_at: user.created_at,
          last_subscribed_at: user.is_subscription === 1 ? user.created_at : null
        };
      });
    } catch (error) {
      console.error('Error in exportUsersToCsv model:', error);
      throw error;
    }
  }
  
  /**
   * Get all admin users
   */
  static async getAdminUsers() {
    try {
      const query = `
        SELECT id, email, legal_first_name, legal_last_name, 
               role, nickname, is_email_verified, is_verified, 
               created_at, updated_at
        FROM users
        WHERE role IN (0, 1) AND deleted_at IS NULL
        ORDER BY created_at DESC
      `;
      
      const admins = await db.query(query);
      console.log(`Found ${admins.length} admins in database`);
      return admins;
    } catch (error) {
      console.error('Error in getAdminUsers model:', error);
      throw error;
    }
  }
}

module.exports = User;