const express = require("express");
const router = express.Router();
const pagesController = require("../controllers/pages.controller");

/**
 * @swagger
 * /api/pages/about:
 *   get:
 *     summary: Lấy thông tin giới thiệu tổ chức
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: Thông tin giới thiệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 */
router.get("/about", pagesController.getAbout);

module.exports = router;
