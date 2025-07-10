const express = require("express");
const router  = express.Router();
const {
  createProgram,
  getAllPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
  registerProgram,
  getParticipants
} = require("../controllers/program.controller");
const { authenticate, authorize } = require("../middlewares/role.middleware");

/**
 * @swagger
 * tags:
 *   name: Program
 *   description: Quản lý chương trình truyền thông – giáo dục cộng đồng
 */

/**
 * @swagger
 * /api/programs:
 *   post:
 *     summary: Tạo chương trình mới
 *     tags: [Program]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title,description,startDate,endDate]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               location: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad Request }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post(
  "/",
  authenticate,
  authorize(["Admin","Manager"]),
  createProgram
);

/**
 * @swagger
 * /api/programs:
 *   get:
 *     summary: Lấy danh sách tất cả chương trình
 *     tags: [Program]
 *     responses:
 *       200: { description: Danh sách chương trình }
 */
router.get("/", getAllPrograms);

/**
 * @swagger
 * /api/programs/{id}:
 *   get:
 *     summary: Lấy chi tiết chương trình theo ID
 *     tags: [Program]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Chi tiết chương trình }
 *       404: { description: Not Found }
 */
router.get("/:id", getProgramById);

/**
 * @swagger
 * /api/programs/{id}:
 *   patch:
 *     summary: Cập nhật chương trình
 *     tags: [Program]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               location: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Bad Request }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not Found }
 */
router.patch(
  "/:id",
  authenticate,
  authorize(["Admin","Manager"]),
  updateProgram
);

/**
 * @swagger
 * /api/programs/{id}:
 *   delete:
 *     summary: Xóa chương trình
 *     tags: [Program]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not Found }
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["Admin","Manager"]),
  deleteProgram
);

/**
 * @swagger
 * /api/programs/{id}/register:
 *   post:
 *     summary: Đăng ký tham gia chương trình
 *     tags: [Program]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Registered }
 *       400: { description: Already registered }
 *       401: { description: Unauthorized }
 *       404: { description: Not Found }
 */
router.post("/:id/register", authenticate, registerProgram);

/**
 * @swagger
 * /api/programs/{id}/participants:
 *   get:
 *     summary: Lấy danh sách người tham gia
 *     tags: [Program]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Danh sách participants }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not Found }
 */
router.get(
  "/:id/participants",
  authenticate,
  authorize(["Admin","Manager"]),
  getParticipants
);

module.exports = router;
