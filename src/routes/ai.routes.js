
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/chat.model");
require("dotenv").config();
const authenticate = require("../middlewares/auth.middleware"); // thêm dòng này ở đầu file

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: Các chức năng AI hỗ trợ tư vấn phòng chống ma túy
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Gửi tin nhắn đến AI để nhận phản hồi và phân tích cảm xúc
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kết quả trả lời từ AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                 emotion:
 *                   type: string
 *                 recommendation:
 *                   type: string
 */
router.post("/chat", authenticate, async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({ history: [] });

    const result = await chat.sendMessage(message);
    const reply = result.response.text().trim();

    const emotionPrompt = `Phân tích cảm xúc đoạn sau (chỉ chọn một: vui, buồn, tức giận, lo lắng, bình thường):\n"${message}"`;
    const emotionResult = await model.generateContent(emotionPrompt);
    const emotion = emotionResult.response.text().trim().toLowerCase();

    const suggestPrompt = `Dựa vào nội dung sau, gợi ý hành động tiếp theo cho người dùng (ví dụ: đề xuất khóa học hoặc gặp chuyên viên tư vấn):\n"${message}"`;
    const suggestionResult = await model.generateContent(suggestPrompt);
    const recommendation = suggestionResult.response.text().trim();

    await Chat.create({
      userId: req.user?._id,
      sessionId,
      message,
      reply,
      emotion,
      recommendation,
    });

    res.json({ reply, emotion, recommendation });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({ error: "Gemini API error" });
  }
});

/**
 * @swagger
 * /api/ai/analyze:
 *   post:
 *     summary: Gửi prompt bất kỳ cho Gemini AI để phân tích hoặc sinh nội dung
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả lời từ Gemini AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 */
router.post("/analyze", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ reply: text });
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({ error: "Gemini API error" });
  }
});

module.exports = router;
/**
 * @swagger
 * components:
 *   schemas:
 *     AIChatRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *         sessionId:
 *           type: string

 *     AIChatResponse:
 *       type: object
 *       properties:
 *         reply:
 *           type: string
 *         emotion:
 *           type: string
 *         recommendation:
 *           type: string

 *     AIAnalyzeRequest:
 *       type: object
 *       required:
 *         - prompt
 *       properties:
 *         prompt:
 *           type: string

 *     AIAnalyzeResponse:
 *       type: object
 *       properties:
 *         reply:
 *           type: string
 */


