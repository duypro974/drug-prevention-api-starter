const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // nếu có đăng nhập
  sessionId: { type: String, required: false }, // dùng cho guest
  message: String,
  reply: String,
  emotion: { type: String }, // cảm xúc phân tích từ AI
  recommendation: { type: String }, // đề xuất hành động từ AI
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
