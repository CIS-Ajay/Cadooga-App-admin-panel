// server/models/linkModel.js
const db = require('../config/db');

/**
 * Link model for handling links referenced in notifications
 * This model uses the existing notifications table with 'Link' notification_type
 */
class Link {
  /**
   * Get link by ID
   * @param {number} linkId - Link ID
   * @returns {Object|null} - Link data or null if not found
   */
  static async getLinkById(linkId) {
    try {
      // Make sure linkId is a number
      if (isNaN(parseInt(linkId))) {
        return null;
      }
      
      // First, check if there are any notifications with this link_id
      // This will help us determine if this is a valid link
      const notificationSql = `
        SELECT n.id, n.user_id, n.sender, n.receiver, n.notification_type, 
               n.link_id, n.is_read, n.status, n.sender_name, n.receiver_name,
               n.created_at, n.updated_at,
               u_sender.email as sender_email, 
               u_sender.legal_first_name as sender_first_name,
               u_sender.legal_last_name as sender_last_name,
               u_receiver.email as receiver_email,
               u_receiver.legal_first_name as receiver_first_name,
               u_receiver.legal_last_name as receiver_last_name
        FROM notifications n
        LEFT JOIN users u_sender ON n.sender = u_sender.id
        LEFT JOIN users u_receiver ON n.receiver = u_receiver.id
        WHERE n.link_id = ? AND n.notification_type = 'Link' AND n.deleted_at IS NULL
        ORDER BY n.created_at DESC
        LIMIT 1
      `;
      
      const notifications = await db.query(notificationSql, [parseInt(linkId)]);
      
      if (notifications.length === 0) {
        return null;
      }
      
      const notification = notifications[0];
      
      // Now check if there is additional link data in profile_links or post tables
      // For now, we'll use a basic approach and just create a link object from the notification
      
      // Format sender and receiver names
      let senderName = notification.sender_name || '';
      if (!senderName && notification.sender_first_name && notification.sender_last_name) {
        senderName = `${notification.sender_first_name} ${notification.sender_last_name}`;
      } else if (!senderName) {
        senderName = notification.sender_email || `User ${notification.sender || 'Unknown'}`;
      }
      
      let receiverName = notification.receiver_name || '';
      if (!receiverName && notification.receiver_first_name && notification.receiver_last_name) {
        receiverName = `${notification.receiver_first_name} ${notification.receiver_last_name}`;
      } else if (!receiverName) {
        receiverName = notification.receiver_email || `User ${notification.receiver || 'Unknown'}`;
      }
      
      // Check if we have a related profile_link entry
      let linkDetails = null;
      try {
        const profileLinkSql = `
          SELECT pl.id, pl.user_id, pl.title, pl.url, pl.created_at, pl.updated_at
          FROM profile_links pl
          WHERE pl.id = ?
        `;
        
        const profileLinks = await db.query(profileLinkSql, [parseInt(linkId)]);
        
        if (profileLinks.length > 0) {
          linkDetails = profileLinks[0];
        }
      } catch (error) {
        console.log('No matching profile_link found:', error.message);
        // Continue without profile_link details
      }
      
      // Check if we have a related post entry
      let postDetails = null;
      try {
        const postSql = `
          SELECT p.id, p.user_id, p.content as description, p.created_at, p.updated_at
          FROM posts p
          WHERE p.id = ?
        `;
        
        const posts = await db.query(postSql, [parseInt(linkId)]);
        
        if (posts.length > 0) {
          postDetails = posts[0];
        }
      } catch (error) {
        console.log('No matching post found:', error.message);
        // Continue without post details
      }
      
      // Build the link object with available data
      return {
        id: notification.link_id,
        notification_id: notification.id,
        user_id: notification.user_id,
        title: linkDetails?.title || postDetails?.title || `Link Notification #${notification.link_id}`,
        description: postDetails?.description || "Link details are not available.",
        url: linkDetails?.url || null,
        status: notification.status,
        sender_id: notification.sender,
        receiver_id: notification.receiver,
        sender_name: senderName,
        receiver_name: receiverName,
        created_at: notification.created_at,
        updated_at: notification.updated_at,
        source: linkDetails ? 'profile_links' : (postDetails ? 'posts' : 'notification')
      };
    } catch (error) {
      console.error(`Error in getLinkById model for ID ${linkId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update link status (updates the notification status)
   * @param {number} linkId - Link ID
   * @param {number} status - New status (0=Pending, 1=Accepted, 2=Rejected, 3=Completed)
   * @returns {boolean} - Success status
   */
  static async updateLinkStatus(linkId, status) {
    try {
      // Validate status
      if (![0, 1, 2, 3].includes(parseInt(status))) {
        throw new Error('Invalid status value');
      }
      
      console.log(`Updating link status: ${linkId} to ${status}`);
      
      // Update all notifications with this link_id
      const updateSql = `
        UPDATE notifications
        SET status = ?, updated_at = NOW()
        WHERE link_id = ? AND notification_type = 'Link' AND deleted_at IS NULL
      `;
      
      const result = await db.query(updateSql, [parseInt(status), parseInt(linkId)]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error in updateLinkStatus model for ID ${linkId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all links for a specific user with pagination
   * This method finds all 'Link' notifications and groups them by link_id
   * @param {number} userId - User ID to filter by (optional)
   * @param {number} page - Page number
   * @param {number} limit - Number of items per page
   * @returns {Object} - Links with pagination info
   */
  static async getAllLinks(userId = null, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Build WHERE clause based on filters
      let whereClause = ' WHERE n.notification_type = "Link" AND n.deleted_at IS NULL';
      const whereParams = [];
      
      if (userId) {
        whereClause += ' AND (n.sender = ? OR n.receiver = ?)';
        whereParams.push(userId, userId);
      }
      
      // Count total links matching the filters
      // Using distinct link_id to avoid counting duplicate notifications for the same link
      const countSql = `SELECT COUNT(DISTINCT n.link_id) AS total FROM notifications n${whereClause}`;
      
      const countResult = await db.query(countSql, whereParams);
      const total = countResult[0]?.total || 0;
      
      // Get unique links ordered by latest notification for each link_id
      const linksSql = `
        SELECT n.id, n.user_id, n.sender, n.receiver, n.link_id, n.status, 
               n.sender_name, n.receiver_name, n.created_at, n.updated_at,
               u_sender.email as sender_email, 
               u_sender.legal_first_name as sender_first_name,
               u_sender.legal_last_name as sender_last_name,
               u_receiver.email as receiver_email,
               u_receiver.legal_first_name as receiver_first_name,
               u_receiver.legal_last_name as receiver_last_name
        FROM notifications n
        LEFT JOIN users u_sender ON n.sender = u_sender.id
        LEFT JOIN users u_receiver ON n.receiver = u_receiver.id
        ${whereClause}
        GROUP BY n.link_id
        ORDER BY MAX(n.created_at) DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;
      
      const links = await db.query(linksSql, whereParams);
      
      // Transform the data for frontend
      const transformedLinks = [];
      
      for (const link of links) {
        // Format sender and receiver names
        let senderName = link.sender_name || '';
        if (!senderName && link.sender_first_name && link.sender_last_name) {
          senderName = `${link.sender_first_name} ${link.sender_last_name}`;
        } else if (!senderName) {
          senderName = link.sender_email || `User ${link.sender || 'Unknown'}`;
        }
        
        let receiverName = link.receiver_name || '';
        if (!receiverName && link.receiver_first_name && link.receiver_last_name) {
          receiverName = `${link.receiver_first_name} ${link.receiver_last_name}`;
        } else if (!receiverName) {
          receiverName = link.receiver_email || `User ${link.receiver || 'Unknown'}`;
        }
        
        // Try to get additional details from profile_links or posts
        let title = `Link #${link.link_id}`;
        let description = `Link notification from ${senderName} to ${receiverName}`;
        let url = null;
        
        try {
          // Check profile_links first
          const profileLinkSql = `SELECT title, url FROM profile_links WHERE id = ?`;
          const profileLinks = await db.query(profileLinkSql, [parseInt(link.link_id)]);
          
          if (profileLinks.length > 0) {
            title = profileLinks[0].title || title;
            url = profileLinks[0].url || url;
          } else {
            // Check posts if no profile_link found
            const postSql = `SELECT content FROM posts WHERE id = ?`;
            const posts = await db.query(postSql, [parseInt(link.link_id)]);
            
            if (posts.length > 0) {
              description = posts[0].content || description;
            }
          }
        } catch (error) {
          console.log(`Could not get additional details for link ${link.link_id}:`, error.message);
          // Continue with default values
        }
        
        transformedLinks.push({
          id: link.link_id,
          notification_id: link.id,
          user_id: link.user_id,
          title: title,
          description: description,
          url: url,
          status: link.status,
          sender_id: link.sender,
          receiver_id: link.receiver,
          sender_name: senderName,
          receiver_name: receiverName,
          created_at: link.created_at,
          updated_at: link.updated_at
        });
      }
      
      return {
        data: transformedLinks,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getAllLinks model:', error);
      throw error;
    }
  }
  
  /**
   * Get mock links for testing/development
   * @returns {Array} - Array of mock links
   */
  static getMockLinks() {
    return [
      {
        id: 1,
        notification_id: 101,
        user_id: 1,
        title: 'Important Project Collaboration',
        description: 'This is a link for collaborating on the new project.',
        url: 'https://example.com/project/123',
        status: 0,
        sender_id: 2,
        receiver_id: 1,
        sender_name: 'Glenne Headly',
        receiver_name: 'Admin User',
        created_at: '2025-05-10T08:30:00.000Z',
        updated_at: '2025-05-10T08:30:00.000Z',
        source: 'notification'
      },
      {
        id: 2,
        notification_id: 102,
        user_id: 3,
        title: 'Design Review Request',
        description: 'Please review my latest design work.',
        url: 'https://example.com/designs/456',
        status: 1,
        sender_id: 3,
        receiver_id: 1,
        sender_name: 'Marcie E. Clark',
        receiver_name: 'Admin User',
        created_at: '2025-05-09T13:45:00.000Z',
        updated_at: '2025-05-09T14:30:00.000Z',
        source: 'notification'
      },
      {
        id: 3,
        notification_id: 103,
        user_id: 4,
        title: 'API Documentation',
        description: 'Here is the API documentation for the new features.',
        url: 'https://example.com/docs/api',
        status: 3,
        sender_id: 4,
        receiver_id: 1,
        sender_name: 'Dennis S. Vega',
        receiver_name: 'Admin User',
        created_at: '2025-05-08T09:15:00.000Z',
        updated_at: '2025-05-08T16:20:00.000Z',
        source: 'notification'
      }
    ];
  }
}

module.exports = Link;