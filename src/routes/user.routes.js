const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/role.middleware");
/**
 * @swagger
 * /api/users/consultants:
 *   get:
 *     summary: Lấy danh sách chuyên viên (consultant) để đặt lịch
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách consultant
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   username: { type: string }
 *                   fullName: { type: string }
 *                   email: { type: string }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Lỗi server
 */
router.get("/consultants", authenticate, userController.getConsultants);


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng (Admin)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả user (Admin, Manager)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mảng user (không kèm password)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  authorize(["Admin", "Manager"]),
  userController.getAllUsers
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy chi tiết user theo ID (Admin, Manager)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Thông tin user (không kèm password)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Không tìm thấy
 */
router.get(
  "/:id",
  authenticate,
  authorize(["Admin", "Manager"]),
  userController.getUserById
);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Cập nhật thông tin user (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *               username: "updatedUser"
 *               fullName: "Nguyễn Văn B"
 *               email: "vanb@example.com"
 *     responses:
 *       200:
 *         description: Đã cập nhật thông tin user
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Không tìm thấy user
 */
router.patch(
  "/:id",
  authenticate,
  authorize(["Admin"]),
  userController.updateUser
);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Thay đổi role của user (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Member, Staff, Consultant, Manager, Admin]
 *     responses:
 *       200:
 *         description: Đã cập nhật role
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Không tìm thấy
 */
router.patch(
  "/:id/role",
  authenticate,
  authorize(["Admin"]),
  userController.changeUserRole
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa user (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Đã xóa user
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Không tìm thấy
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["Admin"]),
  userController.deleteUser
);



module.exports = router;
