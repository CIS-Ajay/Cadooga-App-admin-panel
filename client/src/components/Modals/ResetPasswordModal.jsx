import React, { useState, useEffect } from 'react';
import { UserService } from '../../services/userService';
import '../../styles/ResetPasswordModal.css';

const ResetPasswordModal = ({ isOpen, onClose, userId, initialData = {} }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadUserData();
    }
  }, [isOpen, userId]);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // If we already have initial data, use it
      if (initialData.username || initialData.email) {
        setUsername(initialData.username || '');
        setEmail(initialData.email || '');
        setLoading(false);
        return;
      }
      
      // Otherwise fetch user details
      const userData = await UserService.getUserById(userId);
      if (userData) {
        setUsername(userData.username || userData.pseudonym || '');
        setEmail(userData.email || '');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (!email) {
      alert('Email is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to send password reset email
      await UserService.sendPasswordResetEmail(email);
      
      alert('Password reset email has been sent successfully');
      onClose();
    } catch (error) {
      console.error('Error sending password reset:', error);
      alert('Failed to send password reset email. Please try again.');
      setLoading(false);
    }
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="reset-modal-overlay" onClick={onClose}>
      <div className="reset-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reset-header-section">
          <div className="user-icon-box">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" 
                fill="#333333" />
            </svg>
          </div>
          
          <h2 className="reset-title">Reset User Password</h2>
          
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" 
                fill="#94a3b8" />
            </svg>
          </button>
        </div>
        
        <div className="reset-description">
          Confirm the user's information to generate them<br/>
          the password reset email.
        </div>
        
        <div className="form-field">
          <label>Username</label>
          <div className="input-field">
            <div className="field-icon">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" 
                  fill="#94a3b8" />
              </svg>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={true}
              readOnly
            />
            <div className="help-icon">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" 
                  fill="#94a3b8" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="form-field">
          <label>Email</label>
          <div className="input-field">
            <div className="field-icon">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" 
                  fill="#94a3b8" />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={true}
              readOnly
            />
          </div>
        </div>
        
        <div className="reset-note">
          Password reset link will be sent to this email.
        </div>
        
        <div className="action-buttons">
          <button 
            className="reset-btn"
            onClick={handleResetPassword}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M16 8v-4l8 8-8 8v-4h-8v-8h8z" fill="white" />
            </svg>
            Reset Password
          </button>
          
          <button 
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" 
                fill="#333333" />
            </svg>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;