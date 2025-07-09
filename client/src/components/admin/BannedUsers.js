import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Info, UserX, Shield, AlertTriangle } from 'lucide-react';

const BannedUsers = () => {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  
  const usersPerPage = 10;
  
  // Fetch banned users
  useEffect(() => {
    // Simulated API call - replace with actual API call
    const fetchBannedUsers = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be an API call
        setTimeout(() => {
          const mockBannedUsers = [
            {
              id: 1,
              legalName: 'John Smith',
              pseudonym: 'JSmith',
              email: 'john.smith@example.com',
              bannedAt: '2023-04-05T14:30:00',
              bannedBy: 'Admin User',
              reason: 'Violation of community guidelines - inappropriate content',
              appealStatus: 'none'
            },
            {
              id: 2,
              legalName: 'Sarah Johnson',
              pseudonym: 'SJ2023',
              email: 'sarah.j@example.com',
              bannedAt: '2023-04-02T09:15:00',
              bannedBy: 'System',
              reason: 'Multiple reports from users for harassment',
              appealStatus: 'pending'
            },
            {
              id: 3,
              legalName: 'Michael Williams',
              pseudonym: 'MikeW',
              email: 'michael.w@example.com',
              bannedAt: '2023-03-28T16:20:00',
              bannedBy: 'Admin User',
              reason: 'Spam and promotional content',
              appealStatus: 'denied'
            },
            {
              id: 4,
              legalName: 'Lisa Brown',
              pseudonym: 'LisaB',
              email: 'lisa.b@example.com',
              bannedAt: '2023-03-25T11:45:00',
              bannedBy: 'System',
              reason: 'Account compromised - security risk',
              appealStatus: 'none'
            },
            {
              id: 5,
              legalName: 'David Miller',
              pseudonym: 'DaveM',
              email: 'david.m@example.com',
              bannedAt: '2023-03-20T10:30:00',
              bannedBy: 'Admin User',
              reason: 'Repeated violation of terms of service',
              appealStatus: 'pending'
            }
          ];
          
          setBannedUsers(mockBannedUsers);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching banned users:', error);
        setIsLoading(false);
      }
    };

    fetchBannedUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = bannedUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.legalName.toLowerCase().includes(searchLower) ||
      user.pseudonym.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.reason.toLowerCase().includes(searchLower)
    );
  });
  
  // Paginate users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Calculate time since ban
  const getTimeSince = (dateString) => {
    if (!dateString) return 'N/A';
    
    const bannedDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - bannedDate;
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  };

  // Handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Open user details modal
  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Close user details modal
  const closeUserModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Handle unban user
  const handleUnbanUser = async (userId) => {
    try {
      // In a real app, this would be an API call
      console.log(`Unbanning user with ID: ${userId}`);
      
      // Optimistic update of the UI
      setBannedUsers(bannedUsers.filter(user => user.id !== userId));
      
      // Close modal if it's open
      if (isModalOpen) {
        setIsModalOpen(false);
        setSelectedUser(null);
      }
      
      // Show success message or toast notification
      alert('User has been unbanned successfully!');
    } catch (error) {
      console.error('Error unbanning user:', error);
      // Show error message
      alert('Failed to unban user. Please try again.');
    }
  };

  // Handle ban user (for demo purposes in case we want to ban someone again)
  const handleBanUser = async (e) => {
    e.preventDefault();
    
    if (!banReason.trim()) {
      alert('Please provide a reason for banning this user.');
      return;
    }

    try {
      // In a real app, this would be an API call
      console.log('Banning user with reason:', banReason);
      
      // Reset form and close modal
      setBanReason('');
      setIsModalOpen(false);
      
      // Show success message or toast notification
      alert('User has been banned successfully!');
    } catch (error) {
      console.error('Error banning user:', error);
      // Show error message
      alert('Failed to ban user. Please try again.');
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Banned Users</h1>
        <div className="text-sm text-gray-600 flex items-center">
          <Shield size={16} className="mr-2 text-red-600" />
          <span>Total banned: {bannedUsers.length}</span>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex items-center border rounded overflow-hidden">
          <div className="px-3 py-2 bg-gray-100">
            <Search size={20} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="flex-1 px-4 py-2 focus:outline-none"
            placeholder="Search by name, email, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Banned User Accounts</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading banned users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openUserModal(user)}
                        className="text-left"
                      >
                        <div className="font-medium text-gray-900">{user.legalName}</div>
                        <div className="text-sm text-gray-500">{user.pseudonym}</div>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(user.bannedAt)}</div>
                      <div className="text-sm text-gray-500">{getTimeSince(user.bannedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.appealStatus === 'pending' ? (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Appeal Pending
                        </span>
                      ) : user.appealStatus === 'denied' ? (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Appeal Denied
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          Banned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleUnbanUser(user.id)}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 flex items-center"
                      >
                        <RefreshCw size={14} className="mr-1" />
                        Unban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No banned users found.</p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Banned User Details
                </h3>
                <button 
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Info size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">User</h4>
                <p className="text-base text-gray-900">{selectedUser.legalName} ({selectedUser.pseudonym})</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                <p className="text-base text-gray-900">{selectedUser.email}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Banned Date</h4>
                <p className="text-base text-gray-900">{formatDate(selectedUser.bannedAt)}</p>
                <p className="text-sm text-gray-500">{getTimeSince(selectedUser.bannedAt)}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Banned By</h4>
                <p className="text-base text-gray-900">{selectedUser.bannedBy}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Reason</h4>
                <p className="text-base text-gray-900">{selectedUser.reason}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Appeal Status</h4>
                {selectedUser.appealStatus === 'pending' ? (
                  <div className="flex items-center text-yellow-600">
                    <AlertTriangle size={16} className="mr-2" />
                    <span>Appeal Pending Review</span>
                  </div>
                ) : selectedUser.appealStatus === 'denied' ? (
                  <div className="flex items-center text-red-600">
                    <UserX size={16} className="mr-2" />
                    <span>Appeal Denied</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-600">
                    <Info size={16} className="mr-2" />
                    <span>No Appeals Submitted</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleUnbanUser(selectedUser.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Unban User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <Info size={20} className="text-blue-500 mr-2 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">About Banned Users</h3>
            <p className="text-sm text-blue-700">
              Users are banned for violations of the terms of service or community guidelines. 
              Banned users cannot log in to their accounts or access the platform's features. 
              You can unban users if you determine the ban was applied in error or if sufficient time has passed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannedUsers;