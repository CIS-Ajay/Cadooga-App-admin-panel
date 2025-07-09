import React from 'react';

const AdminSettings = () => {
  return (
    <div className="admin-settings-container">
      <h1>Admin Settings</h1>
      <p>This is the admin settings page. Content to be added later.</p>
      
      <div className="settings-card">
        <h2>Account Settings</h2>
        <div className="settings-section">
          <h3>Profile Information</h3>
          <p>Update your account details and profile information.</p>
        </div>
        
        <div className="settings-section">
          <h3>Security</h3>
          <p>Manage your password and security preferences.</p>
        </div>
        
        <div className="settings-section">
          <h3>Notifications</h3>
          <p>Configure how and when you receive alerts and notifications.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;