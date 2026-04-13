// server\routes\profileRoutes.js
const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/isAuthenticated');

// Protect route with auth middleware so req.user is set
router.patch('/update', isAuthenticated, updateProfile);

module.exports = router;