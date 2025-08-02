

const Profile = require('../models/profileModel');

exports.getAllProfiles = async (req, res) => {
  try {
    const { province, district, subdistrict, gender, income } = req.query;

    // -----!! จุดแก้ไข: กำหนดกฎพื้นฐานทั้งหมดตั้งแต่แรก !!-----
    // 1. สร้างเงื่อนไขการกรองพื้นฐาน (Base Filter)
    const filter = {
      // กฎข้อที่ 1: ต้องมีฟิลด์ images และไม่เป็น array ว่าง
      images: { $exists: true, $ne: [] },
      
      // กฎข้อที่ 2: ต้องมีฟิลด์ income และไม่เป็นค่า null หรือสตริงว่าง
      income: { $exists: true, $ne: null, $ne: "" }
    };
    // ----------------------------------------------------

    // 2. เพิ่มเงื่อนไขอื่นๆ ที่ผู้ใช้เลือกเข้ามา
    if (province && province !== 'ทุกจังหวัด') filter.province = province;
    if (district && district !== 'ทุกอำเภอ') filter.district = district;
    if (subdistrict && subdistrict !== 'ทุกตำบล') filter.subdistrict = subdistrict;
    if (gender && gender !== 'ทั้งหมด') filter.gender = gender;
    
    // 3. หากผู้ใช้เลือกช่วงรายได้ ให้ "เขียนทับ" กฎ income เดิมด้วยเงื่อนไขที่เฉพาะเจาะจงขึ้น
    if (income && income !== 'ทั้งหมด' && income !== '') {
      // เมื่อ income ใน DB เป็น String เราจะเปรียบเทียบค่า String ตรงๆ
      filter.income = income;
    }

    // 4. ใช้ Aggregation Pipeline เพื่อกรองและสุ่มข้อมูล
    const profiles = await Profile.aggregate([
      // Stage 1: กรองเอกสารทั้งหมดที่ตรงตามเงื่อนไขที่สร้างไว้
      { $match: filter },

      // Stage 2: สุ่มเอกสารทั้งหมดที่ผ่านการกรอง
      { $sample: { size: 1000 } } 
    ]);

    res.json(profiles);

  } catch (error) {
    console.error('Error fetching and randomizing profiles:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


exports.getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
}

// เเสดงข้อมลโปรไฟล์
exports.getMyProfile = async (req, res) => {
  try {
    // --- เราจะใช้ req.user._id ที่ได้จาก Token ---
    // ซึ่งถูกถอดรหัสมาให้โดย authMiddlewareฟ
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      // กรณีที่ User มี account แต่ยังไม่มี Profile (ซึ่งไม่ควรเกิดขึ้นในระบบเรา)
      return res.status(404).json({ message: 'ไม่พบโปรไฟล์สำหรับผู้ใช้นี้' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profiles/my-profile
exports.updateMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      // อัปเดตข้อมูลจาก req.body
      profile.name = req.body.name || profile.name;
      profile.birthdate = req.body.birthdate || profile.birthdate;
      profile.province = req.body.province || profile.province;
      profile.district = req.body.district || profile.district;
      profile.subdistrict = req.body.subdistrict || profile.subdistrict;
      profile.gender = req.body.gender || profile.gender;
      profile.income = req.body.income || profile.income;
      profile.bio = req.body.bio || profile.bio;
      profile.images = req.body.images || profile.images;
      profile.contact = req.body.contact || profile.contact;

      const updatedProfile = await profile.save();
      res.json(updatedProfile);
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};