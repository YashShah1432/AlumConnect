const express = require('express');
const router = express.Router();

const { uploadResume, updateProfile } = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

// ✅ protect route (important)
router.post('/upload-resume', isAuthenticated, upload.single('resume'), uploadResume);
module.exports = router;