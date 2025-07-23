const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: APIs for handling Stripe payment sessions
 */

/**
 * @swagger
 * /api/payment/create-session:
 *   post:
 *     summary: Create a Stripe checkout session for course payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - courseTitle
 *               - amount
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID của khóa học
 *               courseTitle:
 *                 type: string
 *                 description: Tên khóa học
 *               amount:
 *                 type: number
 *                 description: Số tiền cần thanh toán (đơn vị USD)
 *     responses:
 *       200:
 *         description: Trả về URL thanh toán Stripe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL checkout session Stripe để redirect user
 *       500:
 *         description: Lỗi server khi tạo session
 */
router.post("/create-session", paymentController.createCheckoutSession);

module.exports = router;
