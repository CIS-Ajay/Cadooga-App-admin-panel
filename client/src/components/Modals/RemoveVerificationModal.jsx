import React, { useState } from 'react';
import { UserService } from '../../services/userService';
import '../../styles/UnifiedModal.css'; // Use unified CSS

const RemoveVerificationModal = ({ isOpen, onClose, userId, userEmail }) => {
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const handleRemove = async () => {
    try {
      setLoading(true);
      await UserService.removeVerification(userId);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error removing verification:', error);
      alert('Failed to remove verification. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="remove-verification-modal-overlay" onClick={onClose}>
      <div className="remove-verification-modal" onClick={(e) => e.stopPropagation()}>
        <button className="remove-verification-close-button" onClick={onClose}>×</button>
        
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h2 className="remove-verification-modal-title">Remove Verification</h2>
        
        <div className="remove-verification-modal-message">
          Are you sure you want to remove this user's verification?<br/>
          They will lose their verified status and badge.
        </div>
        
        <button className="remove-verification-button" onClick={handleRemove} disabled={loading}>
          {loading ? 'Removing...' : 'Remove Verification'}
        </button>
        
        <button className="cancel-button" onClick={onClose} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RemoveVerificationModal;