// src/services/adminService.js
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Service for handling admin-related API calls
 */
export class AdminService {
  /**
   * Get all admin users
   */
  static async getAdmins() {
    try {
      console.log('AdminService: Fetching admin users');
      
      // Get authentication token from local storage (assuming you store it there)
      const token = localStorage.getItem('token') || 'dev-token';
      
      const response = await axios.get(`${API_BASE_URL}/admin`, {
      // const response = await axios.get('/api/admin/admins', {
        headers: {
          // Authorization: `Bearer ${token}`
        }
      });
      
      console.log('AdminService: Admin fetch response:', response);
      
      if (response.data && response.status === 200) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message || 'Admins retrieved successfully'
        };
      } else {
        console.error('AdminService: Unexpected response format:', response);
        return {
          success: false,
          data: [],
          message: 'Failed to retrieve admins - unexpected response format'
        };
      }
    } catch (error) {
      console.error('AdminService: Error fetching admins:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message || 'Failed to retrieve admins'
      };
    }
  }

  /**
   * Delete admin user
   */
  static async deleteAdmin(adminId) {
    try {
      console.log(`AdminService: Deleting admin user with ID: ${adminId}`);
      
      // Get authentication token from local storage (assuming you store it there)
      const token = localStorage.getItem('token') || 'dev-token';
      const response = await axios.delete(`${API_BASE_URL}/admins/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('AdminService: Admin deletion response:', response);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Admin deleted successfully'
        };
      } else {
        console.error('AdminService: Admin deletion failed:', response.data);
        return {
          success: false,
          message: response.data?.message || 'Failed to delete admin'
        };
      }
    } catch (error) {
      console.error('AdminService: Error deleting admin:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete admin'
      };
    }
  }

  /**
   * Create a new admin user
   * @param {Object} adminData - Admin user data
   * @returns {Object} Response object with success status and message
   */
  static async createAdmin(adminData) {
    try {
      console.log('AdminService: Creating admin user with data:', adminData);
      
      // Get authentication token from local storage
      const token = localStorage.getItem('token') || 'dev-token';
      
      const response = await axios.post(`${API_BASE_URL}/admin`, adminData, {
      // const response = await axios.post('/api/admin/admins', adminData, {
        headers: {
          // Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('AdminService: Admin creation response:', response);
      
      if (response.data && response.status === 201) {
        return {
          success: true,
          data: response.data.data || {},
          message: response.data.message || 'Admin created successfully'
        };
      } else {
        console.error('AdminService: Unexpected response format:', response);
        return {
          success: false,
          message: 'Failed to create admin - unexpected response format'
        };
      }
    } catch (error) {
      console.error('AdminService: Error creating admin:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create admin'
      };
    }
  }
}