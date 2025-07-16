const express = require("express");
const router = express.Router();
const { submitPublicSurvey } = require("../controllers/publicSurvey.controller");

/**
 * @swagger
 * tags:
 *   name: Survey
 *   description: Các API khảo sát

 * @swagger
 * /api/surveys/public:
 *   post:
 *     summary: Làm khảo sát ASSIST hoặc CRAFFT (không cần đăng nhập)
 *     tags: [Survey]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublicSurveyInput'
 *     responses:
 *       201:
 *         description: Kết quả khảo sát và hành động gợi ý
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 survey:
 *                   $ref: '#/components/schemas/Survey'
 *                 recommendation:
 *                   type: string
 *                 nextActions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                       link:
 *                         type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/public", submitPublicSurvey);

module.exports = router;
/**
 * @swagger
 * components:
 *   schemas:
 *     PublicSurveyInput:
 *       type: object
 *       required:
 *         - type
 *         - answers
 *       properties:
 *         type:
 *           type: string
 *           enum: [ASSIST, CRAFFT]
 *           description: Loại khảo sát (ASSIST hoặc CRAFFT)
 *         answers:
 *           type: array
 *           description: Mảng câu trả lời (số)
 *           items:
 *             type: number
 *         email:
 *           type: string
 *           format: email
 *           description: Email người làm khảo sát (tùy chọn)
 *
 *     Survey:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *         phase:
 *           type: string
 *         answers:
 *           type: array
 *           items:
 *             type: number
 *         score:
 *           type: number
 *         riskLevel:
 *           type: string
 *         email:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */
