import React, { useState } from 'react';
import { UserService } from '../../services/userService';
import '../../styles/UnifiedModal.css'; // Use unified CSS

const UnbanUserModal = ({ isOpen, onClose, userId, userEmail }) => {
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const handleConfirm = async () => {
    try {
      setLoading(true);
      await UserService.unbanUser(userId);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="unban-modal-overlay" onClick={onClose}>
      <div className="unban-user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="unban-close-button" onClick={onClose}>×</button>
        
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h2 className="unban-modal-title">Unban User?</h2>
        
        <div className="unban-modal-message">
          Are you sure you want to remove this ban?<br/>
          This user will be able to use<br/>
          the app normally again.
        </div>
        
        <button className="confirm-button" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Processing...' : 'Confirm'}
        </button>
        
        <button className="cancel-button" onClick={onClose} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UnbanUserModal;