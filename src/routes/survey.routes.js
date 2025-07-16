const express = require("express");
const router  = express.Router();
const {
  getQuestions,
  submitSurvey,
  getMySurveys,
  getSurveyById,
  getAllSurveys,
  updateSurvey,
  deleteSurvey,
  filterSurveys,
  statsByRisk,
  exportCsv
} = require("../controllers/survey.controller");
const { authenticate, authorize } = require("../middlewares/role.middleware");

/**
 * @swagger
 * tags:
 *   name: Survey
 *   description: Khảo sát trắc nghiệm ASSIST, CRAFFT
 */

// Lấy bộ câu hỏi
/**
 * @swagger
 * /api/surveys/questions:
 *   get:
 *     summary: Lấy bộ câu hỏi ASSIST hoặc CRAFFT
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ASSIST, CRAFFT]
 *         required: true
 *         description: Loại khảo sát
 *     responses:
 *       200:
 *         description: Mảng câu hỏi
 *       400:
 *         description: Type không hợp lệ
 *       401:
 *         description: Unauthorized
 */
router.get("/questions", getQuestions);


// Submit survey
/**
 * @swagger
 * /api/surveys:
 *   post:
 *     summary: Nộp kết quả khảo sát
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - answers
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ASSIST, CRAFFT]
 *               answers:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       201:
 *         description: Survey đã được lưu, kèm khuyến nghị
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, submitSurvey);

// Lấy lịch sử cá nhân
/**
 * @swagger
 * /api/surveys/mine:
 *   get:
 *     summary: Lấy lịch sử khảo sát của bản thân
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách survey
 *       401:
 *         description: Unauthorized
 */
router.get("/mine", authenticate, getMySurveys);

// Lấy chi tiết theo ID
/**
 * @swagger
 * /api/surveys/{id}:
 *   get:
 *     summary: Lấy chi tiết survey theo ID (owner hoặc Admin)
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Survey ID
 *     responses:
 *       200:
 *         description: Thông tin survey
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get("/:id", authenticate, getSurveyById);

// Admin/Manager routes
/**
 * @swagger
 * /api/surveys:
 *   get:
 *     summary: Lấy tất cả survey (Admin/Manager)
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách survey
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  authorize(["Manager","Admin"]),
  getAllSurveys
);

/**
 * @swagger
 * /api/surveys/{id}:
 *   patch:
 *     summary: Cập nhật survey (Admin/Manager)
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Survey ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.patch(
  "/:id",
  authenticate,
  authorize(["Manager","Admin"]),
  updateSurvey
);

/**
 * @swagger
 * /api/surveys/{id}:
 *   delete:
 *     summary: Xóa survey (Admin/Manager)
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Survey ID
 *     responses:
 *       200:
 *         description: Deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["Manager","Admin"]),
  deleteSurvey
);

/**
 * @swagger
 * /api/surveys/filter:
 *   get:
 *     summary: Lọc & phân trang survey (Admin/Manager)
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Lọc theo loại
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *         description: Lọc theo mức độ rủi ro
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang (mặc định 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số item/trang (mặc định 10)
 *     responses:
 *       200:
 *         description: Filtered list
 */
router.get(
  "/filter",
  authenticate,
  authorize(["Manager","Admin"]),
  filterSurveys
);

/**
 * @swagger
 * /api/surveys/stats/risk:
 *   get:
 *     summary: Thống kê số survey theo riskLevel
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats
 */
router.get(
  "/stats/risk",
  authenticate,
  authorize(["Manager","Admin"]),
  statsByRisk
);

/**
 * @swagger
 * /api/surveys/export/csv:
 *   get:
 *     summary: Xuất báo cáo CSV survey
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 */
router.get(
  "/export/csv",
  authenticate,
  authorize(["Manager","Admin"]),
  exportCsv
);

module.exports = router;
