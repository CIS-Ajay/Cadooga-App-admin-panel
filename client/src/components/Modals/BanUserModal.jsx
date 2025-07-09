import React from 'react';
import { UserService } from '../../services/userService';
import '../../styles/UnifiedModal.css'; // Use unified CSS

const BanUserModal = ({ isOpen, onClose, userId }) => {
  if (!isOpen) return null;
  
  const handleConfirm = async () => {
    try {
      await UserService.banUser(userId);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user. Please try again.');
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ban-user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h2 className="modal-title">Ban User?</h2>
        
        <p className="modal-message">
          Are you sure you want to ban this user?<br/>
          They will be unable to login or create another<br/>
          account until the ban is removed. Continue?
        </p>
        
        <button className="confirm-button" onClick={handleConfirm}>
          Confirm
        </button>
        
        <button className="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BanUserModal;