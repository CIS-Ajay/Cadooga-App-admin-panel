import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, useAuth } from '../../context/AuthContext';

import './Header.css';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Admin name logic to match original screenshot
  const getAdminName = () => {
    if (!user) return 'Glenne Headly'; // Default from original screenshot
    
    const firstName = user.legal_first_name?.trim() || '';
    const lastName = user.legal_last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    if (firstName) {
      return firstName;
    }
    
    if (lastName) {
      return lastName;
    }
    
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      return emailUsername
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return 'Glenne Headly';
  };

  // Handle avatar click - navigate to admin detail page
  const handleAvatarClick = () => {
    // Navigate to admin detail page using the current user's ID or a default admin ID
    const adminId = user?.id || 1; // Use current user ID or default to 1
    navigate(`/admin/users/${adminId}`);
  };

  return (
    <div className="header">
      <div className="header-content">
        {/* Profile section on the LEFT */}
        <div className="profile-section">
          <div className="avatar" onClick={handleAvatarClick}>
            {/* Empty avatar - no initials */}
          </div>
          <span className="admin-name">{getAdminName()}</span>
          <span className="dropdown-arrow">▼</span>
        </div>
        
        {/* Notification icons on the RIGHT */}
        <div className="notification-icons">
          <div className="mail-icon">
            <span className="notification-badge">1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;