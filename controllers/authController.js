// ไฟล์: controllers/authController.js

const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail'); // Import sendEmail
const crypto = require('crypto');


// ฟังก์ชันสร้าง JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // หมดอายุใน 30 วัน
  });
};

// ฟังก์ชันลงทะเบียนผู้ใช้
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // เช็คว่ากรอกครบหรือไม่
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือยัง
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'มีผู้ใช้อีเมลนี้อยู่เเล้ว' });
    }

    // แฮชรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ใหม่
    const user = await User.create({ email, password: hashedPassword });

    if (user) {
      // สร้างโปรไฟล์เริ่มต้น
      await Profile.create({
        user: user._id,
        name: name,
        images: [],
      });

      // ส่งข้อมูลกลับพร้อม token
      res.status(201).json({
        _id: user._id,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    ส่ง OTP ไปที่อีเมลของผู้ใช้
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      // 1. สร้าง OTP 6 หลัก
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // 2. เก็บ OTP และวันหมดอายุลงใน DB
      user.resetPasswordOtp = otp;
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // หมดอายุใน 10 นาที
      await user.save({ validateBeforeSave: false });

      const message = `
        <h1>คุณได้ส่งคำขอรีเซ็ตรหัสผ่าน</h1>
        <p>รหัสสำหรับยืนยันตัวตนของคุณคือ:</p>
        <h2 style="font-size: 24px; letter-spacing: 5px;">${otp}</h2>
        <p>รหัสนี้จะหมดอายุภายใน 10 นาที</p>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: 'รหัสยืนยันสำหรับรีเซ็ตรหัสผ่าน',
          message,
        });
      } catch (err) {
        console.error(err);
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: 'ไม่สามารถส่งอีเมลได้' });
      }
    }

    res.status(200).json({ message: 'หากอีเมลของคุณมีอยู่ในระบบ เราได้ส่งรหัสยืนยันไปให้แล้ว' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    ตรวจสอบ OTP ที่ผู้ใช้กรอก
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpire: { $gt: Date.now() }, // เช็คว่ายังไม่หมดอายุ
    });

    if (!user) {
      return res.status(400).json({ message: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    // ถ้า OTP ถูกต้อง, เราไม่ลบ OTP ทันที แต่จะรอให้ผู้ใช้ตั้งรหัสผ่านใหม่สำเร็จก่อน
    res.status(200).json({ success: true, message: 'รหัส OTP ถูกต้อง' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    ตั้งรหัสผ่านใหม่หลังจากยืนยัน OTP สำเร็จ
// @route   PUT /api/auth/reset-password
// controllers/authController.js

// @route   PUT /api/auth/reset-password
// @route PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Received request to /api/auth/reset-password`);
  console.log('Request Body:', req.body);
  console.log('Request Params:', req.params);

  try {
    const { email, password } = req.body;
    const otp = req.params.token;

    if (!email || !password || !otp) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log(`Reset password failed: Invalid OTP or expired for email ${email}`);
      return res.status(400).json({ message: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log(`Password reset successfully for email: ${email}`);
    res.status(200).json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });

  } catch (error) {
    console.error('Server Error in resetPassword:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  // req.user ถูกตั้งค่ามาจาก middleware 'protect'
  res.status(200).json(req.user);
};