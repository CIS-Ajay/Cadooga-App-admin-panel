import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/HomePage.css';
import { UserService } from '../../services/userService';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import ActionsMenu from '../Menu/ActionsMenu';
import SearchBar from '../Modals/SearchBar'; // SEARCHBAR COMPONENT IMPORT

// SVG components for verification status icons
const CheckMarkIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <polyline points="4 12 9 17 20 6" style={{ 
      stroke: '#3b82f6', 
      strokeWidth: 3,
      fill: 'none'
    }} />
  </svg>
);

const XMarkIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <line x1="18" y1="6" x2="6" y2="18" style={{ 
      stroke: '#ef4444', 
      strokeWidth: 3,
      fill: 'none'
    }} />
    <line x1="6" y1="6" x2="18" y2="18" style={{ 
      stroke: '#ef4444', 
      strokeWidth: 3,
      fill: 'none'
    }} />
  </svg>
);

// Updated Verification Status component - checking only is_email_verified
const VerificationStatus = ({ user }) => {
  // User is verified only if is_email_verified is truthy
  const isVerified = user && (user.is_email_verified === 1 || user.is_email_verified === true);
  
  return (
    <div className={`homepage-verification-icon ${isVerified ? 'verified' : 'not-verified'}`}>
      {isVerified ? <CheckMarkIcon /> : <XMarkIcon />}
    </div>
  );
};

const HomePage = () => {
  // State variables 
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    closedAccounts: 0,
    recentLogins: 0
  });
  const [adminName, setAdminName] = useState('Glenne Headly');
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  
  // Add selected users state
  const [selectedUsers, setSelectedUsers] = useState([]);
  // Add select all checkbox state
  const [selectAll, setSelectAll] = useState(false);
  
  const navigate = useNavigate();

  // Fetch all users from the API
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      
      // Log what we're sending to the API
      console.log('Fetching all users with filters:', filters);
      
      // Use a large limit to get all users in one request
      // We'll use 1000 as a reasonable upper limit
      const result = await UserService.getUsers(filters, 1, 1000);
      
      console.log('API response:', result);
      
      // if (result && result.data) {
      //   setUsers(result.data || []);
      if (result && result.data) {
        console.log('Users received:=========', result.data);
        setUsers(result.data || []);

        // Reset selected users when users list changes completely
        setSelectedUsers([]);
        setSelectAll(false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      setUsers([]);
      setSelectedUsers([]);
      setSelectAll(false);
    }
  };

  // Fetch stats for the dashboard
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      console.log('Fetching stats...');
      const result = await UserService.getUserStats();
      console.log('Stats received:', result);
      
      // Make sure we have valid stats data
      if (result && typeof result === 'object') {
        setStats({
          totalUsers: result.totalUsers || 0,
          activeSubscriptions: result.activeSubscriptions || 0,
          closedAccounts: result.closedAccounts || 0,
          recentLogins: result.recentLogins || 0
        });
      } else {
        console.error('Invalid stats data received:', result);
      }
      
      setLoadingStats(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoadingStats(false);
    }
  };

  // Handle search input change with immediate search - PRESERVES ORIGINAL SEARCH TECHNIQUE
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    console.log('Search input changed to:', query);
    
    // Update filters based on search query - SAME LOGIC AS BEFORE
    if (!query.trim()) {
      setFilters({});
    } else {
      // Always use searchTerm for all searches - searches by name AND email
      setFilters({ searchTerm: query.trim() });
    }
  };

  // Handle user selection
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      // If user is already selected, remove them
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } 
      // Otherwise, add them to selection
      else {
        return [...prev, userId];
      }
    });
  };
  
  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      // If all were selected, deselect all
      setSelectedUsers([]);
    } else {
      // Otherwise, select all visible users
      const allUserIds = users.map(user => user.id);
      setSelectedUsers(allUserIds);
    }
    setSelectAll(!selectAll);
  };
  
  // Update select all checkbox when selected users changes
  useEffect(() => {
    // If all current users are selected, set selectAll to true
    if (users.length > 0 && selectedUsers.length === users.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, users]);
  
  // Handle export of selected users
  const handleExport = () => {
    try {
      if (selectedUsers.length === 0) {
        alert('Please select at least one user to export');
        return;
      }
      
      // Use the current filters with selected user IDs
      UserService.exportUsers({ ...filters, userIds: selectedUsers.join(',') });
      console.log(`Exporting ${selectedUsers.length} selected users`);
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Error exporting users. Please try again.');
    }
  };

  // Effect to fetch users when filters change
  useEffect(() => {
    console.log('Filters changed to:', filters);
    // Fetch all users when filters change
    fetchAllUsers();
  }, [filters]);

  // Initial load effect
  useEffect(() => {
    const fetchInitialData = async () => {
      if (loadingStats) await fetchStats();
      await fetchAllUsers(); // duplicate
    };
    fetchInitialData();
  }, []);

  const handleLogout = () => {
    // Handle logout logic
    navigate('/login');
  };

  const handleNavigate = (path) => {
    switch(path) {
      case 'users':
        navigate('/admin/home');
        break;
      case 'email':
        navigate('/admin/email');
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

  // FIXED: Function to determine the account type badge class
  const getAccountTypeDisplay = (user) => {
    console.log('Processing user for account type:', user); // Debug log
    
    // Default display
    let type = 'Free';
    let className = 'free';
  
    if (!user) return { type, className };
  
    // Check for banned status first
    if (user.status === 'banned' || 
        user.account_status === 'banned' || 
        user.is_banned === true ||
        user.is_banned === 1 ||
        user.banned === true ||
        user.theliveapp_status === false) {
      return { type: 'Banned', className: 'banned' };
    }
  
    // Check admin status first
    if (user.role === 'admin' || user.role === 0 || user.role === 1 || user.is_admin === 1) {
      return { type: 'Admin', className: 'admin' };
    }
  
    // Determine the subscription type
    if (user.is_subscription === 1 || user.subscription_type === 'Premium' || user.subscription_type === 'Subscriber') {
      type = 'Subscriber';
      className = 'subscriber';
    } else if (user.subscription_type === 'Basic') {
      type = 'Basic';
      className = 'basic';
    } else if (user.subscription_type === 'Trial') {
      type = 'Trial';
      className = 'trial';
    } else if (user.account_status === 'canceled' || user.subscription_type === 'Canceled') {
      type = 'Canceled';
      className = 'canceled';
    }
  
    console.log(`User ${user.id} account type: ${type} (${className})`); // Debug log
    return { type, className };
  };

  // Check if user is banned
  const isUserBanned = (user) => {
    return (
      user.status === 'banned' || 
      user.account_status === 'banned' || 
      user.is_banned === true ||
      user.is_banned === 1 ||
      user.banned === true ||
      user.theliveapp_status === false
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="homepage-container">
      <Sidebar 
        adminName={adminName}
        activePage="users"
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      <div className="homepage-main-content">
        <Header adminName={adminName} />
        
        {/* Stats Cards */}
        <div className="homepage-stats-grid">
          <div className="homepage-stat-card">
            <div className="stat-content">
              <h3 className="homepage-stat-title">Total Users</h3>
              <p className="homepage-stat-value">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="homepage-stat-indicator orange"></div>
          </div>
          
          <div className="homepage-stat-card">
            <div className="stat-content">
              <h3 className="homepage-stat-title">Active Subscriptions</h3>
              <p className="homepage-stat-value">{stats.activeSubscriptions.toLocaleString()}</p>
            </div>
            <div className="homepage-stat-indicator green"></div>
          </div>
          
          <div className="homepage-stat-card">
            <div className="stat-content">
              <h3 className="homepage-stat-title">Closed / Expired Accounts</h3>
              <p className="homepage-stat-value">{stats.closedAccounts.toLocaleString()}</p>
            </div>
            <div className="homepage-stat-indicator purple"></div>
          </div>
          
          <div className="homepage-stat-card">
            <div className="stat-content">
              <h3 className="homepage-stat-title">Recent Logins</h3>
              <p className="homepage-stat-value">{stats.recentLogins.toLocaleString()}</p>
            </div>
            <div className="homepage-stat-indicator pink"></div>
          </div>
        </div>
        
        {/* User Management Section */}
        <div className="homepage-user-section">
          <h2 className="homepage-section-title">USER QUICK ACCESS</h2>
          <div className="homepage-search-export">
            {/* REPLACED: Old input with SearchBar component */}
            <SearchBar 
              placeholder="User Search" 
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button 
              type="button"
              className="homepage-export-btn" 
              onClick={handleExport} 
              disabled={selectedUsers.length === 0}
            >
              Export Users
            </button>
          </div>

          <div className="homepage-user-table-container">
            <div className="homepage-user-table">
              <div className="homepage-table-header">
                <div className="homepage-header-cell homepage-checkbox-cell">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </div>
                <div className="homepage-header-cell">EMAIL</div>
                <div className="homepage-header-cell">AGE</div>
                <div className="homepage-header-cell">LEGAL NAME</div>
                <div className="homepage-header-cell">PSEUDONYM</div>
                <div className="homepage-header-cell">ACCOUNT TYPE</div>
                <div className="homepage-header-cell">VERIFICATION STATUS</div>
                <div className="homepage-header-cell">LAST LOGIN</div>
                <div className="homepage-header-cell">ACTIONS</div>
              </div>

              <div className="homepage-table-body">
                {users.map((user, index) => {
                  const accountType = getAccountTypeDisplay(user);
                  const banned = isUserBanned(user);
                  const verified = UserService.isUserVerified ? UserService.isUserVerified(user) : (user.is_email_verified === 1);
                  
                  // Check if user is selected
                  const isSelected = selectedUsers.includes(user.id);
                  
                  return (
                    <div 
                      className={`homepage-table-row ${isSelected ? 'selected' : ''} ${banned ? 'banned-user' : ''}`}
                      key={user.id || index}
                    >
                      <div className="homepage-row-cell homepage-checkbox-cell">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </div>
                      <div className="homepage-row-cell">{user.email || '-'}</div>
                      <div className="homepage-row-cell">{user.age || '-'}</div>
                      <div className="homepage-row-cell">{user.legalname || '-'}</div>
                      <div className="homepage-row-cell">{user.pseudonym || '-'}</div>
                      <div className="homepage-row-cell">
                        <span className={`homepage-account-badge ${accountType.className}`}>
                          {accountType.type}
                        </span>
                      </div>
                      <div className="homepage-row-cell">
                        <VerificationStatus user={user} />
                      </div>
                      <div className="homepage-row-cell">
                        {formatDate(user.last_login || user.updated_at)}
                      </div>
                      <div className="homepage-row-cell homepage-actions-cell">
                        <ActionsMenu 
                          userId={user.id} 
                          userEmail={user.email} 
                          username={user.pseudonym || user.username || user.legalname}
                          isBanned={banned}
                          isVerified={verified}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Loading indicator */}
            {loading && (
              <div className="homepage-loading-indicator">
                <div className="homepage-spinner"></div>
                <p>Loading users...</p>
              </div>
            )}
            
            {/* No results message */}
            {!loading && users.length === 0 && (
              <div className="homepage-no-results">
                <p>No users found matching your criteria</p>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;