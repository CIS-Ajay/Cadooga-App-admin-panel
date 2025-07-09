// Fixed ActionsMenu.jsx with minimal changes to the original code

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ActionsMenu.css';
import BanUserModal from '../Modals/BanUserModal';
import ResetPasswordModal from '../Modals/ResetPasswordModal';
import UnbanUserModal from '../Modals/UnbanUserModal';
import VerifyUserModal from '../Modals/VerifyUserModal';
import RemoveVerificationModal from '../Modals/RemoveVerificationModal';

const ActionsMenu = ({ userId, userEmail, username, isBanned = false, isVerified = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRemoveVerificationModal, setShowRemoveVerificationModal] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Create dropdown at the exact position needed
  const createDropdownAtPosition = () => {
    if (!buttonRef.current) return;
    
    // Create a portal element if it doesn't exist
    if (!dropdownRef.current) {
      dropdownRef.current = document.createElement('div');
      dropdownRef.current.className = 'actions-dropdown-portal';
      document.body.appendChild(dropdownRef.current);
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Check if we're in the bottom half or near the bottom
    const isNearBottom = (viewportHeight - buttonRect.bottom) < 200;
                          
    // Set up position and content
    dropdownRef.current.style.position = 'fixed'; // Use fixed to stay in same position during scroll
    dropdownRef.current.style.zIndex = '9999999'; // Ultra high z-index
    dropdownRef.current.style.background = 'white';
    dropdownRef.current.style.width = '180px';
    dropdownRef.current.style.borderRadius = '4px';
    dropdownRef.current.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    dropdownRef.current.style.border = '1px solid #e2e8f0';
    
    // Position the dropdown - staying fixed relative to the button
    if (isNearBottom) {
      // Position above the button
      dropdownRef.current.style.bottom = (viewportHeight - buttonRect.top + 5) + 'px';
      dropdownRef.current.style.top = 'auto';
    } else {
      // Position below the button
      dropdownRef.current.style.top = (buttonRect.bottom + 5) + 'px';
      dropdownRef.current.style.bottom = 'auto';
    }
    
    // Horizontal positioning
    const horizontalCenter = buttonRect.left + (buttonRect.width / 2);
    dropdownRef.current.style.left = horizontalCenter + 'px';
    dropdownRef.current.style.transform = 'translateX(-50%)';
    
    // Make sure it doesn't go off-screen horizontally
    const dropdownWidth = 180; // Width of dropdown
    if (horizontalCenter - (dropdownWidth / 2) < 5) {
      // Too far left, adjust
      dropdownRef.current.style.left = (dropdownWidth / 2 + 5) + 'px';
      dropdownRef.current.style.transform = 'translateX(-50%)';
    } else if (horizontalCenter + (dropdownWidth / 2) > viewportWidth - 5) {
      // Too far right, adjust
      dropdownRef.current.style.left = (viewportWidth - (dropdownWidth / 2) - 5) + 'px';
      dropdownRef.current.style.transform = 'translateX(-50%)';
    }
    
    // Create the HTML content for the dropdown
    dropdownRef.current.innerHTML = '';
    
    // Dropdown content with inline styles
    const dropdownItemStyle = `
      display: block;
      width: 100%;
      padding: 10px 15px;
      text-align: center;
      background: white;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: #334155;
      transition: background-color 0.2s ease;
      border-bottom: 1px solid #f1f5f9;
    `;
    
    // Create buttons
    const actions = [
      { label: 'View Details', action: 'view' },
      { label: 'Reset Password', action: 'reset' },
      { label: 'Email', action: 'email' },
      isVerified ? { label: 'Remove Verification', action: 'removeVerification' } : { label: 'Verify', action: 'verify' },
      isBanned ? { label: 'Unban', action: 'unban' } : { label: 'Ban', action: 'ban' }
    ];
    
    actions.forEach((actionItem, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerText = actionItem.label;
      button.style.cssText = dropdownItemStyle;
      
      // Last item has no border
      if (index === actions.length - 1) {
        button.style.borderBottom = 'none';
      }
      
      // Add hover effect
      button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#f1f5f9';
      });
      button.addEventListener('mouseout', () => {
        button.style.backgroundColor = 'white';
      });
      
      // Add click handler
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleUserAction(actionItem.action);
      });
      
      dropdownRef.current.appendChild(button);
    });
  };

  // Show/hide dropdown
  useEffect(() => {
    if (isOpen) {
      createDropdownAtPosition();
    } else if (dropdownRef.current) {
      document.body.removeChild(dropdownRef.current);
      dropdownRef.current = null;
    }
    
    return () => {
      // Clean up on unmount
      if (dropdownRef.current) {
        document.body.removeChild(dropdownRef.current);
        dropdownRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle scroll - close the dropdown when scrolling starts
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        // Close the dropdown when scrolling
        setIsOpen(false);
      }
    };
    
    const handleResize = () => {
      if (isOpen) {
        // Close the dropdown when window is resized
        setIsOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Handle outside clicks to close the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen && 
        buttonRef.current && 
        dropdownRef.current && 
        !buttonRef.current.contains(event.target) && 
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Toggle the dropdown
  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Handle user action selection - FIXED VERSION
  const handleUserAction = (action) => {
    console.log(`Action selected: ${action} for user ${userId}`);
    
    switch (action) {
      case 'view':
        // CHANGE: Use React Router's navigate function instead of directly manipulating location
        navigate(`/admin/users/${userId}`);
        break;
      case 'reset':
        setShowResetModal(true);
        break;
      case 'email':
        localStorage.setItem('selectedEmailUserId', userId);
        navigate('/admin/email');
        break;
      case 'verify':
        setShowVerifyModal(true);
        break;
      case 'removeVerification':
        setShowRemoveVerificationModal(true);
        break;
      case 'ban':
        setShowBanModal(true);
        break;
      case 'unban':
        setShowUnbanModal(true);
        break;
      default:
        break;
    }

    // Close dropdown after action
    setIsOpen(false);
  };

  return (
    <div className="actions-menu-container" ref={menuRef}>
      <button 
        onClick={toggleDropdown} 
        className="actions-button"
        ref={buttonRef}
        aria-label="Open actions menu"
        type="button"
      >
        •••
      </button>
      
      {/* Modals */}
      <BanUserModal 
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        userId={userId}
      />

      <UnbanUserModal 
        isOpen={showUnbanModal}
        onClose={() => setShowUnbanModal(false)}
        userId={userId}
        userEmail={userEmail}
      />

      <ResetPasswordModal 
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        userId={userId}
        initialData={{ username, email: userEmail }}
      />

      <VerifyUserModal 
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        userId={userId}
        userEmail={userEmail}
      />

      <RemoveVerificationModal 
        isOpen={showRemoveVerificationModal}
        onClose={() => setShowRemoveVerificationModal(false)}
        userId={userId}
        userEmail={userEmail}
      />
    </div>
  );
};

export default ActionsMenu;