const UserService = {
  // ...existing code...
  getUserById: async (userId) => {
    try {
      const response = await fetch(`/api/admin/user/${userId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  },

  sendEmail: async (userId, subject, message) => {
    try {
      const response = await fetch(`/api/admin/user/${userId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
  // ...existing code...
};

export { UserService };