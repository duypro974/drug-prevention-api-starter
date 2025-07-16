const mongoose = require("mongoose");

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Tiêu đề chương trình là bắt buộc"]
  },
  description: {
    type: String,
    required: [true, "Mô tả chương trình là bắt buộc"]
  },
  startDate: {
    type: Date,
    required: [true, "Ngày bắt đầu là bắt buộc"]
  },
  endDate: {
    type: Date,
    required: [true, "Ngày kết thúc là bắt buộc"]
  },
  location: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      registeredAt: { type: Date, default: Date.now }
    }
  ],
  preSurvey: {
    type: String,
    enum: ["ASSIST", "CRAFFT"],
    default: null,
    description: "Loại khảo sát đầu vào yêu cầu (nếu có)"
  },
  postSurvey: {
    type: String,
    enum: ["ASSIST", "CRAFFT"],
    default: null,
    description: "Loại khảo sát đầu ra yêu cầu (nếu có)"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Program", programSchema);
