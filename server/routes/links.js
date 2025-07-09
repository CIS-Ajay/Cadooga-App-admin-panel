// server/routes/links.js
const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

// GET mock links for development
router.get('/mock', linkController.getMockLinks);

// GET all links
router.get('/', linkController.getLinks);

// GET link by ID
router.get('/:id', linkController.getLinkById);

// PATCH update link status
router.patch('/:id/status', linkController.updateLinkStatus);

module.exports = router;