// ในโฟลเดอร์ routes/ ของโปรเจกต์ Node.js ของคุณ
// เช่น routes/upload.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// ✅ 1. ตั้งค่า Cloudinary ด้วย Credentials ของคุณ
cloudinary.config({ 
  cloud_name: 'drjwpnsrc', // ใส่ Cloud Name ของคุณ
  api_key: '948287679946573',       // ใส่ API Key ของคุณ
  api_secret: '5Ln5m6i9h67fYVIjE78DVJ7yceY'  // ใส่ API Secret ของคุณ
});

// ✅ 2. ตั้งค่า Multer ให้รับไฟล์ใน Memory (ไม่ต้องเซฟลง disk ของ server)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ 3. สร้าง API Endpoint สำหรับอัปโหลด
// ใช้ upload.single('image') โดย 'image' คือ key ที่ Flutter ต้องส่งมา
router.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // สร้างฟังก์ชันสำหรับอัปโหลด stream ไปที่ Cloudinary
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
              { 
                folder: "profile_images", // (Optional) สร้างโฟลเดอร์ใน Cloudinary
                // public_id: `user_${req.user.id}` // (Optional) ตั้งชื่อไฟล์ตาม user id
              },
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );
            // แปลง Buffer ของไฟล์จาก Multer ให้เป็น Stream แล้วส่งให้ Cloudinary
           streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    // เรียกใช้ฟังก์ชันอัปโหลด
    async function uploadImage(req) {
        try {
            let result = await streamUpload(req);
            console.log(result);
            // ส่ง URL ที่ปลอดภัยกลับไปให้ Flutter
            res.status(200).json({ success: true, url: result.secure_url });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Failed to upload image' });
        }
    }

    uploadImage(req);
});

module.exports = router;