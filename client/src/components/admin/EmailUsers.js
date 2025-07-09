import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/EmailPage.css';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

// Mock users for fallback if API fails
const mockUsers = [
  {
    id: 1,
    sender: 'Shankar nath',
    email: 'Test@yopmail.com',
    subject: 'User Account',
    message: 'Administrator account with full system access.',
    time: '2024-10-28 11:59:40',
    is_verified: 0,
    is_email_verified: 0,
    verificationStatus: 'Unverified'
  },
  {
    id: 14,
    sender: 'User Account',
    email: 'Test61@yopmail.com',
    subject: 'Standard User',
    message: 'Regular user account with limited access to system features.',
    time: '2024-10-26 09:45:22',
    is_verified: 0,
    is_email_verified: 1,
    verificationStatus: 'Pending Verification'
  },
  {
    id: 15,
    sender: 'Shankar nath',
    email: 'Test62@yopmail.com',
    subject: 'Guest Account',
    message: 'Guest user with view-only privileges.',
    time: '2024-10-25 11:05:14',
    is_verified: 0,
    is_email_verified: 1,
    verificationStatus: 'Pending Verification'
  },
  {
    id: 11,
    sender: 'radhe krishna',
    email: 'Test13@yopmail.com',
    subject: 'Standard User',
    message: 'Regular user account with standard system access.',
    time: '2024-10-23 04:11:00',
    is_verified: 0,
    is_email_verified: 0,
    verificationStatus: 'Unverified'
  }
];

const EmailPage = () => {
  const [adminName, setAdminName] = useState('Glenne Headly');
  const [adminId, setAdminId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [useMockData, setUseMockData] = useState(false);
  
  const navigate = useNavigate();

  // Get current admin info on component mount
  useEffect(() => {
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

  // Fetch users from API or use mock data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // If mock data is enabled, use it instead of API
        if (useMockData) {
          console.log('Using mock user data');
          setUsers(mockUsers);
          if (mockUsers.length > 0 && !selectedUser) {
            setSelectedUser(mockUsers[0]);
          }
          setTotalPages(1);
          setLoading(false);
          return;
        }

        setLoading(true);
        // Use the API_BASE_URL from environment if available
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';
        
        // Use users endpoint instead of notifications
        const params = {
          page: page,
          limit: 10
        };
        
        console.log('Fetching users from API:', `${baseUrl}/users`, params);
        const response = await axios.get(`${baseUrl}/admin/users`, { params });
        
        console.log('API Response:', response.data);
        
        if (response.data && response.data.data) {
          // Transform user data to include verification status
          const userData = response.data.data.map(user => {
            // Generate verification status based on is_verified and is_email_verified
            let verificationStatus = 'Unverified';
            if (user.is_verified === 1) {
              verificationStatus = 'Verified';
            } else if (user.is_email_verified === 1) {
              verificationStatus = 'Pending Verification';
            }
            
            // Generate display name
            let displayName = 'User';
            if (user.legal_first_name || user.legal_last_name) {
              displayName = `${user.legal_first_name || ''} ${user.legal_last_name || ''}`.trim();
            } else if (user.nickname) {
              displayName = user.nickname;
            } else {
              displayName = `User ${user.id}`;
            }
            
            return {
              id: user.id,
              sender: displayName,
              email: user.email,
              subject: 'User Account',
              message: `Email: ${user.email}\nRole: ${user.role || 'User'}\nVerification Status: ${verificationStatus}`,
              time: user.updated_at || user.created_at,
              is_verified: user.is_verified,
              is_email_verified: user.is_email_verified,
              verificationStatus: verificationStatus
            };
          });
          
          console.log('Users transformed:', userData);
          setUsers(userData);
          
          // Set default selected user if there are users and none is selected
          if (userData.length > 0 && !selectedUser) {
            setSelectedUser(userData[0]);
          }
          
          // Update pagination info
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.pages);
          }
        } else {
          console.log('No users found in API response');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(`Failed to load users: ${err.message}. Using mock data instead.`);
        
        // For demo/development, fall back to mock data if API fails
        console.log('Falling back to mock data');
        setUsers(mockUsers);
        if (mockUsers.length > 0 && !selectedUser) {
          setSelectedUser(mockUsers[0]);
        }
        setTotalPages(1);
        setUseMockData(true); // Set flag to use mock data for future requests
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, adminId, useMockData]);

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
      default:
        break;
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleRefresh = async () => {
    try {
      if (useMockData) {
        // If using mock data, just reset the mock data
        setUsers(mockUsers);
        if (mockUsers.length > 0 && !selectedUser) {
          setSelectedUser(mockUsers[0]);
        }
        return;
      }

      setLoading(true);
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';
      
      const params = {
        page: page,
        limit: 10
      };
      
      console.log('Refreshing users from API');
      const response = await axios.get(`${baseUrl}/admin/users`, { params });
      
      if (response.data && response.data.data) {
        // Transform user data to include verification status
        const userData = response.data.data.map(user => {
          // Generate verification status based on is_verified and is_email_verified
          let verificationStatus = 'Unverified';
          if (user.is_verified === 1) {
            verificationStatus = 'Verified';
          } else if (user.is_email_verified === 1) {
            verificationStatus = 'Pending Verification';
          }
          
          // Generate display name
          let displayName = 'User';
          if (user.legal_first_name || user.legal_last_name) {
            displayName = `${user.legal_first_name || ''} ${user.legal_last_name || ''}`.trim();
          } else if (user.nickname) {
            displayName = user.nickname;
          } else {
            displayName = `User ${user.id}`;
          }
          
          return {
            id: user.id,
            sender: displayName,
            email: user.email,
            subject: 'User Account',
            message: `Email: ${user.email}\nRole: ${user.role || 'User'}\nVerification Status: ${verificationStatus}`,
            time: user.updated_at || user.created_at,
            is_verified: user.is_verified,
            is_email_verified: user.is_email_verified,
            verificationStatus: verificationStatus
          };
        });
        
        setUsers(userData);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing users:', err);
      setError('Failed to refresh users. Using mock data instead.');
      
      // For demo, fall back to mock data
      setUsers(mockUsers);
      if (mockUsers.length > 0 && !selectedUser) {
        setSelectedUser(mockUsers[0]);
      }
      setTotalPages(1);
      setUseMockData(true); // Set flag to use mock data for future requests
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
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

  // Toggle between mock data and API data (for testing/development)
  const toggleMockData = () => {
    setUseMockData(!useMockData);
    if (!useMockData) {
      // Switching to mock data
      setUsers(mockUsers);
      if (mockUsers.length > 0) {
        setSelectedUser(mockUsers[0]);
      }
      setTotalPages(1);
    } else {
      // Switching back to API data - trigger a refresh
      setSelectedUser(null);
      setPage(1);
    }
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

  // Get the appropriate class for verification status badge
  const getVerificationStatusClass = (status) => {
    switch (status) {
      case 'Verified':
        return 'status-accepted';
      case 'Pending Verification':
        return 'status-pending';
      case 'Rejected':
        return 'status-rejected';
      case 'Unverified':
      default:
        return 'status-completed';
    }
  };

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
          {/* Development mode toggle for mock data */}
          {process.env.NODE_ENV === 'development' && (
            <button 
              className="mock-data-toggle" 
              onClick={toggleMockData}
              style={{ marginLeft: 'auto', fontSize: '12px', padding: '4px 8px' }}
            >
              {useMockData ? 'Switch to API Data' : 'Switch to Mock Data'}
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
                        className={`email-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                        onClick={() => handleUserClick(user)}
                      >
                        <div className="email-avatar"></div>
                        <div className="email-details">
                          <div className="email-sender">{user.sender}</div>
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

                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="pagination-btn" 
                      onClick={handlePrevPage} 
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <span className="page-indicator">
                      Page {page} of {totalPages}
                    </span>
                    <button 
                      className="pagination-btn" 
                      onClick={handleNextPage} 
                      disabled={page === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* User details section - right side */}
          <div className="email-view-section">
            <div className="email-view-header">
              <h2>USER DETAILS</h2>
              {selectedUser && (
                <span className="notification-type-badge">
                  User
                </span>
              )}
            </div>
            
            <div className="email-view-content">
              {loading && !selectedUser ? (
                <div className="loading-indicator">Loading user details...</div>
              ) : selectedUser ? (
                <div className="email-metadata">
                  <div className="email-field">
                    <div className="field-label">NAME</div>
                    <div className="field-value">{selectedUser.sender}</div>
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
                    <div className="field-value">{formatLastActive(selectedUser.time)}</div>
                  </div>
                  
                  <div className="email-field">
                    <div className="field-label">Additional Info</div>
                    <div className="message-content">
                      <p>{selectedUser.message || 'No additional information available.'}</p>
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