import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          error.response.status === 401 &&
          error.response.data.message === 'jwt expired'
        ) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => axios.interceptors.response.eject(interceptor);
  }, []); // Add [] to run once only


  // Set axios default header with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);
  
  // Check if user is logged in
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/profile`);
        
        // Check if the user is an admin (role 0 or 1)
        console.log('response.data.role:', response.data.role);
        console.log('response.data:', response.data);
        if (response.data && (response.data.data.role === 0 || response.data.data.role === 1)) {
          setUser(response.data.data);
        } else {
          // Not an admin, log them out
          console.warn('Non-admin user attempted to access admin area');
          logout();
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      // const response = await axios.post('/api/auth/login', { email, password });
      const response = await axios.post(`${API_BASE_URL}/admin/login`, { email, password });
      console.log('response:', response);
      
      const { token, user } = response.data.data;
      // Check if user is an admin (role 0 or 1)
      if (user && (user.role === 0 || user.role === 1)) {
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Update state
        setToken(token);
        setUser(user);
          
        return response.data.data;
      } else {
        // Not an admin, throw error
        setError('Access denied. Admin privileges required.');
        throw new Error('Access denied. Admin privileges required.');
      }
    } catch (error) {
      console.error('AuthContext login error:', error);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Update state
    setToken(null);
    setUser(null);
  };
  
  // Check if user is super admin
  const isSuperAdmin = () => {
    return user && user.role === 0;
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return user && (user.role === 0 || user.role === 1);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      error,
      login, 
      logout, 
      isAuthenticated: !!token && !!user,
      isSuperAdmin,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};