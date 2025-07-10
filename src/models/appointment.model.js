const mongoose = require("mongoose");

/**
 * Mô hình Lịch hẹn Tư vấn
 * - user: người đặt
 * - consultant: chuyên viên
 * - scheduledAt: thời gian hẹn
 * - status: pending, confirmed, cancelled
 */
const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"]
  },
  consultant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Consultant is required"]
  },
  scheduledAt: {
    type: Date,
    required: [true, "Scheduled time is required"]
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);