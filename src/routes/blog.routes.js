const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const { authenticate, authorize } = require("../middlewares/role.middleware");

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Lấy danh sách tất cả các bài viết blog đã được công khai
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         required: false
 *         description: Lọc theo ID người viết (author)
 *     responses:
 *       200:
 *         description: Danh sách bài viết
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 */
router.get("/", blogController.getAllBlogs);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Lấy chi tiết một bài viết blog theo ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Chi tiết bài viết
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.get("/:id", blogController.getBlogById);

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Tạo bài viết blog mới (chỉ dành cho Admin hoặc Manager)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogInput'
 *     responses:
 *       201:
 *         description: Bài viết đã được tạo
 *       403:
 *         description: Không có quyền
 */
router.post(
  "/",
  authenticate,
  authorize(["Admin", "Manager"]),
  blogController.createBlog
);

/**
 * @swagger
 * /api/blogs/{id}:
 *   patch:
 *     summary: Cập nhật bài viết blog
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bài viết đã được cập nhật
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.patch(
  "/:id",
  authenticate,
  authorize(["Admin", "Manager"]),
  blogController.updateBlog
);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Xoá bài viết blog
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Đã xoá bài viết
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["Admin", "Manager"]),
  blogController.deleteBlog
);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         coverImage:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         author:
 *           type: string
 *         published:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     BlogInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         coverImage:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         published:
 *           type: boolean
 */
