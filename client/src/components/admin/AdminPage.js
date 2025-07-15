import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminService } from '../../services/adminService';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import CreateAdminModal from '../Modals/CreateAdminModal.jsx';
import SearchBar from '../Modals/SearchBar';
import ActionsMenu from '../Menu/ActionsMenu'; // ADDED: ActionsMenu import
import '../../styles/AdminPage.css';

const AdminPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching admin users...');
      
      // Fetch admin users using AdminService
      const response = await AdminService.getAdmins();
      console.log('Admin API response:', response);
      
      if (response.success) {
        setAdmins(response.data || []);
      } else {
        setError('Failed to fetch administrators');
        setAdmins([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError(`Failed to load administrators: ${error.message}`);
      setAdmins([]);
      setLoading(false);
    }
  };

  // Handle creating a new admin
  const handleCreateAdmin = (newAdmin) => {
    // Refetch admin list to include the new admin
    fetchAdmins();
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter admins based on search query
  const filteredAdmins = admins.filter(admin => 
    (admin.email && admin.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    ((admin.legal_first_name || admin.legal_last_name) && 
      `${admin.legal_first_name || ''} ${admin.legal_last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLogout = () => {
    navigate('/login');
  };

  const handleNavigate = (path) => {
    console.log('path:---', path); 
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
        case 'bannedusers':
        navigate('/admin/banned-users');  
        break;
      default:
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return '-';
    }
  };

  const getAdminType = (role) => {
    switch (role) {
      case 0: return 'Super Admin';
      case 1: return 'Admin';
      default: return 'Admin';
    }
  };
  
  const isActive = (admin) => {
    return admin.is_email_verified || admin.is_verified;
  };  

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredAdmins.map(admin => admin.id));
    } else {
      setSelectedRows([]);
    }
  };

  const getLegalName = (admin) => {
    if (admin.legal_first_name || admin.legal_last_name) {
      return `${admin.legal_first_name || ''} ${admin.legal_last_name || ''}`.trim();
    }
    return 'Not provided';
  };

  // Helper function to get admin username for ActionsMenu
  const getAdminUsername = (admin) => {
    if (admin.nickname) {
      return admin.nickname;
    }
    if (admin.legal_first_name || admin.legal_last_name) {
      return `${admin.legal_first_name || ''} ${admin.legal_last_name || ''}`.trim();
    }
    return admin.email?.split('@')[0] || `Admin ${admin.id}`;
  };

  return (
    <div className="home-container">
      <Sidebar 
        activePage="admins"
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      <div className="main-content">
        <Header />
        
        <div className="back-navigation" onClick={() => navigate('/admin/home')}>
          <span className="back-arrow">←</span> ADMINS
        </div>

        <div className="admin-section">
          <h2 className="section-title">ADMIN ACCESS</h2>
          
          <div className="search-export">
            <SearchBar 
              placeholder="Admin Search" 
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button 
              className="create-admin-button" 
              onClick={() => setIsCreateModalOpen(true)}
            >
              <span className="button-icon">+</span> Create Admin
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="user-table">
            <div className="table-header">
              <div className="header-cell checkbox-cell">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedRows.length > 0 && selectedRows.length === filteredAdmins.length}
                />
              </div>
              <div className="header-cell">EMAIL</div>
              <div className="header-cell">LEGAL NAME</div>
              <div className="header-cell">ACCOUNT TYPE</div>
              <div className="header-cell">STATUS</div>
              <div className="header-cell">LAST LOGIN</div>
              <div className="header-cell">ACTIONS</div>
            </div>

            <div className="table-body">
              {loading ? (
                <div className="loading">Loading admin users...</div>
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin, index) => (
                  <div className="table-row" key={admin.id || index}>
                    <div className="row-cell checkbox-cell">
                      <input 
                        type="checkbox" 
                        checked={selectedRows.includes(admin.id)}
                        onChange={() => handleSelectRow(admin.id)}
                      />
                    </div>
                    <div className="row-cell">{admin.email || '-'}</div>
                    <div className="row-cell">{getLegalName(admin)}</div>
                    <div className="row-cell">
                      <span className="account-badge admin">
                        {getAdminType(admin.role)}
                      </span>
                    </div>
                    <div className="row-cell">
                      <span className={`status-badge ${isActive(admin) ? 'active' : 'expired'}`}>
                        {isActive(admin) ? 'Active' : 'Expired'}
                      </span>
                    </div>
                    <div className="row-cell">{formatDate(admin.updated_at)}</div>
                    <div className="row-cell actions-cell">
                      <ActionsMenu 
                        userId={admin.id}
                        userEmail={admin.email}
                        username={getAdminUsername(admin)}
                        isBanned={false} // Admins typically aren't banned
                        isVerified={isActive(admin)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-message">
                  No admin users found in the database.
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {isCreateModalOpen && (
        <CreateAdminModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateAdmin}
        />
      )}
    </div>
  );
};

export default AdminPage;