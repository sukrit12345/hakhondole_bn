// models/userModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // -----!! จุดแก้ไข: เปลี่ยนฟิลด์สำหรับเก็บ OTP !!-----
  resetPasswordOtp: String,      // เก็บ OTP
  resetPasswordExpire: Date,   // เก็บวันหมดอายุ (เหมือนเดิม)
}, {
  timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// -----!! จุดแก้ไข: ลบ getResetPasswordToken() ทิ้งไป !!-----
// เราจะไม่ใช้ Method นี้แล้ว เพราะ OTP จะถูกสร้างใน Controller โดยตรง

const User = mongoose.model('User', userSchema);
module.exports = User;