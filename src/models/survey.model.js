const mongoose = require("mongoose");

/**
 * Schema cho khảo sát ASSIST và CRAFFT
 * - user: tham chiếu đến người dùng
 * - type: loại khảo sát (ASSIST hoặc CRAFFT)
 * - answers: mảng giá trị trả lời số
 * - score: tổng điểm tính từ answers
 * - riskLevel: mức độ rủi ro (low, moderate, high)
 * - timestamps: tự động lưu createdAt và updatedAt
 */
const surveySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.phase !== "public";
    },
  },
  course: {                    // <-- THÊM TRƯỜNG NÀY
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: false,           // chỉ bắt buộc với pre/post (BE validate khi submit)
  },
  type: {
    type: String,
    required: [true, "Survey type is required"],
    enum: {
      values: ["ASSIST", "CRAFFT"],
      message: "Type must be either ASSIST or CRAFFT",
    },
  },
  answers: {
    type: [Number],
    required: [true, "Answers are required"],
    validate: {
      validator: function (arr) {
        return arr.every((v) => typeof v === "number");
      },
      message: "Answers must be an array of numbers",
    },
  },
  score: {
    type: Number,
    required: [true, "Score is required"],
    min: [0, "Score cannot be negative"],
  },
  riskLevel: {
    type: String,
    required: [true, "Risk level is required"],
    enum: {
      values: ["low", "moderate", "high"],
      message: "Risk level must be low, moderate, or high",
    },
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    required: false,
  },
  phase: {
    type: String,
    enum: ["pre", "post", "public"],
    required: false,
    default: "pre",
  },
},
{
  timestamps: true,
});

module.exports = mongoose.model("Survey", surveySchema);
