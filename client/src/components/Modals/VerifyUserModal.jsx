import React, { useState } from 'react';
import { UserService } from '../../services/userService';
import verifyBadge from '../../assets/images/161bfb158d0d27623bac419785a0653dce42834a.png';
import '../../styles/UnifiedModal.css'; // Use unified CSS

const VerifyUserModal = ({ isOpen, onClose, userId, userEmail }) => {
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const handleVerify = async () => {
    try {
      setLoading(true);
      await UserService.verifyUser(userId);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('Failed to verify user. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="verify-modal-overlay" onClick={onClose}>
      <div className="verify-user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="verify-close-button" onClick={onClose}>×</button>
        
        <div className="verify-icon">
          <img 
            src={verifyBadge} 
            alt="Verification Badge" 
            className="verify-badge-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="verify-checkmark-circle" style={{display: 'none'}}>
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white" />
            </svg>
          </div>
        </div>
        
        <h2 className="verify-modal-title">Verify User</h2>
        
        <div className="verify-modal-message">
          To confirm this user's verification and<br/>
          apply a badge to their profile, click verify.
        </div>
        
        <button className="verify-button" onClick={handleVerify} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        
        <button className="cancel-button" onClick={onClose} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VerifyUserModal;