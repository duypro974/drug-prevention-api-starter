const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Tiêu đề khóa học là bắt buộc"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  ageGroup: {
    type: String,
    required: [true, "Nhóm độ tuổi là bắt buộc"],
    enum: ["học sinh", "sinh viên", "phụ huynh", "giáo viên"],
     default: "học sinh"
  },
  content: {
    type: String, // hoặc Array nếu bạn muốn chia theo chương
    required: [true, "Nội dung khóa học không được để trống"],
  },
  category: {
    type: String,
    default: "nhận thức", // ví dụ: nhận thức, kỹ năng, ...
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Course", courseSchema);
