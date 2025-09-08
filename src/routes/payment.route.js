const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authenticate = require("../middlewares/auth.middleware");

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
 *     security:
 *       - bearerAuth: []
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
router.post(
  "/create-session",
  authenticate,
  paymentController.createCheckoutSession
);

/**
 * @swagger
 * /api/payment/webhook/stripe:
 *   post:
 *     summary: Stripe webhook endpoint để xác nhận thanh toán thành công
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Đã nhận webhook thành công
 *       400:
 *         description: Lỗi xác thực signature
 */
router.post(
  "/webhook/stripe",
  express.raw({ type: 'application/json' }), // Stripe yêu cầu raw body
  paymentController.stripeWebhook
);

/**
 * @swagger
 * /api/payment/session-info:
 *   get:
 *     summary: Lấy lại thông tin courseId từ session_id Stripe (dành cho FE sau khi redirect)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe checkout session_id (từ URL payment-success)
 *     responses:
 *       200:
 *         description: Trả về courseId liên quan tới session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courseId:
 *                   type: string
 *                   description: ID của khóa học đã thanh toán
 *       400:
 *         description: Thiếu hoặc không hợp lệ session_id
 *       403:
 *         description: Không đúng user
 *       500:
 *         description: Lỗi server
 */
router.get(
  "/session-info",
  authenticate,
  paymentController.getSessionInfo
);

module.exports = router;
