const mongoose = require('mongoose');

// Schema สำหรับข้อมูลการติดต่อ (ฝังอยู่ใน Profile)
const contactInfoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['line', 'facebook', 'instagram'], // ใช้ enum เหมือนใน Flutter
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const profileSchema = new mongoose.Schema({
  // เชื่อมโยงกับ User ID ของคนที่ล็อกอิน
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // อ้างอิงถึง User Model
    required: true,
  },
  name: { type: String, required: true },
  birthdate: { type: Date }, // ใช้ประเภท Date
  province: { type: String },
  district: { type: String },
  subdistrict: { type: String },
  gender: { type: String },
  income: { type: String },
  bio: { type: String },
  images: [{ type: String }], // Array ของ String
  contact: contactInfoSchema, // ฝัง Schema ของ ContactInfo เข้ามา
}, { timestamps: true }); // timestamps: true จะสร้าง createdAt และ updatedAt ให้เอง

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;