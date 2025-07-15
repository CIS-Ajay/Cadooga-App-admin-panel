import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../styles/EmailPage.css';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import SearchBar from '../Modals/SearchBar'; // ADDED: SearchBar import

const EmailPage = () => {
  const [adminName, setAdminName] = useState('Glenne Headly');
  const [adminId, setAdminId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [initialUserId, setInitialUserId] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const initialLoadRef = useRef(true);

  // Get current admin info and check for selected user ID on component mount
  useEffect(() => {
    // Check for selectedEmailUserId in localStorage
    const selectedEmailUserId = localStorage.getItem('selectedEmailUserId');
    
    if (selectedEmailUserId) {
      console.log('Found selected user ID in localStorage:', selectedEmailUserId);
      // Store the ID for later use after users are loaded
      setInitialUserId(selectedEmailUserId);
      // Remove it from localStorage to avoid persisting the selection
      localStorage.removeItem('selectedEmailUserId');
    }
    
    const getCurrentAdmin = async () => {
      try {
        // Try to get current admin info from localStorage or API
        const adminData = localStorage.getItem('adminData');
        if (adminData) {
          const parsedData = JSON.parse(adminData);
          setAdminName(`${parsedData.firstName || ''} ${parsedData.lastName || ''}`.trim() || 'Admin User');
          setAdminId(parsedData.id);
        }
      } catch (err) {
        console.error('Error getting admin data:', err);
        // Fall back to default admin name
      }
    };

    getCurrentAdmin();
  }, []);

  // Helper to format display name
  const formatUserDisplayName = (user) => {
    if (user.legal_first_name || user.legal_last_name) {
      return `${user.legal_first_name || ''} ${user.legal_last_name || ''}`.trim();
    } else if (user.nickname) {
      return user.nickname;
    } else {
      return `User ${user.id}`;
    }
  };

  // Fetch all users from API
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        // Use the API_BASE_URL from environment if available
        // const baseUrl = 'http://localhost:3000/api';
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
        
        // Use a large limit to get all users in one request
        const params = {
          limit: 1000 // Set a large limit to get all users at once
        };
        
        // Add search parameter if provided - using searchTerm for broader search
        if (searchTerm) {
          params.searchTerm = searchTerm;
        }
        
        console.log('Fetching all users from API:', `${baseUrl}/users`, params);
        const response = await axios.get(`${baseUrl}/users`, { params });
        
        console.log('API Response:', response.data);
        
        if (response.data && response.data.data.users) {
          // Transform user data to include verification status
          const userData = response.data.data.users.map(user => {
            // Generate verification status based on is_email_verified only
            let verificationStatus = getVerificationStatus(user);
            
            // Generate display name based on available fields in your user model
            let displayName = formatUserDisplayName(user);
            
            return {
              ...user,
              displayName,
              verificationStatus
            };
          });
          
          console.log('Users transformed:', userData);
          setUsers(userData);
          
          // If we have an initial user ID to select, do it now
          if (initialUserId && initialLoadRef.current) {
            console.log('Selecting initial user with ID:', initialUserId);
            
            // Find the user in the loaded list
            const userToSelect = userData.find(u => u.id === parseInt(initialUserId) || u.id === initialUserId);
            
            if (userToSelect) {
              console.log('Found user to select:', userToSelect);
              setSelectedUser(userToSelect);
              
              // Scroll to that user in the list (needs to happen after DOM update)
              setTimeout(() => {
                const userElement = document.querySelector(`.email-item[data-user-id="${userToSelect.id}"]`);
                if (userElement) {
                  userElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            } else {
              console.log('User not found in list, making separate API call');
              
              // If user not found in the list, try to fetch it directly
              try {
                const userResponse = await axios.get(`${baseUrl}/users/${initialUserId}`);
                if (userResponse.data) {
                  const user = userResponse.data;
                  const formattedUser = {
                    ...user,
                    displayName: formatUserDisplayName(user),
                    verificationStatus: getVerificationStatus(user)
                  };
                  setSelectedUser(formattedUser);
                }
              } catch (userErr) {
                console.error('Error fetching specific user:', userErr);
              }
            }
            
            // Only do this once
            initialLoadRef.current = false;
          } else if (userData.length > 0 && !selectedUser) {
            // Set default selected user if no specific one is requested
            setSelectedUser(userData[0]);
          }
        } else {
          console.log('No users found in API response');
          setUsers([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(`Failed to load users: ${err.message}`);
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [searchTerm, initialUserId]);

  const handleLogout = () => {
    // Remove any stored auth data
    localStorage.removeItem('adminData');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleNavigate = (path) => {
    switch (path) {
      case 'users':
        navigate('/admin/home');
        break;
      case 'email':
        navigate('/admin/email');
        break;
      case 'user-emails':
        navigate('/admin/user-emails');
        break;
      case 'admins':
        navigate('/admin/admins');
        break;
      case 'logs':
        navigate('/admin/logs');
        break;
      default:
        break;
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleUserDetailsClick = () => {
    if (selectedUser && selectedUser.id) {
      console.log('Navigating to user details page for user ID:', selectedUser.id);
      navigate(`/admin/users/${selectedUser.id}`); // Fixed route path
    } else {
      console.warn('No user selected or user ID missing');
    }
  };

  // UPDATED: Handle search change for SearchBar component
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Immediate search as you type
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleRefresh = async () => {
    // Simply refetch all users
    try {
      setLoading(true);
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';
      
      const params = {
        limit: 1000 // Set a large limit to get all users at once
      };
      
      // Add search parameter if provided
      if (searchTerm) {
        params.searchTerm = searchTerm;
      }
      
      console.log('Refreshing users from API');
      const response = await axios.get(`${baseUrl}/users`, { params });
      
      if (response.data && response.data.data.users) {
        // Transform user data to include verification status
        const userData = response.data.data.users.map(user => {
          // Generate verification status based on is_email_verified only
          let verificationStatus = getVerificationStatus(user);
          
          // Generate display name
          let displayName = formatUserDisplayName(user);
          
          return {
            ...user,
            displayName,
            verificationStatus
          };
        });
        
        setUsers(userData);
      } else {
        setUsers([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing users:', err);
      setError('Failed to refresh users.');
      setLoading(false);
    }
  };

  // Simple function to open the default email client for the selected user
  const handleComposeEmail = () => {
    if (!selectedUser || !selectedUser.email) return;
    
    // Create a mailto link
    const mailtoLink = `mailto:${selectedUser.email}`;
    
    // Open the email client
    window.location.href = mailtoLink;
  };

  // Format the time for display
  const formatLastActive = (timeString) => {
    if (!timeString) return 'Never';
    
    try {
      // Parse the date string
      const date = new Date(timeString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return timeString; // Return original if parsing failed
      }
      
      // Format date
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      
      return date.toLocaleString('en-US', options);
    } catch (err) {
      console.error('Error formatting date:', err);
      return timeString; // Return original on error
    }
  };

  // Updated to only check is_email_verified
  const getVerificationStatus = (user) => {
    if (user.is_email_verified === 1 || user.is_email_verified === true) {
      return 'Verified';
    } else {
      return 'Not Verified';
    }
  };

  // Get the appropriate class for verification status badge
  const getVerificationStatusClass = (status) => {
    switch (status) {
      case 'Verified':
        return 'status-accepted';
      case 'Not Verified':
        return 'status-rejected';
      default:
        return 'status-completed';
    }
  };

  // Generate additional info message - UPDATED to exclude verification status
  const getAdditionalInfo = (user) => {
    if (!user) return 'No additional information available.';
    
    let info = [];
    
    if (user.email) {
      info.push(`Email: ${user.email}`);
    }
    
    if (user.role !== undefined) {
      let roleText = 'User';
      if (user.role === 2) roleText = 'Regular User';
      if (user.role === 1) roleText = 'Admin';
      info.push(`Role: ${roleText}`);
    }
    
    // REMOVED: Verification status from additional info since it's shown separately
    
    if (user.created_at) {
      info.push(`Created: ${formatLastActive(user.created_at)}`);
    }
    
    return info; // Return array instead of joined string
  };

  // Update scrollbar sizing for the email list
  useEffect(() => {
    const emailList = document.querySelector('.email-list');
    if (emailList) {
      // Calculate the ratio of visible to total height
      const visibleHeight = emailList.clientHeight;
      const totalHeight = emailList.scrollHeight;
      
      // Create CSS variables for scrollbar thumb sizing
      emailList.style.setProperty('--visible-height', `${visibleHeight}px`);
      emailList.style.setProperty('--total-height', `${totalHeight}px`);
      
      // Create a MutationObserver to update the scrollbar size when content changes
      const observer = new MutationObserver(() => {
        const newTotalHeight = emailList.scrollHeight;
        emailList.style.setProperty('--total-height', `${newTotalHeight}px`);
      });
      
      observer.observe(emailList, { childList: true, subtree: true });
      
      return () => observer.disconnect();
    }
  }, [users, selectedUser]);

  // Define the person icon SVG
  const PersonIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  return (
    <div className="page-container">
      <Sidebar
        adminName={adminName}
        activePage="email"
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      <div className="main-content">
        <Header adminName={adminName} />
        
        <div className="email-navigation">
          <span className="back-arrow" onClick={() => navigate('/admin/home')}>←</span> USER EMAILS
        </div>
        
        {/* REPLACED: Old search input with SearchBar component */}
        <div className="email-search-container">
          <SearchBar 
            placeholder="Search by name or email" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="clear-search-btn"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="email-sections">
          {/* Users list section - left side */}
          <div className="inbox-section">
            <div className="inbox-header">
              <h2>USERS</h2>
              <div className="inbox-actions">
                <button className="refresh-btn" title="Refresh" onClick={handleRefresh}>⟳</button>
                <button className="options-btn" title="More options">⋮</button>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-indicator">Loading users...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                <div className="email-list">
                  {users.length === 0 ? (
                    <div className="no-emails">No users found</div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        data-user-id={user.id}
                        className={`email-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                        onClick={() => handleUserClick(user)}
                      >
                        <div className="email-avatar"></div>
                        <div className="email-details">
                          <div className="email-sender">{user.displayName || 'User ' + user.id}</div>
                          <div className="email-subject">{user.email}</div>
                        </div>
                        <div className="email-time">
                          <span className={`status-indicator ${getVerificationStatusClass(user.verificationStatus)}`} 
                                style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {user.verificationStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* User details section - right side */}
          <div className="email-view-section">
            <div className="email-view-header">
              <h2>USER DETAILS</h2>
              {selectedUser && (
                <div 
                  className="user-icon-badge"
                  onClick={handleUserDetailsClick}
                  title="View User Details"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                >
                  <PersonIcon />
                </div>
              )}
            </div>
            
            <div className="email-view-content">
              {loading && !selectedUser ? (
                <div className="loading-indicator">Loading user details...</div>
              ) : selectedUser ? (
                <div className="email-metadata">
                  <div className="email-field">
                    <div className="field-label">NAME</div>
                    <div className="field-value">{selectedUser.displayName || 'User ' + selectedUser.id}</div>
                  </div>
                  
                  <div className="email-field">
                    <div className="field-label">Email Address</div>
                    <div className="field-value">
                      <a href={`mailto:${selectedUser.email}`} className="email-link">
                        {selectedUser.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="email-field">
                    <div className="field-label">Verification Status</div>
                    <div className="field-value">
                      <span className={`status-indicator ${getVerificationStatusClass(selectedUser.verificationStatus)}`}>
                        {selectedUser.verificationStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="email-field">
                    <div className="field-label">Last Activity</div>
                    <div className="field-value">{formatLastActive(selectedUser.updated_at || selectedUser.created_at)}</div>
                  </div>
                  
                  <div className="email-field">
                    <div className="field-label">Additional Info</div>
                    <div className="message-content">
                      {getAdditionalInfo(selectedUser).map((info, index) => (
                        <p key={index}>{info}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="email-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                      className="reply-btn" 
                      onClick={handleComposeEmail}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Send Email
                    </button>
                    {/* "View Details" button removed as requested */}
                  </div>
                </div>
              ) : (
                <div className="no-email-selected">Select a user to view details</div>
              )}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default EmailPage;