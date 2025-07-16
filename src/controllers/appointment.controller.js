const Appointment = require("../models/appointment.model");
const User = require("../models/user.model");

/**
 * Tạo lịch hẹn mới (user)
 */
exports.createAppointment = async (req, res) => {
  try {
    const { consultantId, scheduledAt } = req.body;
    if (!consultantId || !scheduledAt) {
      return res.status(400).json({ message: "Consultant và thời gian là bắt buộc" });
    }

    // Kiểm tra consultant có tồn tại và đúng role không
    const consultant = await User.findOne({ _id: consultantId, role: "Consultant" });
    if (!consultant) {
      return res.status(400).json({ message: "Consultant không hợp lệ" });
    }

    const appt = await Appointment.create({
      user: req.user.id,
      consultant: consultantId,
      scheduledAt,
      status: "pending"
    });
    res.status(201).json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Lấy lịch hẹn của chính user
 */
exports.getMyAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ user: req.user.id })
      .populate("consultant", "username fullName email")
      .sort("-scheduledAt");
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Lấy lịch hẹn của chuyên viên
 */
exports.getConsultantAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ consultant: req.user.id })
      .populate("user", "username fullName email")
      .sort("-scheduledAt");
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Admin hoặc Manager xem tất cả lịch hẹn
 */
exports.getAllAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find()
      .populate("user", "username fullName email")
      .populate("consultant", "username fullName email")
      .sort("-scheduledAt");
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Cập nhật trạng thái lịch hẹn (Admin/Manager hoặc consultant)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });

    // Nếu consultant, chỉ cho phép cập nhật lịch của mình
    if (!["Admin", "Manager"].includes(req.user.role)) {
      if (appt.consultant.toString() !== req.user.id) {
        return res.status(403).json({ message: "Bạn không có quyền cập nhật lịch này" });
      }
    }

    appt.status = status;
    await appt.save();
    res.json(appt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Hủy lịch (chính user hoặc consultant hoặc admin)
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });

    const uid = req.user.id;
    if (
      appt.user.toString() !== uid &&
      appt.consultant.toString() !== uid &&
      !["Admin", "Manager"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Bạn không có quyền hủy lịch này" });
    }

    appt.status = "cancelled";
    await appt.save();
    res.json({ message: "Đã hủy lịch hẹn", appt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
