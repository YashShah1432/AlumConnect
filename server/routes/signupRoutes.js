const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Public
router.post('/send-otp', authCtrl.sendOtp);
router.post('/verify-otp', authCtrl.verifyOtp);
router.post('/register', authCtrl.register);

// Admin
router.patch('/approve/:id', verifyAdmin, authCtrl.approveUser);
router.patch('/reject/:id', verifyAdmin, authCtrl.rejectUser);

module.exports = router;