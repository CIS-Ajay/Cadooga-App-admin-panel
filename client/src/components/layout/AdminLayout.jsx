import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Settings, LogOut, Menu, X, 
  Home, UserCheck, File, FileText, Mail,
  Shield, RefreshCw, Download, Ban, AlertTriangle
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear admin token or session
    localStorage.removeItem('adminToken');
    // Redirect to login page
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-slate-800 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          {sidebarOpen && (
            <Link to="/admin/dashboard" className="text-xl font-bold text-white">
              Cadooga Admin
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-slate-700 focus:outline-none"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
              >
                <Home size={20} />
                {sidebarOpen && <span className="ml-3">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
              >
                <Users size={20} />
                {sidebarOpen && <span className="ml-3">Users</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/verify-accounts"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
              >
                <UserCheck size={20} />
                {sidebarOpen && <span className="ml-3">Verify Accounts</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/export"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
              >
                <Download size={20} />
                {sidebarOpen && <span className="ml-3">Export Data</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/terms"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
              >
                <FileText size={20} />
                {sidebarOpen && <span className="ml-3">Terms & Policies</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/banned-users"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
              >
                <Ban size={20} />
                {sidebarOpen && <span className="ml-3">Banned Users</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/restore-accounts"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
              >
                <RefreshCw size={20} />
                {sidebarOpen && <span className="ml-3">Restore Accounts</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/reports"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
              >
                <AlertTriangle size={20} />
                {sidebarOpen && <span className="ml-3">Reports</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/email"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
              >
                <Mail size={20} />
                {sidebarOpen && <span className="ml-3">Email Users</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/settings"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
              >
                <Settings size={20} />
                {sidebarOpen && <span className="ml-3">Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <h1 className="text-xl font-semibold text-gray-800">Cadooga Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800"
              >
                <LogOut size={16} className="mr-1" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;