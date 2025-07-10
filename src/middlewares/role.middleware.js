// src/middlewares/role.middleware.js

const jwt  = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * Middleware xác thực JWT.
 * Nếu token hợp lệ, gán req.user = { id, role }.
 */
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Token không hợp lệ" });
  }
};

/**
 * Middleware kiểm soát truy cập theo role.
 * @param {string[]} allowedRoles mảng các role được phép truy cập
 */
exports.authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Access denied" });
  }
  next();
};

/**
 * Middleware đặc biệt cho route đăng ký (/register).
 * - Cho phép tạo bất kỳ role nào (Guest, Member, Staff, Consultant, Manager) mà không cần token.
 * - Cho phép tạo Admin lần đầu nếu hệ thống chưa có Admin.
 * - Nếu đã có Admin, chỉ token của Admin mới được phép tạo thêm Admin.
 */
exports.canCreateAdmin = async (req, res, next) => {
  const wantedRole = req.body.role;

  // Nếu không phải cố gắng tạo Admin => cho qua
  if (wantedRole !== "Admin") {
    return next();
  }

  // Đếm xem đã có Admin nào chưa
  let existingAdmins;
  try {
    existingAdmins = await User.countDocuments({ role: "Admin" });
  } catch (err) {
    return res.status(500).json({ message: "Server error kiểm tra Admin" });
  }

  // Chưa có Admin nào: cho phép tạo Admin đầu tiên mà không cần token
  if (existingAdmins === 0) {
    return next();
  }

  // Đã có ít nhất 1 Admin: bắt buộc phải có token của Admin
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Chỉ Admin mới được tạo thêm Admin" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "Admin") {
      return res.status(403).json({ message: "Chỉ Admin mới được tạo thêm Admin" });
    }
    // Gán req.user để controller hoặc các middleware sau có thể dùng
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
