import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import AdminLogin from './components/admin/AdminLogin';
import Dashboard from './components/admin/Dashboard';
import BannedUsers from './components/admin/BannedUsers';
import EmailPage from './components/admin/EmailPage';
import AdminSettings from './components/admin/AdminSettings';
import HomePage from './components/admin/HomePage';
import AdminPage from './components/admin/AdminPage';
import UserDetailsPage from './components/UserDetails/UserDetailsPage';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Show the protected component if authenticated
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected admin routes - Pages with their own layout */}
          <Route path="/admin/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users/:userId" element={
            <ProtectedRoute>
              <UserDetailsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/email" element={
            <ProtectedRoute>
              <EmailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/admins" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route
            path="/admin/banned-users"
            element={
              <ProtectedRoute>
                <BannedUsers />
              </ProtectedRoute>
            }
          />

          {/* Protected admin routes - Pages using AdminLayout wrapper */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* <Route path="/admin/banned-users" element={
            <ProtectedRoute>
              <AdminLayout>
                <BannedUsers />
              </AdminLayout>
            </ProtectedRoute>
          } /> */}
          
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Redirect routes */}
          <Route path="/admin" element={<Navigate to="/admin/home" replace />} />
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admins" element={<Navigate to="/admin/admins" replace />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;