const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Tên người dùng là bắt buộc'],
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    },
    role: {
      type: String,
      enum: ['Guest', 'Member', 'Staff', 'Consultant', 'Manager', 'Admin'],
      default: 'Member',
    },
    isVerified: {
      type: Boolean,
      default: false,
      description: 'Cờ đánh dấu đã xác thực email hay chưa',
    },
    verificationToken: {
      type: String,
      description: 'Token dùng để gửi link xác thực email',
    },
    resetPasswordToken: {
      type: String,
      description: 'Token dùng để gửi link đặt lại mật khẩu',
    },
    resetPasswordExpires: {
      type: Date,
      description: 'Thời gian hết hạn của token đặt lại mật khẩu',
    },

    // ⏰ Lịch làm việc theo từng ngày (cho Consultant)
    workSchedule: {
      type: Map,
      of: String,
      description: 'Lịch làm việc theo ngày trong tuần, ví dụ: Monday: "08:00-12:00, 14:00-17:00"',
      default: {},
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Trước khi lưu: nếu password mới hoặc đã thay đổi, hash lại
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Method so sánh mật khẩu khi login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
