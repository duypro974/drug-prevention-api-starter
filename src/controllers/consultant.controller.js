// src/controllers/consultant.controller.js

const User = require("../models/user.model");

/**
 * LẤY DANH SÁCH TẤT CẢ CONSULTANT (Admin)
 * GET /api/consultants
 */
exports.getAllConsultants = async (req, res) => {
  try {
    const consultants = await User.find({ role: "Consultant" }).select(
      "fullName email avatar qualifications specialties bio workSchedule availableSlots"
    );
    res.status(200).json({ consultants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * LẤY THÔNG TIN 1 CONSULTANT CỤ THỂ (Cho user hoặc admin)
 * GET /api/consultants/:id
 */
exports.getConsultantById = async (req, res) => {
  try {
    const consultant = await User.findOne({
      _id: req.params.id,
      role: "Consultant",
    }).select("fullName email avatar qualifications specialties bio workSchedule availableSlots");

    if (!consultant)
      return res.status(404).json({ message: "Không tìm thấy chuyên viên" });

    res.status(200).json({ consultant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * ADMIN: Cập nhật thông tin consultant bất kỳ
 * PATCH /api/consultants/:id
 */
exports.updateConsultantById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).select("-password");
    if (!updated) return res.status(404).json({ message: "Không tìm thấy chuyên viên" });
    res.json({ message: "Đã cập nhật thông tin chuyên viên", user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * ADMIN: Xóa consultant
 * DELETE /api/consultants/:id
 */
exports.deleteConsultantById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy chuyên viên" });
    res.json({ message: "Đã xoá chuyên viên" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * CONSULTANT: Lấy thông tin của chính mình
 * GET /api/consultants/me
 */
// controllers/consultant.controller.js

exports.getMyProfile = async (req, res) => {
  try {
    // Lấy từ user login, KHÔNG lấy từ req.params
    const consultant = await User.findById(req.user.id).select(
      "avatar qualifications specialties bio workSchedule availableSlots"
    );
    if (!consultant) return res.status(404).json({ message: "Không tìm thấy chuyên viên" });
    res.status(200).json({ consultant });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};


/**
 * CONSULTANT: Cập nhật thông tin của chính mình
 * PATCH /api/consultants/me/profile
 */
exports.updateMyProfile = async (req, res) => {
  try {
     console.log("Received update data:", req.body);  // Thêm dòng này để debug
    const updates = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select("-password");
    if (!updated) return res.status(404).json({ message: "Không tìm thấy chuyên viên" });
    res.json({ message: "Đã cập nhật thông tin chuyên viên", user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * CONSULTANT: Lấy khung giờ rảnh của mình
 * GET /api/consultants/me/slots
 */
exports.getMyAvailableSlots = async (req, res) => {
  try {
    if (req.user.role !== "Consultant") {
      return res.status(403).json({ message: "Chỉ consultant mới có quyền xem khung giờ rảnh." });
    }
    const consultant = await User.findById(req.user.id).select("availableSlots");
    res.json(consultant?.availableSlots || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * CONSULTANT: Cập nhật khung giờ rảnh
 * PATCH /api/consultants/me/slots
 */
exports.updateMyAvailableSlots = async (req, res) => {
  try {
    if (req.user.role !== "Consultant") {
      return res.status(403).json({ message: "Chỉ consultant mới có quyền cập nhật khung giờ rảnh." });
    }
    const { slots } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { availableSlots: slots },
      { new: true }
    ).select("availableSlots");
    res.json(updated?.availableSlots || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// status = "pending" | "confirmed" | "cancelled"
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });

    // Chỉ consultant owner mới được xác nhận
    if (req.user.role === "Consultant" && appt.consultant.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xác nhận lịch này" });
    }

    appt.status = status;
    await appt.save();
    res.json(appt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
