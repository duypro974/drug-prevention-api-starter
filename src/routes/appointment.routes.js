const express = require("express");
const router  = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getConsultantAppointments,
  getAllAppointments,
  updateStatus,
  cancelAppointment
} = require("../controllers/appointment.controller");
const { authenticate, authorize } = require("../middlewares/role.middleware");

/**
 * @swagger
 * tags:
 *   name: Appointment
 *   description: Đặt lịch tư vấn
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Tạo lịch hẹn mới
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [consultantId, scheduledAt]
 *             properties:
 *               consultantId: { type: string }
 *               scheduledAt: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad request
 */
router.post("/", authenticate, createAppointment);

/**
 * @swagger
 * /api/appointments/mine:
 *   get:
 *     summary: Lấy lịch hẹn của bản thân (user)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách appointments
 */
router.get("/mine", authenticate, getMyAppointments);

/**
 * @swagger
 * /api/appointments/consultant:
 *   get:
 *     summary: Lấy lịch hẹn của consultant
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách appointments
 */
router.get("/consultant", authenticate, getConsultantAppointments);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: (Admin/Manager) Lấy tất cả lịch hẹn
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả
 */
router.get("/", authenticate, authorize(["Manager","Admin"]), getAllAppointments);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái (Admin/Manager hoặc consultant)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, cancelled] }
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch("/:id/status", authenticate, updateStatus);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Hủy lịch (user hoặc consultant hoặc Admin)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Cancelled
 */
router.patch("/:id/cancel", authenticate, cancelAppointment);

module.exports = router;
