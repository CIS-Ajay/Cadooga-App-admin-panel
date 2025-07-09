// src/components/Modals/CreateAdminModal.jsx
import React, { useState } from 'react';
import { AdminService } from '../../services/adminService';
import '../../styles/CreateAdminModal.css';

const CreateAdminModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    legal_first_name: '',
    legal_last_name: '',
    role: 1, // Admin role is always 1
    is_email_verified: 1 // Auto-verify admin emails
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate form
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Prepare data for submission (exclude confirmPassword as it's not needed for API)
    const submitData = { ...formData };
    delete submitData.confirmPassword;

    setLoading(true);

    try {
      console.log('Creating admin account with data:', submitData);
      const response = await AdminService.createAdmin(submitData);
      
      if (response.success) {
        setMessage('Admin created successfully!');
        // Reset form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          legal_first_name: '',
          legal_last_name: '',
          role: 1,
          is_email_verified: 1
        });
        
        // Notify parent component
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(response.data);
            onClose();
          }, 1500);
        }
      } else {
        setError(response.message || 'Failed to create admin');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

      if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{backgroundColor: 'white', borderRadius: '8px', maxWidth: '450px', width: '90%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden'}}>
        {/* Header section with icon and title */}
        <div className="modal-header" style={{padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e8e8'}}>
          <div className="modal-header-left" style={{display: 'flex', alignItems: 'center'}}>
            <div className="modal-icon" style={{backgroundColor: '#f1f3f4', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#5f6368"/>
              </svg>
            </div>
            <h2 style={{margin: 0, fontSize: '20px', fontWeight: 500, color: '#202124'}}>Create Admin Account</h2>
          </div>
          <div className="modal-close" onClick={onClose} style={{cursor: 'pointer', padding: '4px'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#9AA0A6"/>
            </svg>
          </div>
        </div>
        
        <div className="modal-body" style={{padding: '16px'}}>
          {/* Instruction text */}
          <p className="instruction-text" style={{color: '#5f6368', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5'}}>
            Enter the information below to create a new admin account.
          </p>
          
          {error && <div className="error-message" style={{backgroundColor: '#fdeded', color: '#d93025', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px'}}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon" style={{height: '32px'}}>
                <div className="input-icon" style={{width: '32px', height: '32px'}}>
                  <svg width="16" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 0H2C0.9 0 0.00999999 0.9 0.00999999 2L0 14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z" fill="#9AA0A6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  required
                  className="form-input"
                  style={{height: '32px', fontSize: '13px', padding: '4px 8px'}}
                />
              </div>
            </div>
            
            {/* First Name Field */}
            <div className="form-group">
              <label htmlFor="legal_first_name">First Name</label>
              <div className="input-with-icon" style={{height: '32px'}}>
                <div className="input-icon" style={{width: '32px', height: '32px'}}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 10C12.21 10 14 8.21 14 6C14 3.79 12.21 2 10 2C7.79 2 6 3.79 6 6C6 8.21 7.79 10 10 10ZM10 12C6.67 12 0 13.56 0 17V18C0 18.55 0.45 19 1 19H19C19.55 19 20 18.55 20 18V17C20 13.56 13.33 12 10 12Z" fill="#9AA0A6"/>
                  </svg>
                </div>
                <input
                  type="text"
                  id="legal_first_name"
                  name="legal_first_name"
                  value={formData.legal_first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  className="form-input"
                  style={{height: '32px', fontSize: '13px', padding: '4px 8px'}}
                />
              </div>
            </div>
            
            {/* Last Name Field */}
            <div className="form-group">
              <label htmlFor="legal_last_name">Last Name</label>
              <div className="input-with-icon" style={{height: '32px'}}>
                <div className="input-icon" style={{width: '32px', height: '32px'}}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 10C12.21 10 14 8.21 14 6C14 3.79 12.21 2 10 2C7.79 2 6 3.79 6 6C6 8.21 7.79 10 10 10ZM10 12C6.67 12 0 13.56 0 17V18C0 18.55 0.45 19 1 19H19C19.55 19 20 18.55 20 18V17C20 13.56 13.33 12 10 12Z" fill="#9AA0A6"/>
                  </svg>
                </div>
                <input
                  type="text"
                  id="legal_last_name"
                  name="legal_last_name"
                  value={formData.legal_last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="form-input"
                  style={{height: '32px', fontSize: '13px', padding: '4px 8px'}}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon" style={{height: '32px'}}>
                <div className="input-icon" style={{width: '32px', height: '32px'}}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 14C11.1 14 12 13.1 12 12C12 10.9 11.1 10 10 10C8.9 10 8 10.9 8 12C8 13.1 8.9 14 10 14ZM16 5H15V4C15 1.79 13.21 0 11 0H9C6.79 0 5 1.79 5 4V5H4C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H16C17.1 19 18 18.1 18 17V7C18 5.9 17.1 5 16 5ZM7 4C7 2.9 7.9 2 9 2H11C12.1 2 13 2.9 13 4V5H7V4ZM16 17H4V7H16V17Z" fill="#9AA0A6"/>
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  required
                  className="form-input"
                  style={{height: '32px', fontSize: '13px', padding: '4px 8px'}}
                />
              </div>
            </div>
            
            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon" style={{height: '32px'}}>
                <div className="input-icon" style={{width: '32px', height: '32px'}}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 14C11.1 14 12 13.1 12 12C12 10.9 11.1 10 10 10C8.9 10 8 10.9 8 12C8 13.1 8.9 14 10 14ZM16 5H15V4C15 1.79 13.21 0 11 0H9C6.79 0 5 1.79 5 4V5H4C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H16C17.1 19 18 18.1 18 17V7C18 5.9 17.1 5 16 5ZM7 4C7 2.9 7.9 2 9 2H11C12.1 2 13 2.9 13 4V5H7V4ZM16 17H4V7H16V17Z" fill="#9AA0A6"/>
                  </svg>
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  className="form-input"
                  style={{height: '32px', fontSize: '13px', padding: '4px 8px'}}
                />
              </div>
            </div>
            
            {/* Email Verified Checkbox */}
            <div className="checkbox-container">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="is_email_verified"
                  name="is_email_verified"
                  checked={formData.is_email_verified === 1}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">Email Verified</span>
              </label>
            </div>
            
            <p className="info-text" style={{color: '#5f6368', fontSize: '13px', marginTop: '10px', marginBottom: '24px', lineHeight: '1.4'}}>
              A verified admin account will have full permissions to manage users and settings.
            </p>
            
            <div className="form-actions" style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px'}}>
              <button 
                type="submit" 
                className="primary-button"
                disabled={loading}
                style={{
                  height: '56px', 
                  width: '200px', 
                  minWidth: '200px',
                  borderRadius: '28px', 
                  fontSize: '16px',
                  backgroundColor: '#4dabf7',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '12px'}}>
                  <path d="M16 7L19 10L16 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create Admin
              </button>
              <button 
                type="button" 
                className="cancel-button" 
                onClick={onClose}
                style={{
                  height: '56px', 
                  width: '200px', 
                  minWidth: '200px',
                  borderRadius: '28px', 
                  fontSize: '16px',
                  backgroundColor: 'white',
                  color: '#202124',
                  border: '1px solid #202124',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '12px'}}>
                  <path d="M18 6L6 18" stroke="#202124" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="#202124" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminModal;