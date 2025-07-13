// src/models/courseRegistration.model.js
const mongoose = require("mongoose");

/**
 * Mô hình lưu đăng ký khóa học
 * - user: Người đăng ký
 * - course: Khóa học được đăng ký
 * - registeredAt: Thời gian đăng ký
 * - completed: Đã hoàn thành khóa học chưa
 */
const courseRegSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"]
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course is required"]
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: "registeredAt", updatedAt: false }
});

// Đảm bảo mỗi user chỉ đăng ký 1 lần cho mỗi course
courseRegSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("CourseRegistration", courseRegSchema);
