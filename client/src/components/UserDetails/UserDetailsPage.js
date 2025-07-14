import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import ActionsMenu from '../Menu/ActionsMenu';
import '../../styles/UserDetailsPage.css';
import { UserService } from '../../services/userService';

const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminName, setAdminName] = useState('Glenne Headly');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    nickname: ''
  });

  // Format birthday from separate fields
  const formatBirthday = (day, month, year) => {
    if (!day || !month || !year) return 'Not provided';
    
    // Handle month as string (like "March") or number
    if (typeof month === 'string') {
      return `${month} ${day}, ${year}`;
    } else {
      // If month is a number, convert to month name
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthName = monthNames[parseInt(month) - 1] || month;
      return `${monthName} ${day}, ${year}`;
    }
  };

  // Helper function to determine membership type
  const getMembershipType = (userData) => {
    // Check if user is banned (theliveapp_status = 0)
    if (userData.theliveapp_status === false) {
      return 'Banned';
    }
    
    // Check role - based on your data: role 1 = admin, role 2 = regular user
    if (userData.role === 1) {
      return 'Admin';
    }
    
    // Check subscription status
    if (userData.is_subscription === 1) {
      return 'Subscriber';
    }
    
    return 'Free';
  };

  // Helper function to get favorites
  const getFavorites = (userData) => {
    const favorites = [];
    
    if (userData.fav_food && userData.fav_food.trim() !== '') {
      favorites.push({ type: "food", name: userData.fav_food });
    }
    
    if (userData.fav_place && userData.fav_place.trim() !== '') {
      favorites.push({ type: "place", name: userData.fav_place });
    }
    
    return favorites;
  };

  // Fetch user details - COMPLETELY FIXED VERSION
  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching user with ID:', userId);
      
      // Fetch basic user data using UserService
      const userData = await UserService.getUserById(userId);
      console.log('🔍 Complete user data received:', JSON.stringify(userData, null, 2));
      
      if (!userData) {
        throw new Error('No user data received');
      }

      // Format the data from the database structure - NO HARDCODED VALUES
      const formattedUser = {
        id: userData.id,
        email: userData.email || 'No email provided',
        legalName: {
          first: userData.legal_first_name || '',
          last: userData.legal_last_name || ''
        },
        nickname: userData.nickname || '',
        birthday: formatBirthday(userData.birth_day, userData.birth_month, userData.birth_year),
        
        // Verification status - check both fields
        verified: userData.is_verified === true || userData.is_email_verified === true,
        
        // Profile information from actual database fields
        about: userData.about_me || 'No information provided',
        astrology: userData.astrology || 'Not specified',
        
        // Membership type based on actual database logic
        membershipType: getMembershipType(userData),
        
        // Since date from created_at - COMPLETELY DYNAMIC
        since: userData.created_at ? 
          new Date(userData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 
          'Not available',
        
        // Status information - COMPLETELY DYNAMIC, NO HARDCODING
        status: {
          type: userData.created_at ? 
            `Since ${new Date(userData.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}` : 
            'Date not available',
          married: userData.relationship_status === 'Married'
        },
        
        // Favorites from actual database fields
        favorites: getFavorites(userData),
        
        // Device ID from face_token field - COMPLETELY DYNAMIC
        deviceId: userData.face_token || null,
        formattedDeviceId: userData.face_token ? 
          `${userData.face_token.substring(0, 20)}...` : 
          null,
        
        // Additional fields needed for ActionsMenu
        isBanned: userData.theliveapp_status === false,
        username: userData.nickname || `${userData.legal_first_name || ''} ${userData.legal_last_name || ''}`.trim() || userData.email?.split('@')[0] || 'Unknown'
      };
      
      // Debug logging to verify data processing
      console.log('🔍 User Data Processing Debug:');
      console.log('Raw created_at:', userData.created_at);
      console.log('Raw face_token:', userData.face_token);
      console.log('Formatted status.type:', formattedUser.status.type);
      console.log('Formatted deviceId:', formattedUser.deviceId);
      console.log('Formatted formattedDeviceId:', formattedUser.formattedDeviceId);
      
      setUser(formattedUser);
      
      // Set form data from user data
      setFormData({
        firstName: userData.legal_first_name || '',
        lastName: userData.legal_last_name || '',
        birthday: formattedUser.birthday,
        nickname: userData.nickname || ''
      });
      
      console.log('✅ User data processed successfully');
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching user data:', err);
      setError('Failed to load user details: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (userId) {
      fetchUserData();
    } else {
      setError('No user ID provided');
      setLoading(false);
    }
  }, [userId]);

  const handleLogout = () => {
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
      case 'admins':
        navigate('/admin/admins');
        break;
      default:
        break;
    }
  };

  const handleBackToHome = () => {
    navigate('/admin/home');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleClearDevice = async () => {
    try {
      if (window.confirm('Are you sure you want to clear this user\'s device ID?')) {
        await UserService.clearDeviceId(userId);
        alert('Device ID cleared successfully');
        fetchUserData(); // Refresh user data
      }
    } catch (error) {
      console.error('Error clearing device ID:', error);
      alert(`Error clearing device ID: ${error.message || 'An unknown error occurred'}`);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updatedUserData = {
        legal_first_name: formData.firstName,
        legal_last_name: formData.lastName,
        nickname: formData.nickname
      };

      console.log('Updating user with data:', updatedUserData);
      
      await UserService.updateUser(userId, updatedUserData);
      
      alert('Changes saved successfully!');
      fetchUserData(); // Refresh user data
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(`Error saving changes: ${error.message || 'An unknown error occurred'}`);
    }
  };

  const handleSendEmail = () => {
    const emailAddress = user.email;
    const subject = encodeURIComponent('Message from Admin');
    const body = encodeURIComponent('Hello,\n\nI hope this email finds you well.\n\nBest regards,\nAdmin Team');
    
    const mailtoLink = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_self');
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-container">
        <Sidebar 
          adminName={adminName}
          activePage="users"
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        <div className="main-content">
          <Header adminName={adminName} />
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading user details...</p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container">
        <Sidebar 
          adminName={adminName}
          activePage="users"
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        <div className="main-content">
          <Header adminName={adminName} />
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="back-button"
              onClick={() => navigate('/admin/home')}
            >
              Back to Users
            </button>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Sidebar 
        adminName={adminName}
        activePage="users"
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      <div className="main-content">
        <Header adminName={adminName} />
        
        <div className="back-navigation" onClick={handleBackToHome}>
          <span className="back-arrow">←</span> USER DETAILS
        </div>
        
        <div className="user-details-container">
          <div className="details-grid">
            {/* Left side - Profile Information */}
            <div className="user-profile-section">
              {/* Profile Image and Verification */}
              <div className="profile-image-section">
                <div className="profile-container">
                  <div className="profile-images-pyramid">
                    <div className="profile-image-container">
                      <img src="/images/profile-placeholder.png" alt="Profile" className="profile-image" />
                      {user?.verified ? (
                          <div className="verification-badge">
                            <span className="checkmark">✓</span>
                          </div>
                        ) : (
                          <div className="unverified-badge">
                            <span className="checkmark">✗</span>
                          </div>
                        )}
                    </div>
                    
                    <div className="badge-row">
                      <img src="/images/badge1.png" alt="Badge" className="badge-img" />
                      <img src="/images/badge2.png" alt="Badge" className="badge-img" />
                      <img src="/images/badge3.png" alt="Badge" className="badge-img" />
                    </div>
                  </div>
                  
                  <div className="verification-info">
                    <div className="verification-status">
                      {user.verified ? 
                      <span>Verified Account</span>
                        : 
                      <span className='unverified-status'>Unverified Account</span>}
                    </div>
                    <button className="change-button">Change</button>
                  </div>
                </div>
              </div>

              {/* Status - COMPLETELY DYNAMIC */}
              <div className="profile-section">
                <div className="section-header">
                  <span className="section-icon">📊</span>
                  <h3>Status</h3>
                </div>
                <div className="status-info">
                  <div className="status-date">
                    <span>{user.status.type}</span>
                  </div>
                  <div className="status-relationship">
                    <span>❤️ {user.status.married ? 'Married' : 'Single'}</span>
                  </div>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="profile-section">
                <div className="section-header">
                  <span className="section-icon">🔗</span>
                  <h3>Social Media</h3>
                </div>
                <div className="section-content">
                  <div className="social-icons">
                    <div className="social-icon snapchat">📷</div>
                    <div className="social-icon tiktok">🎵</div>
                    <div className="social-icon instagram">📷</div>
                    <div className="social-icon facebook">📘</div>
                    <div className="social-icon twitter">🐦</div>
                    <div className="social-icon spotify">🎵</div>
                    <div className="social-icon pinterest">📌</div>
                    <div className="social-icon discord">💬</div>
                    <div className="social-icon linkedin">💼</div>
                  </div>
                </div>
              </div>
              
              {/* About */}
              <div className="profile-section">
                <div className="section-header">
                  <span className="section-icon">ℹ️</span>
                  <h3>About</h3>
                </div>
                <div className="section-content">
                  {user.about !== 'No information provided' ? (
                    <p className="about-text">{user.about}</p>
                  ) : (
                    <div className="no-data">No information provided</div>
                  )}
                </div>
              </div>
              
              {/* Astrology */}
              <div className="profile-section">
                <div className="section-header">
                  <span className="section-icon">✨</span>
                  <h3>Astrology</h3>
                </div>
                <div className="section-content">
                  {user.astrology !== 'Not specified' ? (
                    <p className="astrology-text">{user.astrology}</p>
                  ) : (
                    <div className="no-data">Not specified</div>
                  )}
                </div>
              </div>
              
              {/* Favorites */}
              <div className="profile-section">
                <div className="section-header">
                  <span className="section-icon">⭐</span>
                  <h3>Favorites</h3>
                </div>
                <div className="section-content">
                  {user.favorites && user.favorites.length > 0 ? (
                    <div className="favorites-list">
                      {user.favorites.map((favorite, index) => (
                        <span key={index} className={`favorite-item ${favorite.type}`}>
                          {favorite.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data">No favorites listed</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right side: User details form */}
            <div className="user-details-form-section">
              <div className="details-header">
                <h2>DETAILS</h2>
                <ActionsMenu 
                  userId={userId}
                  userEmail={user.email}
                  username={user.username}
                  isBanned={user.isBanned}
                  isVerified={user.verified}
                />
              </div>
              
              <div className="user-details-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="email-group">
                    <input 
                      type="email" 
                      value={user.email} 
                      readOnly
                    />
                    <button className="email-button" onClick={handleSendEmail}>Email</button>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label>Legal Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group half">
                    <label>&nbsp;</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Birthday</label>
                  <input 
                    type="text" 
                    name="birthday"
                    value={formData.birthday} 
                    readOnly
                  />
                </div>
                
                <div className="form-group">
                  <label>Nickname</label>
                  <input 
                    type="text" 
                    name="nickname"
                    value={formData.nickname} 
                    placeholder="Nickname (optional)"
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label>Membership Type</label>
                    <div className={`membership-badge ${user.membershipType.toLowerCase()}`}>
                      {user.membershipType}
                    </div>
                  </div>
                  <div className="form-group half">
                    <label>Since</label>
                    <div className="since-text">{user.since}</div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Device ID</label>
                  <div className="device-id-group">
                    <input 
                      type="text" 
                      value={user.deviceId ? user.formattedDeviceId : "Device ID not exposed in database"} 
                      readOnly
                      placeholder="No device ID"
                    />
                    <button className="clear-device-button" onClick={handleClearDevice}>
                      Clear device(s)
                    </button>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="save-button" onClick={handleSaveChanges}>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default UserDetailsPage;