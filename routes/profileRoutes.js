// ไฟล์: routes/profileRoutes.js

const express = require('express');
const { 
  getMyProfile, 
  updateMyProfile, 
  getAllProfiles, 
  getProfileById 
} = require('../controllers/profileController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/profiles
// @desc    ดึงโปรไฟล์ทั้งหมด (สำหรับหน้า Home) สามารถใส่ Filter ได้
// @access  Public
router.route('/').get(getAllProfiles);

// @route   GET /api/profiles/my-profile
// @desc    ดึงข้อมูลโปรไฟล์ของตัวเอง
// @access  Private (ต้องใช้ Token)
// 
// @route   PUT /api/profiles/my-profile
// @desc    อัปเดตข้อมูลโปรไฟล์ของตัวเอง
// @access  Private (ต้องใช้ Token)
router.route('/my-profile')
  .get(protect, getMyProfile)
  .put(protect, updateMyProfile);

// @route   GET /api/profiles/:id
// @desc    ดึงข้อมูลโปรไฟล์ของคนอื่นตาม ID (สำหรับหน้า Profile Detail)
// @access  Public
router.route('/:id').get(getProfileById);

module.exports = router;