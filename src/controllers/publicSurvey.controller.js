const validator = require("validator");
const Survey = require("../models/survey.model");
const { sendRiskLevelEmail } = require("../utils/email.utils");

/**
 * Public API: Làm khảo sát ASSIST hoặc CRAFFT mà không cần đăng ký khóa học
 */
exports.submitPublicSurvey = async (req, res) => {
  const { type, answers, email } = req.body;

  // 1. Kiểm tra type
  if (!["ASSIST", "CRAFFT"].includes(type)) {
    return res.status(400).json({ message: "Loại khảo sát không hợp lệ. Chỉ chấp nhận ASSIST hoặc CRAFFT" });
  }

  // 2. Kiểm tra độ dài và định dạng answers
  const requiredLength = type === "ASSIST" ? 10 : 6;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "`answers` phải là một mảng" });
  }
  if (answers.length !== requiredLength) {
    return res.status(400).json({ message: `Bạn phải trả lời đủ ${requiredLength} câu hỏi` });
  }
  if (answers.some(v => typeof v !== "number")) {
    return res.status(400).json({ message: "Tất cả các câu trả lời phải là số" });
  }

  // 3. Nếu có email thì validate định dạng
  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }

  // 4. Tính điểm và phân loại mức rủi ro
  const score = answers.reduce((sum, v) => sum + v, 0);
  let riskLevel;
  if (type === "ASSIST") {
    riskLevel = score <= 10 ? "low" : score <= 26 ? "moderate" : "high";
  } else {
    riskLevel = score === 0 ? "low" : score <= 2 ? "moderate" : "high";
  }

  // 5. Lưu khảo sát
  const survey = await Survey.create({
    type,
    phase: "public",
    answers,
    score,
    riskLevel,
    email: email || null,
  });

  // 6. Gửi mail nếu có
  let recommendation;
  if (riskLevel === "high") {
    recommendation = "Bạn có nguy cơ cao — hãy đặt lịch tư vấn ngay.";
  } else if (riskLevel === "moderate") {
    recommendation = "Bạn có nguy cơ trung bình — nên tham khảo thêm hoặc trò chuyện với chuyên viên.";
  } else {
    recommendation = "Bạn đang ở mức an toàn — tiếp tục duy trì lối sống tích cực.";
  }

  if (email) {
    await sendRiskLevelEmail(email, {
      courseTitle: `Khảo sát ${type}`,
      riskLevel,
      recommendation,
      link: "/courses",
    });
  }

  // 7. Trả về kết quả
  res.status(201).json({
    message: "Khảo sát đã lưu",
    survey,
    recommendation,
    nextActions: [
      { label: "Xem khóa học", link: "/courses" },
      { label: "Đặt lịch tư vấn", link: "/appointments" },
    ],
  });
};
