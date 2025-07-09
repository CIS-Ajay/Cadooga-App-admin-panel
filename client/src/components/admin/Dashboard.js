import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, CreditCard, Clock, Calendar, Activity } from 'lucide-react';
import { UserService } from '../../services/userService'; // Add this import

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    paidUsers: 0,
    freeUsers: 0,
    newUsersToday: 0,
    pendingVerifications: 0,
    closedAccounts: 0,
    recentLogins: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await UserService.getUserStats();
        setStats({
          totalUsers: response.totalUsers || 0,
          activeUsers: response.activeSubscriptions || 0,
          paidUsers: response.activeSubscriptions || 0,
          freeUsers: (response.totalUsers - response.activeSubscriptions) || 0,
          newUsersToday: 0,
          pendingVerifications: 0,
          closedAccounts: response.closedAccounts || 0,
          recentLogins: []
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setIsLoading(false);
        // Set default values if the API call fails
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          paidUsers: 0,
          freeUsers: 0,
          newUsersToday: 0,
          pendingVerifications: 0,
          closedAccounts: 0,
          recentLogins: []
        });
      }
    };
    
    fetchStats();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Calculate the percentage of users that are active
  const activePercentage = stats.totalUsers > 0 
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100) 
    : 0;

  // Calculate the percentage of users that are paid
  const paidPercentage = stats.totalUsers > 0 
    ? Math.round((stats.paidUsers / stats.totalUsers) * 100) 
    : 0;

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      
      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-3xl font-semibold text-gray-800">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">+{stats.newUsersToday}</span> new today
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <p className="text-3xl font-semibold text-gray-800">{stats.activeUsers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${activePercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activePercentage}% of total users</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Paid Subscribers</p>
                  <p className="text-3xl font-semibold text-gray-800">{stats.paidUsers}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${paidPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{paidPercentage}% of total users</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Free Users</p>
                  <p className="text-3xl font-semibold text-gray-800">{stats.freeUsers}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{stats.totalUsers - stats.paidUsers}</span> non-paying users
                </p>
              </div>
            </div>
          </div>
          
          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <UserCheck className="h-5 w-5 text-orange-500 mr-2" />
                <h3 className="text-lg font-medium">Pending Verifications</h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-semibold text-gray-800">{stats.pendingVerifications}</p>
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200">
                  View All
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <UserX className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-medium">Closed Accounts</h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-semibold text-gray-800">{stats.closedAccounts}</p>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                  View All
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium">User Activity</h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg text-gray-600">View detailed analytics</p>
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                  Analytics
                </button>
              </div>
            </div>
          </div>
          
          {/* Recent Logins */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Recent User Logins</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentLogins.map((login) => (
                    <tr key={login.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{login.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {login.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(login.time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all activity →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;