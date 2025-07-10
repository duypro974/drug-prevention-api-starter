const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
   registerCourse,         // ← import thêm
  getCourseRegistrations  // ← nếu có
} = require("../controllers/course.controller");
const { authenticate, authorize } = require("../middlewares/role.middleware");


/**
 * @swagger
 * tags:
 *   name: Course
 *   description: Quản lý các khóa học
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Tạo khóa học mới
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - ageGroup
 *               - content
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               ageGroup: { type: string, enum: [học sinh, sinh viên, phụ huynh, giáo viên] }
 *               content: { type: string }
 *               category: { type: string }
 *     responses:
 *       201:
 *         description: Đã tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authenticate,
  authorize(["Staff", "Manager", "Admin"]),
  createCourse
);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Lấy danh sách tất cả khóa học
 *     tags: [Course]
 *     responses:
 *       200:
 *         description: Danh sách khóa học
 */
router.get("/", getAllCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Lấy chi tiết khóa học theo ID
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Thông tin khóa học
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:id", getCourseById);

/**
 * @swagger
 * /api/courses/{id}:
 *   patch:
 *     summary: Cập nhật một phần khóa học
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               ageGroup: { type: string, enum: [học sinh, sinh viên, phụ huynh, giáo viên] }
 *               content: { type: string }
 *               category: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch(
  "/:id",
  authenticate,
  authorize(["Staff", "Manager", "Admin"]),
  updateCourse
);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Xóa khóa học
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Đã xóa thành công
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
  authorize(["Manager", "Admin"]),
  deleteCourse
);
 /**
 * @swagger
 * /api/courses/{id}/register:
 *   post:
 *     summary: Đăng ký tham gia khóa học
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *       400:
 *         description: Đã đăng ký hoặc dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy khóa học
 */
router.post(
  "/:id/register",
  authenticate,
  authorize(["Member","Staff","Consultant","Manager","Admin"]),
  registerCourse
);

/**
 * @swagger
 * /api/courses/{id}/registrations:
 *   get:
 *     summary: Lấy danh sách đăng ký khóa học (Staff/Admin)
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Mảng đăng ký
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Không tìm thấy khóa học
 */
router.get(
  "/:id/registrations",
  authenticate,
  authorize(["Staff","Manager","Admin"]),
  getCourseRegistrations
);

module.exports = router;
