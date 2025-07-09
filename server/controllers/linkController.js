// server/controllers/linkController.js
const Link = require('../models/linkModel');

/**
 * Controller for handling link-related requests
 */
const linkController = {
  /**
   * Get all links with pagination
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getLinks: async (req, res) => {
    try {
      console.log('getLinks controller called with query:', req.query);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const userId = req.query.userId ? parseInt(req.query.userId) : null;
      
      console.log(`Fetching links: page=${page}, limit=${limit}, userId=${userId}`);
      
      const result = await Link.getAllLinks(userId, page, limit);
      
      console.log(`Found ${result.data.length} links, total: ${result.pagination.total}`);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getLinks controller:', error);
      res.status(500).json({ 
        error: 'Failed to fetch links',
        details: error.message 
      });
    }
  },
  
  /**
   * Get link by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getLinkById: async (req, res) => {
    try {
      const linkId = parseInt(req.params.id);
      
      if (isNaN(linkId)) {
        return res.status(400).json({ error: 'Invalid link ID' });
      }
      
      console.log(`Getting link by ID: ${linkId}`);
      const link = await Link.getLinkById(linkId);
      
      if (!link) {
        return res.status(404).json({ error: 'Link not found' });
      }
      
      res.status(200).json(link);
    } catch (error) {
      console.error(`Error in getLinkById controller for ID ${req.params.id}:`, error);
      res.status(500).json({ 
        error: 'Failed to fetch link',
        details: error.message 
      });
    }
  },
  
  /**
   * Update link status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  updateLinkStatus: async (req, res) => {
    try {
      const linkId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(linkId)) {
        return res.status(400).json({ error: 'Invalid link ID' });
      }
      
      if (status === undefined || ![0, 1, 2, 3].includes(parseInt(status))) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      
      console.log(`Updating link status: ${linkId} to ${status}`);
      const success = await Link.updateLinkStatus(linkId, status);
      
      if (!success) {
        return res.status(404).json({ error: 'Link not found or could not be updated' });
      }
      
      res.status(200).json({ message: 'Link status updated successfully' });
    } catch (error) {
      console.error(`Error in updateLinkStatus controller for ID ${req.params.id}:`, error);
      res.status(500).json({ 
        error: 'Failed to update link status',
        details: error.message 
      });
    }
  },
  
  /**
   * Get mock links for development/testing
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getMockLinks: async (req, res) => {
    try {
      const mockLinks = Link.getMockLinks();
      
      res.status(200).json({
        data: mockLinks,
        pagination: {
          total: mockLinks.length,
          page: 1,
          limit: mockLinks.length,
          pages: 1
        }
      });
    } catch (error) {
      console.error('Error in getMockLinks controller:', error);
      res.status(500).json({ 
        error: 'Failed to get mock links',
        details: error.message 
      });
    }
  }
};

module.exports = linkController;