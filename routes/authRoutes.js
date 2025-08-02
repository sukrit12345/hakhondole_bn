// ไฟล์: routes/authRoutes.js

const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getMe,
  verifyOtp,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    สมัครสมาชิกใหม่
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    เข้าสู่ระบบและรับ Token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    ดึงข้อมูล User ของตัวเอง (ต้องใช้ Token)
// @access  Private
router.get('/me', protect, getMe);


router.post('/forgot-password', forgotPassword);   // เพิ่ม Route ใหม่
router.post('/verify-otp', verifyOtp);   
router.put('/reset-password/:token', resetPassword); // เพิ่ม Route ใหม่

module.exports = router;

