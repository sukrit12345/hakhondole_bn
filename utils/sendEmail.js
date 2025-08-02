// utils/sendEmail.js
const nodemailer = require('nodemailer');


const sendEmail = async (options) => {
  // 1. สร้าง Transporter (ตัวส่งอีเมล)
  // **สำคัญ:** ให้ใช้ข้อมูลจากผู้ให้บริการอีเมลของคุณเอง
  // สำหรับ Gmail, คุณอาจต้องสร้าง "App Password"
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // เช่น 'smtp.gmail.com'
    port: process.env.SMTP_PORT, // เช่น 465 หรือ 587
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL, // อีเมลของคุณ
      pass: process.env.SMTP_PASSWORD, // App Password ของคุณ
    },
  });

  // 2. กำหนดตัวเลือกอีเมล
  const mailOptions = {
    from: `YourAppName <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. ส่งอีเมล
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;