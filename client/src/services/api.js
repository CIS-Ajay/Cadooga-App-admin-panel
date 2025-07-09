import axios from 'axios';

// Set base URL for API
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// User services
export const UserService = {
  // Log initialization message
  init: () => {
    console.log('UserService initialized with base URL:', axios.defaults.baseURL);
  },
  // Get all users with optional filters and pagination
  getUsers: async (filters = {}, page = 1, limit = 10) => {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    }).toString();
    
    const response = await axios.get(`/api/users?${queryParams}`);
    return response.data;
  },
  
  // Get user by ID
  getUserById: async (id) => {
    const response = await axios.get(`/api/users/${id}`);
    return response.data;
  },
  
  // Update user details
  updateUser: async (id, userData) => {
    const response = await axios.put(`/api/users/${id}`, userData);
    return response.data;
  },
  
  // Clear device ID
  clearDeviceId: async (id) => {
    const response = await axios.patch(`/api/users/${id}/clear-device`);
    return response.data;
  },
  
  // Reset password
  resetPassword: async (id, newPassword) => {
    const response = await axios.patch(`/api/users/${id}/reset-password`, { newPassword });
    return response.data;
  },
  
  // Update subscription
  updateSubscription: async (id, subscriptionType, isTrialPeriod = false) => {
    const response = await axios.patch(`/api/users/${id}/subscription`, { 
      subscriptionType, 
      isTrialPeriod 
    });
    return response.data;
  },
  
  // Update account status (ban/restore)
  updateAccountStatus: async (id, status) => {
    const response = await axios.patch(`/api/users/${id}/status`, { status });
    return response.data;
  },
  
  // Export users to CSV
  exportUsers: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    window.open(`/api/users/export?${queryParams}`, '_blank');
  }
};