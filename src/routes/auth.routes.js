const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");
const { canCreateAdmin } = require("../middlewares/role.middleware");

// ===== ĐĂNG KÝ =====
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               fullName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [Guest, Member, Staff, Consultant, Manager, Admin] }
 *             example:
 *               username: "john123"
 *               fullName: "John Doe"
 *               email: "john@example.com"
 *               password: "password123"
 *               
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Email đã tồn tại
 *       403:
 *         description: Chỉ Admin mới được tạo thêm Admin
 *       500:
 *         description: Lỗi server
 */
router.post("/register", canCreateAdmin, register);

// ===== ĐĂNG NHẬP =====
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "duypro974@gmail.com" }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 token: { type: string }
 *                 user: { type: object }
 *       400:
 *         description: Thiếu email hoặc password
 *       401:
 *         description: Sai mật khẩu
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */
router.post("/login", login);

// ===== THÔNG TIN CÁ NHÂN =====
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Lấy thông tin người dùng
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *                 username: { type: string }
 *                 fullName: { type: string }
 *                 email: { type: string }
 *                 role: { type: string }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */
router.get("/profile", authenticate, getProfile);

// ===== CẬP NHẬT PROFILE =====
/**
 * @swagger
 * /api/auth/profile:
 *   patch:
 *     summary: Cập nhật thông tin người dùng (username, fullName, email)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               fullName: { type: string }
 *               email: { type: string }
 *             example:
 *               username: "newuser"
 *               fullName: "New Name"
 *               email: "newemail@example.com"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */
router.patch("/profile", authenticate, updateProfile);



// ===== ĐỔI MẬT KHẨU =====
/**
 * @swagger
 * /api/auth/change-password:
 *   patch:
 *     summary: Đổi mật khẩu (cần cung cấp mật khẩu cũ)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *             required: [oldPassword, newPassword]
 *             example:
 *               oldPassword: "oldpass123"
 *               newPassword: "newpass456"
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Thiếu field hoặc mật khẩu cũ sai
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */
router.patch("/change-password", authenticate, changePassword);

// ===== ĐĂNG XUẤT =====
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Đăng xuất thành công }
 *       401: { description: Unauthorized }
 *       500: { description: Lỗi server }
 */
router.post("/logout", authenticate, logout);

module.exports = router;
