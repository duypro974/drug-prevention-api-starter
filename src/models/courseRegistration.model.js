// src/models/courseRegistration.model.js
const mongoose = require("mongoose");

/**
 * Mô hình lưu đăng ký khóa học
 * - user: Người đăng ký
 * - course: Khóa học được đăng ký
 * - registeredAt: Thời gian đăng ký
 * - completed: Đã hoàn thành khóa học chưa
 * - preSurveyDone: Đã làm Pre-Survey chưa
 * - preSurveyAt: Thời điểm làm Pre-Survey
 * - preRiskLevel: Mức rủi ro (low/moderate/high) từ Pre-Survey
 * - postSurveyDone: Đã làm Post-Survey chưa
 * - postSurveyAt: Thời điểm làm Post-Survey
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
  },
  preSurveyDone: {
    type: Boolean,
    default: false
  },
  preSurveyAt: {
    type: Date,
    default: null
  },
  preRiskLevel: {
    type: String,
    enum: ["low", "moderate", "high"],
    default: null
  },
  postSurveyDone: {
    type: Boolean,
    default: false
  },
  postSurveyAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: "registeredAt", updatedAt: false }
});

// Đảm bảo mỗi user chỉ đăng ký 1 lần cho mỗi course
courseRegSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("CourseRegistration", courseRegSchema);
