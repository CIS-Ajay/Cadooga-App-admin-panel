// client/src/services/userService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

export const UserService = {
  // Get all users with optional filters
  async getUsers(filters = {}, page = 1, limit = 10) {
    try {
      const params = { ...filters, page, limit };
      const response = await axios.get(`${API_URL}/users`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  // Get user by ID - Updated to match the backend route structure
  async getUserById(userId) {
    try {
      console.log(`Fetching user with ID: ${userId}`);
      // Try both route patterns to handle different backend setups
      try {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        return response.data;
      } catch (firstError) {
        console.log('First route failed, trying alternate route');
        // Fall back to the alternate route if the first one fails
        const response = await axios.get(`${API_URL}/user/${userId}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },
  
  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await axios.put(`${API_URL}/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      // Try alternate route if the first one fails
      try {
        const response = await axios.put(`${API_URL}/user/${userId}`, userData);
        return response.data;
      } catch (secondError) {
        console.error(`Error updating user ${userId}:`, secondError);
        throw secondError;
      }
    }
  },
  
  // Reset password
  async resetPassword(userId, newPassword) {
    try {
      try {
        const response = await axios.patch(`${API_URL}/users/${userId}/reset-password`, { newPassword });
        return response.data;
      } catch (firstError) {
        const response = await axios.post(`${API_URL}/user/${userId}/reset-password`, { newPassword });
        return response.data;
      }
    } catch (error) {
      console.error(`Error resetting password for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Send email
  async sendEmail(userId, subject, message) {
    try {
      const response = await axios.post(`${API_URL}/user/${userId}/email`, { subject, message });
      return response.data;
    } catch (error) {
      console.error(`Error sending email to user ${userId}:`, error);
      throw error;
    }
  },
  
  // Verify user
  async verifyUser(userId) {
    try {
      try {
        const response = await axios.patch(`${API_URL}/users/${userId}`, { is_verified: true });
        return response.data;
      } catch (firstError) {
        const response = await axios.post(`${API_URL}/user/${userId}/verify`, {});
        return response.data;
      }
    } catch (error) {
      console.error(`Error verifying user ${userId}:`, error);
      throw error;
    }
  },
  
  // Ban user
  async banUser(userId) {
    try {
      try {
        const response = await axios.patch(`${API_URL}/users/${userId}/status`, { status: 'banned' });
        return response.data;
      } catch (firstError) {
        const response = await axios.post(`${API_URL}/user/${userId}/ban`, {});
        return response.data;
      }
    } catch (error) {
      console.error(`Error banning user ${userId}:`, error);
      throw error;
    }
  },
  
  // Clear device ID
  async clearDeviceId(userId) {
    try {
      try {
        const response = await axios.patch(`${API_URL}/users/${userId}/clear-device`, {});
        return response.data;
      } catch (firstError) {
        const response = await axios.post(`${API_URL}/user/${userId}/clear-device`, {});
        return response.data;
      }
    } catch (error) {
      console.error(`Error clearing device ID for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Get user stats
  async getUserStats() {
    try {
      const response = await axios.get(`${API_URL}/users/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },
  
  // Export users
  async exportUsers(filters = {}) {
    try {
      const params = { ...filters };
      window.open(`${API_URL}/users/export?${new URLSearchParams(params)}`, '_blank');
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }
};