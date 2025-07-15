import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';
import logo from '../../assets/images/logo.png';
import {LogOutIcon, Activity, User2Icon,Users2Icon, Mail} from 'lucide-react';
const Sidebar = ({ activePage = 'email', onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
    
  // Improved admin name logic
  const getAdminName = () => {
    if (!user) {
      console.log('Sidebar - No user found, returning Administrator');
      return 'Administrator';
    }
    
    const firstName = user.legal_first_name?.trim() || '';
    const lastName = user.legal_last_name?.trim() || '';
    
    console.log('Sidebar - Processed names:', { firstName, lastName });
    
    // If we have both first and last name
    if (firstName && lastName) {
      const fullName = `${firstName} ${lastName}`;
      console.log('Sidebar - Returning full name:', fullName);
      return fullName;
    }
    
    // If we only have first name
    if (firstName) {
      console.log('Sidebar - Returning first name:', firstName);
      return firstName;
    }
    
    // If we only have last name
    if (lastName) {
      console.log('Sidebar - Returning last name:', lastName);
      return lastName;
    }
    
    // If no names are set, extract from email
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      const nameFromEmail = emailUsername
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      console.log('Sidebar - Returning name from email:', nameFromEmail);
      return nameFromEmail;
    }
    
    // Final fallback
    console.log('Sidebar - Using final fallback: Administrator');
    return 'Administrator';
  };

  const adminName = getAdminName();
  console.log('Sidebar - Final admin name to display:', adminName);

  const handleNavigate = (path) => {
    if (typeof onNavigate === 'function') {
      console.log('path:', path);
      onNavigate(path);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout from AuthContext to clear auth state
      if (logout) {
        await logout();
      }
      
      // Navigate to login page
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still try to navigate to login
      navigate('/admin/login');
    }
  };

  return (
    <div className="sidebar">
      <div className="logo-section">
        <img src={logo} alt="Cadooga Logo" className="logo-image" />
      </div>
      
      <div className="admin-info">
        <h3 className="admin-name">{adminName}</h3>
        <p className="admin-title">Administrator</p>
      </div>

      <div className="navigation-section">
        <h4 className="nav-heading">NAVIGATION</h4>
        <ul className="nav-list">
          <li 
            className={`nav-item ${activePage === 'users' ? 'active' : ''}`}
            onClick={() => handleNavigate('users')}
          >
            <User2Icon className="nav-icon"/>
            <span className="nav-text">User Management</span>
          </li>
          <li 
            className={`nav-item ${activePage === 'email' ? 'active' : ''}`}
            onClick={() => handleNavigate('email')}
          >
            <Mail className="nav-icon"/>
            <span className="nav-text">Email</span>
          </li>
        </ul>
      </div>

      <div className="extras-section">
        <h4 className="nav-heading">EXTRAS</h4>
        <ul className="nav-list">
          <li 
            className={`nav-item ${activePage === 'admins' ? 'active' : ''}`}
            onClick={() => handleNavigate('admins')}
          >
            <Users2Icon className="nav-icon"/>
            <span className="nav-text">Admins</span>
          </li>

          <li 
            className={`nav-item ${activePage === 'logs' ? 'active' : ''}`}
            onClick={() => handleNavigate('logs')}
          >
            <Activity className="nav-icon"/>
            <span className="nav-text">User Logs</span>
          </li>
          <li 
            className="nav-item"
            onClick={handleLogout}
          >
            <LogOutIcon className="nav-icon"/>
            <span className="nav-text">Logout</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;