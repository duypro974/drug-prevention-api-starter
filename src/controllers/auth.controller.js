// src/controllers/auth.controller.js

const User   = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

// ===== ĐĂNG KÝ =====
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, role: requestedRole } = req.body;

    // 1. Kiểm tra email đã tồn tại
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // 2. Quyết định role gán cho user
    const adminCount = await User.countDocuments({ role: "Admin" });
    let roleToAssign = requestedRole;

    if (!requestedRole) {
      // Nếu client không gửi role:
      roleToAssign = adminCount === 0 ? "Admin" : "Member";
    } else if (requestedRole === "Admin" && adminCount > 0) {
      // Đã có Admin rồi, không cho tạo thêm
      return res.status(403).json({ message: "Chỉ Admin mới được tạo thêm Admin" });
    }

    // 3. Hash mật khẩu
    const hashed = await bcrypt.hash(password, 10);

    // 4. Tạo user
    const user = await User.create({
      username,
      fullName,
      email,
      password: hashed,
      role: roleToAssign
    });

    // 5. Tạo token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ===== ĐĂNG NHẬP =====
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    if (!await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userData } = user.toObject();
    res.json({ message: "Đăng nhập thành công", token, user: userData });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ===== LẤY THÔNG TIN CÁ NHÂN =====
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ===== CẬP NHẬT THÔNG TIN CÁ NHÂN =====

exports.updateProfile = async (req, res) => {
  try {
    const { username, fullName, email } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (fullName) updateData.fullName = fullName;
    if (email)    updateData.email    = email;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: "Cập nhật thành công", user: updatedUser });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ===== ĐỔI MẬT KHẨU RIÊNG =====
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Cần mật khẩu cũ và mật khẩu mới" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    if (!await bcrypt.compare(oldPassword, user.password)) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ===== ĐĂNG XUẤT =====
exports.logout = async (req, res) => {
  // Với JWT, logout chỉ yêu cầu client xóa token
  res.json({ message: "Đăng xuất thành công" });
};
