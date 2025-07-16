// src/routes/programSurvey.routes.js

const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  submitProgramSurvey,
  getProgramSurveys,
  getProgramSurveyStats
} = require("../controllers/programSurvey.controller");
const { authenticate, authorize } = require("../middlewares/role.middleware");

/**
 * @swagger
 * /api/programs/{id}/survey/{phase}:
 *   post:
 *     summary: Nộp pre/post survey cho chương trình
 *     tags: [ProgramSurvey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID chương trình
 *       - in: path
 *         name: phase
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pre, post]
 *         description: Giai đoạn khảo sát
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, answers]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ASSIST, CRAFFT]
 *               answers:
 *                 type: array
 *                 items: { type: number }
 *     responses:
 *       201:
 *         description: Kết quả khảo sát
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 survey:
 *                   $ref: '#/components/schemas/Survey'
 *                 recommendation:
 *                   type: string
 *                 nextActions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label: { type: string }
 *                       link: { type: string }
 *       400: { description: Dữ liệu không hợp lệ }
 *       403: { description: Chưa đăng ký chương trình }
 *       404: { description: Không tìm thấy chương trình }
 */

router.post(
  "/:phase",
  authenticate,
  authorize(["Member", "Staff", "Consultant", "Manager", "Admin"]),
  submitProgramSurvey
);

/**
 * @swagger
 * /api/programs/{id}/survey:
 *   get:
 *     summary: Lấy tất cả khảo sát pre & post của chương trình
 *     tags: [ProgramSurvey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách khảo sát
 *       404:
 *         description: Không tìm thấy chương trình
 */
router.get(
  "/",
  authenticate,
  authorize(["Admin", "Manager"]),
  getProgramSurveys
);

/**
 * @swagger
 * /api/programs/{id}/survey/stats:
 *   get:
 *     summary: Lấy thống kê khảo sát của chương trình
 *     tags: [ProgramSurvey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kết quả thống kê
 *       404:
 *         description: Không tìm thấy chương trình
 */
router.get(
  "/stats",
  authenticate,
  authorize(["Admin", "Manager"]),
  getProgramSurveyStats
);

module.exports = router;
