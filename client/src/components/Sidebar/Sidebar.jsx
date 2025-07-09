import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';
import logo from '../../assets/images/logo.png';

const Sidebar = ({ activePage = 'email', onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('Sidebar - Current user:', user);
  console.log('Sidebar - User first name:', user?.legal_first_name);
  console.log('Sidebar - User last name:', user?.legal_last_name);
  console.log('Sidebar - User email:', user?.email);
  
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
            <svg 
              className="nav-icon" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 21C20 18.8783 19.1571 16.8434 17.6569 15.3431C16.1566 13.8429 14.1217 13 12 13C9.87827 13 7.84344 13.8429 6.34315 15.3431C4.84285 16.8434 4 18.8783 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">User Management</span>
          </li>
          <li 
            className={`nav-item ${activePage === 'email' ? 'active' : ''}`}
            onClick={() => handleNavigate('email')}
          >
            <svg 
              className="nav-icon" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
            <svg 
              className="nav-icon" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">Admins</span>
          </li>

          {/* <li 
            className={`nav-item ${activePage === 'bannedusers' ? 'active' : ''}`}
            onClick={() => handleNavigate('bannedusers')}
          >
            <span className="nav-text">banned-users</span>
          </li> */}
          <li 
            className="nav-item"
            onClick={handleLogout}
          >
            <svg 
              className="nav-icon" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">Logout</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;