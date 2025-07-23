const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  registerCourse,
  getCourseRegistrations
} = require("../controllers/course.controller");
const { authenticate, authorize } = require("../middlewares/role.middleware");
const { submitCoursePreSurvey } = require("../controllers/courseSurvey.controller");
const { submitCoursePostSurvey } = require("../controllers/courseSurvey.controller");
const { completeCourse } = require("../controllers/course.controller");
const { getMyCourses } = require("../controllers/course.controller");

/**
 * @swagger
 * /api/courses/my:
 *   get:
 *     summary: Lấy danh sách khóa học đã đăng ký của tôi
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách khóa học đã đăng ký
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   course:
 *                     $ref: '#/components/schemas/Course'
 *                   completed:
 *                     type: boolean
 *                   preSurveyDone:
 *                     type: boolean
 *                   preSurveyAt:
 *                     type: string
 *                     format: date-time
 *                   preRiskLevel:
 *                     type: string
 *                   postSurveyDone:
 *                     type: boolean
 *                   postSurveyAt:
 *                     type: string
 *                     format: date-time
 *                   registeredAt:
 *                     type: string
 *                     format: date-time
 */

router.get(
  "/my",
  authenticate,
  authorize(["Member", "Staff", "Consultant", "Manager", "Admin"]),
  getMyCourses
);
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
 *               - surveyType
 *               - price                # ← price cũng là bắt buộc
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               ageGroup: { type: string, enum: [học sinh, sinh viên, phụ huynh, giáo viên] }
 *               content: { type: string }
 *               category: { type: string }
 *               surveyType: { type: string, enum: [ASSIST, CRAFFT] }
 *               price:                 # ← thêm mô tả price
 *                 type: number
 *                 minimum: 0
 *                 description: Giá khóa học (VND)
 *     responses:
 *       201: { description: Tạo thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       403: { description: Forbidden }
 */
router.post(
  "/",
  authenticate,
  authorize(["Staff","Manager","Admin"]),
  createCourse
);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Lấy danh sách tất cả khóa học
 *     tags: [Course]
 *     responses:
 *       200: { description: Danh sách khóa học }
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
 *         schema: { type: string }
 *         required: true
 *         description: Course ID
 *     responses:
 *       200: { description: Thông tin khóa học }
 *       404: { description: Không tìm thấy khóa học }
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
 *         schema: { type: string }
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
 *               price:                 # ← thêm price cho PATCH
 *                 type: number
 *                 minimum: 0
 *                 description: Giá khóa học (VND)
 *     responses:
 *       200: { description: Cập nhật thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Không tìm thấy khóa học }
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
 *         schema: { type: string }
 *         required: true
 *         description: Course ID
 *     responses:
 *       200: { description: Đã xóa khóa học }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Không tìm thấy khóa học }
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
 *         schema: { type: string }
 *         required: true
 *         description: Course ID
 *     responses:
 *       200: { description: Đăng ký thành công }
 *       400: { description: Đã đăng ký hoặc dữ liệu không hợp lệ }
 *       401: { description: Unauthorized }
 *       404: { description: Không tìm thấy khóa học }
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
 *         schema: { type: string }
 *         required: true
 *         description: Course ID
 *     responses:
 *       200: { description: Mảng đăng ký }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Không tìm thấy khóa học }
 */
router.get(
  "/:id/registrations",
  authenticate,
  authorize(["Staff","Manager","Admin"]),
  getCourseRegistrations
);
/**
 * @swagger
 * /api/courses/{id}/survey/pre:
 *   post:
 *     summary: Nộp kết quả Pre-Survey cho khóa học
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       201:
 *         description: Pre-Survey đã lưu
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy khóa học
 */
router.post(
  "/:id/survey/pre",
  authenticate,
  authorize(["Member","Staff","Consultant","Manager","Admin"]),
  submitCoursePreSurvey
);
/**
 * @swagger
 * /api/courses/{id}/survey/post:
 *   post:
 *     summary: Nộp kết quả Post-Survey cho khóa học
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 type: array
 *                 items: { type: number }
 *     responses:
 *       201: { description: Post-Survey đã lưu }
 *       400: { description: Dữ liệu không hợp lệ }
 *       403: { description: Chưa đăng ký khóa }
 *       404: { description: Không tìm thấy khóa }
 */
router.post(
  "/:id/survey/post",
  authenticate,
  authorize(["Member","Staff","Consultant","Manager","Admin"]),
  submitCoursePostSurvey
);

module.exports = router;
/**
 * @swagger
 * /api/courses/{id}/complete:
 *   post:
 *     summary: Đánh dấu hoàn thành khóa học
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Course ID
 *     responses:
 *       200: { description: Đã đánh dấu hoàn thành }
 *       400: { description: Đã hoàn thành trước đó hoặc lỗi khác }
 *       403: { description: Bạn chưa đăng ký khóa này }
 *       404: { description: Không tìm thấy khóa học }
 */
router.post(
  "/:id/complete",
  authenticate,
  authorize(["Member","Staff","Consultant","Manager","Admin"]),
  completeCourse
);
