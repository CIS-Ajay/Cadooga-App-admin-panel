import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import SearchBar from '../Modals/SearchBar';
import { UserService } from '../../services/userService';
import '../../styles/AdminPage.css';

const UserActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUserLogs();
      const logsData = Array.isArray(response.data) ? response.data : [];
      console.log('logsData:====', logsData);
      setLogs(logsData);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  

  const handleNavigate = (path) => {
    switch(path) {
      case 'admins': navigate('/admin/admins'); break;
      case 'logs': navigate('/admin/logs'); break;
      case 'users': navigate('/admin/home'); break;
      case 'email': navigate('/admin/email'); break;
      case 'bannedusers': navigate('/admin/banned-users'); break;
      default: break;
    }
  };

  const filteredLogs = logs.filter(log =>
    log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    log.method_name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div className="home-container">
      <Sidebar activePage="logs" onNavigate={handleNavigate} />
      <div className="main-content">
        <Header />
        <div className="back-navigation" onClick={() => navigate('/admin/home')}>
          <span className="back-arrow">←</span> ACTIVITY LOGS
        </div>

        <div className="admin-section">
          <h2 className="section-title">USER ACTIVITY LOGS</h2>

          <div className="search-export">
            <SearchBar 
              placeholder="Logs Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="user-table">
            <div className="table-header">
              <div className="header-cell">ID</div>
              <div className="header-cell">EMAIL</div>
              <div className="header-cell">METHOD</div>
              <div className="header-cell">ENDPOINT</div>
              <div className="header-cell">STATUS</div>
              <div className="header-cell">TIME</div>
              <div className="header-cell">ACTIONS</div>
            </div>

            <div className="table-body">
              {loading ? (
                <div className="loading">Loading activity logs...</div>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div className="table-row" key={log.id}>
                    <div className="row-cell">{log.id}</div>
                    <div className="row-cell">{log.user_email || '-'}</div>
                    <div className="row-cell">{log.method_type}</div>
                    <div className="row-cell">{log.method_name}</div>
                    <div className="row-cell">{log.response_status_type}</div>
                    <div className="row-cell">{formatDate(log.request_datetime)}</div>
                    <div className="row-cell">
                      <button className='logs-view' onClick={() => setSelectedLog(log)}>View</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-message">No logs found.</div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {/* DETAILS VIEW MODAL */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Log Details</h3>
            <p><strong>Request:</strong></p>
            <pre>{JSON.stringify(JSON.parse(selectedLog.request_content || '{}'), null, 2)}</pre>
            <p><strong>Response:</strong></p>
            <div style={{ maxHeight: '500px', overflowY: 'scroll', background: '#eee', padding: '1rem' }}>
            <code>{selectedLog.response_content}</code>
            </div>
            <button onClick={() => setSelectedLog(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityLogs;
