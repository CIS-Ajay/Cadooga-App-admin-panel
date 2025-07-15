import axios from 'axios';

const API_BASE_URL = '/api';
// const API_BASE_URI = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URI = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.0:8010/api/v1";
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://192.168.2.216:8001";

export class UserService {

  // Get use Logs
  static async getUserLogs() {
    try {
      const response = await axios.get(`${PYTHON_API_URL}/logs`);
      return response;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  }
  // sendPasswordResetEmail
  static async sendPasswordResetEmail(email) {
    try {
      const response = await axios.post(`${API_BASE_URI}/admin/send-password-reset`, { email });
      return response.data;
    } catch (error) {
      console.error(`Error sending password reset email for user ${email}:`, error);
      throw error;
    }
  }

  // Get all users with optional filters
  static async getUsers(filters = {}, page = 1, limit = 10) {
    try {
      // Convert filters to query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      // Add each filter as a query parameter
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      console.log('Making API request with params:', queryParams.toString());
      
      const response = await axios.get(`${API_BASE_URI}/admin/users?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  
  // Get user by ID
  static async getUserById(userId) {
    try {
      const response = await axios.get(`${API_BASE_URI}/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }
  
  // Update user data
  static async updateUser(userId, userData) {
    try {
      const response = await axios.put(`${API_BASE_URI}/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  }
  
  // Reset user password via token
  static async resetPassword(token, password) {
    try {
      const response = await axios.post(`${API_BASE_URI}/admin/users/reset-password`, {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      console.error(`Error resetting password using token:`, error);
      throw error;
    }
  }

  // Clear device ID
  static async clearDeviceId(userId) {
    try {
      const response = await axios.patch(`${API_BASE_URI}/admin/users/${userId}/clear-device`);
      return response.data;
    } catch (error) {
      console.error(`Error clearing device ID for user ${userId}:`, error);
      throw error;
    }
  }
  
  // Ban user
  static async banUser(userId, reason = '') {
    try {
      const response = await axios.post(`${API_BASE_URI}/admin/users/${userId}/ban`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error banning user ${userId}:`, error);
      throw error;
    }
  }
  
  // Unban user
  static async unbanUser(userId) {
    try {
      const response = await axios.post(`${API_BASE_URI}/admin/users/${userId}/unban`);
      return response.data;
    } catch (error) {
      console.error(`Error unbanning user ${userId}:`, error);
      throw error;
    }
  }
  
  // Verify user
  static async verifyUser(userId) {
    try {
      const response = await axios.post(`${API_BASE_URI}/admin/users/${userId}/verify`);
      return response.data;
    } catch (error) {
      console.error(`Error verifying user ${userId}:`, error);
      throw error;
    }
  }
  
  // Remove verification from user
  static async removeVerification(userId) {
    try {
      console.log(`Removing verification for user ${userId}`);
      const response = await axios.post(`${API_BASE_URI}/admin/users/${userId}/remove-verification`);
      return response.data;
    } catch (error) {
      console.error(`Error removing verification for user ${userId}:`, error);
      throw error;
    }
  }
  
  // Update subscription
  static async updateSubscription(userId, subscriptionType, isTrialPeriod = false) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/users/${userId}/subscription`, {
        subscriptionType,
        isTrialPeriod
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating subscription for user ${userId}:`, error);
      throw error;
    }
  }
  
  // Get user statistics
  static async getUserStats() {
    try {
      this.getUserLogs();
      const API_BASE_URI = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${API_BASE_URI}/admin/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  }
  
  // Export users to CSV
  static async exportUsers(filters = {}) {
    try {
      // Convert filters to query parameters
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      // Set up for file download
      const response = await axios.get(`${API_BASE_URI}/admin/users/export`, {
        responseType: 'blob'
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.csv');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }
  
  // Send email to user
  static async sendEmail(userId, subject, message) {
    try {
      // This is a placeholder - you would implement this based on your backend API
      const response = await axios.post(`${API_BASE_URL}/users/${userId}/email`, {
        subject,
        message
      });
      return response.data;
    } catch (error) {
      console.error(`Error sending email to user ${userId}:`, error);
      throw error;
    }
  }
  
  // FIXED: Utility method to check if a user is verified - simplify by only checking is_email_verified
  static isUserVerified(user) {
    if (!user) return false;
    return Boolean(user.is_email_verified === 1 || user.is_email_verified === true);
  }
}