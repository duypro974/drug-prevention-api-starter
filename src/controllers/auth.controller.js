const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { sendVerificationEmail } = require("../services/email.service");

// ===== ĐĂNG KÝ =====
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, fullName, role: requestedRole } = req.body;
    console.log("Register Request:", { username, email, fullName, requestedRole }); // Log request

    // 1. Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // 2. Quyết định role gán cho user
    const adminCount = await User.countDocuments({ role: "Admin" });
    let roleToAssign = requestedRole;
    if (!requestedRole) {
      roleToAssign = adminCount === 0 ? "Admin" : "Member";
    } else if (requestedRole === "Admin" && adminCount > 0) {
      console.log("Admin creation restricted, adminCount:", adminCount);
      return res.status(403).json({ message: "Chỉ Admin mới được tạo thêm Admin" });
    }
    console.log("Assigned Role:", roleToAssign);

    // 4. Tạo verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    console.log("Generated Verification Token:", verificationToken);

    // 5. Tạo user với isVerified=false
    const user = await User.create({
      username,
      fullName,
      email,
      password,
      role: roleToAssign,
      isVerified: false,
      verificationToken
    });
    console.log("Created User:", user);

    // 6. Gửi email xác thực
    await sendVerificationEmail(email, verificationToken);
    console.log("Verification Email sent to:", email);

    res.status(201).json({
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error in register:", err);
    next(err);
  }
};

// ===== XÁC THỰC EMAIL =====
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    console.log("Received Verification Token:", token);

    const user = await User.findOne({ verificationToken: token });
    console.log("Found User for Verification:", user);
    if (!user) {
      console.log("No user found for token:", token);
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    console.log("User verified and saved:", user);

    res.status(200).json({ message: "Xác thực email thành công." });
  } catch (err) {
    console.error("Error in verifyEmail:", err);
    next(err);
  }
};

// ===== ĐĂNG NHẬP =====
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("Login Request:", { email, password });

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    }

    const user = await User.findOne({ email });
    console.log("Found User for Login:", user);
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Comparison Result:", isMatch);
    if (!isMatch) {
      console.log("Password mismatch for user:", user.email);
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // Kiểm tra đã xác thực email
    if (!user.isVerified) {
      console.log("User not verified:", user.email);
      return res.status(403).json({ message: "Vui lòng xác thực email trước khi đăng nhập" });
    }

    // Tạo JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log("Generated JWT Token:", token);

    const { password: _, verificationToken, ...userData } = user.toObject();
    res.json({ message: "Đăng nhập thành công", token, user: userData });
  } catch (err) {
    console.error("Error in login:", err);
    next(err);
  }
};

// ===== LẤY THÔNG TIN CÁ NHÂN =====
exports.getProfile = async (req, res, next) => {
  try {
    console.log("Fetching profile for user ID:", req.user.id);
    const user = await User.findById(req.user.id).select("-password -verificationToken");
    if (!user) {
      console.log("User not found for ID:", req.user.id);
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    console.log("User Profile:", user);
    res.json(user);
  } catch (err) {
    console.error("Error in getProfile:", err);
    next(err);
  }
};

// ===== CẬP NHẬT THÔNG TIN CÁ NHÂN =====
exports.updateProfile = async (req, res, next) => {
  try {
    const { username, fullName, email } = req.body;
    console.log("Update Profile Request:", { username, fullName, email });

    const updateData = {};
    if (username) updateData.username = username;
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -verificationToken");

    if (!updatedUser) {
      console.log("User not found for ID:", req.user.id);
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    console.log("Updated User:", updatedUser);
    res.json({ message: "Cập nhật thành công", user: updatedUser });
  } catch (err) {
    console.error("Error in updateProfile:", err);
    next(err);
  }
};

// ===== ĐỔI MẬT KHẨU =====
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    console.log("Change Password Request:", { oldPassword, newPassword });

    if (!oldPassword || !newPassword) {
      console.log("Missing oldPassword or newPassword");
      return res.status(400).json({ message: "Cần mật khẩu cũ và mật khẩu mới" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("User not found for ID:", req.user.id);
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    console.log("Old Password Comparison Result:", isMatch);
    if (!isMatch) {
      console.log("Old password mismatch for user:", user.email);
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    user.password = newPassword;      // <-- Chỉ gán chuỗi mới, KHÔNG hash ở đây!
    await user.save();                // <-- Mongoose sẽ tự hash trong pre('save')
    console.log("Password changed for user:", user.email);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Error in changePassword:", err);
    next(err);
  }
};


// ===== QUÊN MẬT KHẨU =====
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log("Forgot Password Request for email:", email);

    if (!email) {
      console.log("Email is missing");
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log("Generated Reset Token:", resetToken);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Hết hạn sau 1 giờ
    console.log("Reset Token Expires At:", new Date(user.resetPasswordExpires));
    await user.save();
    console.log("Saved User Reset Token:", user.resetPasswordToken);

    // Gửi email reset password
    const resetUrl = `${process.env.BACKEND_URL}/api/auth/reset-password?token=${resetToken}`;
    console.log("Reset URL to be sent:", resetUrl);
    await sendVerificationEmail(email, resetToken, "resetPassword");
    console.log("Reset Email sent to:", email);

    res.json({ message: "Email đặt lại mật khẩu đã được gửi" });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    next(err);
  }
};

// ===== ĐẶT LẠI MẬT KHẨU =====
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;
    console.log("Reset Password Request - Token:", token, "New Password:", newPassword);

    if (!newPassword) {
      console.log("New password is missing");
      return res.status(400).json({ message: "Mật khẩu mới là bắt buộc" });
    }

    console.log("Current Time:", new Date());
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    console.log("Query Result - User:", user, "Token:", token, "Expires:", user?.resetPasswordExpires);

    if (!user) {
      console.log("No user found or token expired for token:", token);
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    user.password = newPassword;
    user.markModified('password');
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    console.log("User after save:", await User.findById(user._id));

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    next(err);
  }
};

// ===== ĐĂNG XUẤT =====
exports.logout = (req, res) => {
  console.log("Logout Request for user:", req.user?.id);
  res.json({ message: "Đăng xuất thành công" });
};