const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');


// โหลด Environment Variables
dotenv.config();

// import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/upload'); // ✅ 1. เพิ่มบรรทัดนี้เข้ามา

const app = express();

// Middleware
app.use(cors()); // อนุญาตให้เรียก API จาก Domain อื่น
app.use(express.json()); // ทำให้ Express อ่าน JSON body ได้

// Connect to Database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api', uploadRoutes); // ✅ 2. เพิ่มบรรทัดนี้เข้ามา

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
