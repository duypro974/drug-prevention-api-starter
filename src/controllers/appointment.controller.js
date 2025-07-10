const Appointment = require("../models/appointment.model");

/**
 * Tạo lịch hẹn mới (user)
 */
exports.createAppointment = async (req, res) => {
  try {
    const { consultantId, scheduledAt } = req.body;
    if (!consultantId || !scheduledAt) {
      return res.status(400).json({ message: "Consultant and scheduledAt required" });
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
      .populate("consultant", "username fullName")
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
      .populate("user", "username fullName")
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
      .populate("user","username fullName")
      .populate("consultant","username fullName")
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
    if (!["pending","confirmed","cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Not found" });

    // Nếu consultant, chỉ cho phép confirm/cancel
    if (req.user.role !== "Admin" && req.user.role !== "Manager") {
      if (appt.consultant.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
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
    if (!appt) return res.status(404).json({ message: "Not found" });
    // Kiểm quyền: user hoặc consultant hoặc Admin
    const uid = req.user.id;
    if (appt.user.toString() !== uid && appt.consultant.toString() !== uid
        && !["Admin","Manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    appt.status = "cancelled";
    await appt.save();
    res.json({ message: "Cancelled", appt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};