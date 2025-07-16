// src/routes/consultant.routes.js

const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/role.middleware");
const {
  getAllConsultants,
  getConsultantById,
  updateConsultantProfile,
} = require("../controllers/consultant.controller");
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
router.get("/", getAllConsultants);

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
router.get("/:id", getConsultantById);

// Đường PATCH /profile bạn đã có rồi
router.patch(
  "/profile",
  authenticate,
  authorize(["Consultant"]),
  updateConsultantProfile
);

/**
 * @swagger
 * /api/consultants/profile:
 *   patch:
 *     summary: Cập nhật hồ sơ chuyên viên (CV, bằng cấp, lịch làm việc)
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
 *               qualifications:
 *                 type: array
 *                 items: { type: string }
 *               specialties:
 *                 type: array
 *                 items: { type: string }
 *               workSchedule:
 *                 type: object
 *                 example:
 *                   Monday: "08:00-12:00, 14:00-17:00"
 *                   Tuesday: "08:00-12:00"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch(
  "/profile",
  authenticate,
  authorize(["Consultant"]),
  updateConsultantProfile
);

module.exports = router;
/**
 * @swagger
 * components:
 *   schemas:
 *     ConsultantProfileUpdate:
 *       type: object
 *       properties:
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *         specialties:
 *           type: array
 *           items:
 *             type: string
 *         workSchedule:
 *           type: object
 *           example:
 *             Monday: "08:00-12:00, 14:00-17:00"
 *             Tuesday: "08:00-12:00"
 *             Wednesday: ""
 *             Thursday: "14:00-17:00"
 *             Friday: "08:00-12:00"
 *             Saturday: ""
 *             Sunday: ""
 */

