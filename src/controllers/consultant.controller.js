// src/controllers/consultant.controller.js

const User = require("../models/user.model");


/**
 * GET /api/consultants
 * Lấy danh sách tất cả consultant
 */
exports.getAllConsultants = async (req, res) => {
  try {
    const consultants = await User.find({ role: "Consultant" }).select(
      "fullName email qualifications specialties workSchedule"
    );

    res.status(200).json({ consultants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * GET /api/consultants/:id
 * Lấy thông tin 1 consultant cụ thể
 */
exports.getConsultantById = async (req, res) => {
  try {
    const consultant = await User.findOne({
      _id: req.params.id,
      role: "Consultant",
    }).select("fullName email qualifications specialties workSchedule");

    if (!consultant)
      return res.status(404).json({ message: "Không tìm thấy chuyên viên" });

    res.status(200).json({ consultant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateConsultantProfile = async (req, res) => {
  try {
    if (req.user.role !== "Consultant") {
      return res.status(403).json({ message: "Chỉ consultant mới được cập nhật hồ sơ của họ." });
    }

    const { qualifications, specialties, workSchedule } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { qualifications, specialties, workSchedule },
      { new: true }
    ).select("-password");

    res.json({ message: "Đã cập nhật thông tin chuyên viên", user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
