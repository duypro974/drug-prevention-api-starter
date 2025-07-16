// src/controllers/user.controller.js

const User = require("../models/user.model");

/**
 * Lấy danh sách tất cả user (Admin/Manager)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("createdAt");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Lấy chi tiết 1 user theo ID (Admin/Manager)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Cập nhật thông tin user (Admin)
 */
exports.updateUser = async (req, res) => {
  try {
    const { username, fullName, email } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: "Đã cập nhật thông tin user", user: updated });
  } catch (err) {
    console.error(err);
    // Trường hợp duplicate key (email/username) sẽ ném lỗi ở đây
    res.status(400).json({ message: err.message });
  }
};

/**
 * Thay đổi role của user (Admin)
 */
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["Member", "Staff", "Consultant", "Manager", "Admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: `Role phải là một trong: ${allowedRoles.join(", ")}`,
      });
    }
    // Không cho Admin tự đổi role chính họ
    if (req.user.id === req.params.id) {
      return res
        .status(400)
        .json({ message: "Không thể tự thay đổi role của chính mình" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    user.role = role;
    await user.save();

    res.json({
      message: "Đã cập nhật role",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Xóa user (Admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    // Không cho Admin tự xóa chính họ
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "Không thể tự xóa chính mình" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.json({
      message: "Đã xóa user",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

