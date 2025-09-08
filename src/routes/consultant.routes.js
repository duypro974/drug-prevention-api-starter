// src/routes/consultant.routes.js

const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/role.middleware");
const ctl = require("../controllers/consultant.controller");
const apptCtl = require("../controllers/appointment.controller"); // Quản lý lịch hẹn

// ========== ROUTE CỤ THỂ TRƯỚC ==========

/**
 * @swagger
 * /api/consultants/me:
 *   get:
 *     summary: Lấy thông tin consultant hiện tại (Consultant)
 *     tags: [Consultant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin consultant
 */
router.get("/me", authenticate, authorize(["Consultant"]), ctl.getMyProfile);

/**
 * @swagger
 * /api/consultants/me/profile:
 *   patch:
 *     summary: Consultant tự cập nhật hồ sơ
 *     tags: [Consultant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsultantProfileUpdate'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch(
  "/me/profile",
  authenticate,
  authorize(["Consultant"]),
  ctl.updateMyProfile
);

/**
 * @swagger
 * /api/consultants/me/slots:
 *   get:
 *     summary: Lấy khung giờ làm việc rảnh hiện tại của consultant
 *     tags: [Consultant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách khung giờ rảnh
 */
router.get(
  "/me/slots",
  authenticate,
  authorize(["Consultant"]),
  ctl.getMyAvailableSlots
);

/**
 * @swagger
 * /api/consultants/me/slots:
 *   patch:
 *     summary: Cập nhật khung giờ làm việc rảnh cho consultant
 *     tags: [Consultant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       example: "monday"
 *                     slots:
 *                       type: array
 *                       items: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch(
  "/me/slots",
  authenticate,
  authorize(["Consultant"]),
  ctl.updateMyAvailableSlots
);

/**
 * @swagger
 * /api/consultants/me/appointments:
 *   get:
 *     summary: Consultant xem tất cả lịch hẹn mình nhận được
 *     tags: [Consultant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn
 */
router.get(
  "/me/appointments",
  authenticate,
  authorize(["Consultant"]),
  apptCtl.getConsultantAppointments
);

// ========== ROUTE DÙNG :id, LUÔN ĐỂ SAU CÙNG! ==========

/**
 * @swagger
 * /api/consultants:
 *   get:
 *     summary: Lấy danh sách tất cả consultant
 *     tags: [Consultant]
 *     responses:
 *       200:
 *         description: Danh sách chuyên viên
 */
router.get("/", ctl.getAllConsultants);

/**
 * @swagger
 * /api/consultants/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết 1 consultant
 *     tags: [Consultant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của consultant
 *     responses:
 *       200:
 *         description: Thông tin chuyên viên
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:id", ctl.getConsultantById);

/**
 * @swagger
 * /api/consultants/{id}:
 *   patch:
 *     summary: Admin cập nhật hồ sơ consultant bất kỳ
 *     tags: [Consultant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của consultant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsultantProfileUpdate'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch("/:id", authenticate, authorize(["Admin"]), ctl.updateConsultantById);

/**
 * @swagger
 * /api/consultants/{id}:
 *   delete:
 *     summary: Xoá consultant
 *     tags: [Consultant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của consultant
 *     responses:
 *       200:
 *         description: Xoá thành công
 */
router.delete("/:id", authenticate, authorize(["Admin"]), ctl.deleteConsultantById);

/**
 * @swagger
 * /api/consultants/appointments/{id}/status:
 *   patch:
 *     summary: Consultant xác nhận hoặc huỷ lịch hẹn (chỉ cho lịch của mình)
 *     tags: [Consultant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của lịch hẹn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch(
  "/appointments/:id/status",
  authenticate,
  authorize(["Consultant", "Admin", "Manager"]),
  apptCtl.updateStatus
);

module.exports = router;
