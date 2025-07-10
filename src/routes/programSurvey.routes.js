const express = require("express");
const router  = express.Router({ mergeParams: true });
const {
  submitProgramSurvey,
  getProgramSurveys,
  getProgramSurveyStats
} = require("../controllers/programSurvey.controller");
const { authenticate, authorize } = require("../middlewares/role.middleware");

/**
 * @swagger
 * tags:
 *   name: ProgramSurvey
 *   description: Khảo sát pre/post cho Program
 */

/**
 * @swagger
 * /api/programs/{id}/survey/{phase}:
 *   post:
 *     summary: Nộp {phase}-survey cho chương trình
 *     tags: [ProgramSurvey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Program ID
 *       - in: path
 *         name: phase
 *         schema:
 *           type: string
 *           enum: [pre, post]
 *         required: true
 *         description: pre hoặc post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, answers]
 *             properties:
 *               type: { type: string, enum: [ASSIST, CRAFFT] }
 *               answers: { type: array, items: { type: number } }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad Request }
 *       403: { description: Forbidden }
 *       404: { description: Not Found }
 */
router.post(
  "/",
  authenticate,
  authorize(["Member","Staff","Consultant","Manager","Admin"]),
  submitProgramSurvey
);

/**
 * @swagger
 * /api/programs/{id}/survey:
 *   get:
 *     summary: Lấy tất cả pre & post survey của chương trình
 *     tags: [ProgramSurvey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Survey list grouped } 
 *       404: { description: Not Found }
 */
router.get(
  "/",
  authenticate,
  authorize(["Admin","Manager"]),
  getProgramSurveys
);

/**
 * @swagger
 * /api/programs/{id}/survey/stats:
 *   get:
 *     summary: Thống kê pre/post trung bình của chương trình
 *     tags: [ProgramSurvey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Stats object } 
 *       404: { description: Not Found }
 */
router.get(
  "/stats",
  authenticate,
  authorize(["Admin","Manager"]),
  getProgramSurveyStats
);

module.exports = router;
