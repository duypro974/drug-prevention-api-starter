
const express = require('express');
const router = express.Router();
const Chat = require('../models/chat.model');
const authenticate = require('../middlewares/auth.middleware'); // ✅ đúng


/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Lịch sử hội thoại giữa người dùng và AI
 */

/**
 * @swagger
 * /api/chat/history:
 *   get:
 *     summary: Lấy lịch sử chat của người dùng hoặc guest
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: false
 *         description: sessionId của người dùng guest
 *     responses:
 *       200:
 *         description: Danh sách lịch sử chat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       reply:
 *                         type: string
 *                       emotion:
 *                         type: string
 *                       recommendation:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Thiếu sessionId hoặc userId
 *       500:
 *         description: Lỗi server
 */

// GET /api/chat/history?sessionId=abc123
// hoặc nếu có user đăng nhập thì dùng req.user._id
// GET /api/chat/history?sessionId=abc123
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await Chat.find({ userId }).sort({ createdAt: 1 });
    res.json({ history });
  } catch (err) {
    console.error('Lỗi khi lấy lịch sử chat:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           nullable: true
 *         sessionId:
 *           type: string
 *           nullable: true
 *         message:
 *           type: string
 *         reply:
 *           type: string
 *         emotion:
 *           type: string
 *           description: "Cảm xúc phân tích (vui, buồn, lo lắng, tức giận, bình thường)"
 *         recommendation:
 *           type: string
 *           description: "Gợi ý hành động (ví dụ: gặp chuyên viên tư vấn)"
 *         createdAt:
 *           type: string
 *           format: date-time
 */

