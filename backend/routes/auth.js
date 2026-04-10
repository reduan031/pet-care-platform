// ================================
// FILE: backend/routes/auth.js
// ================================
const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, sendOtp, verifyOtp, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;

