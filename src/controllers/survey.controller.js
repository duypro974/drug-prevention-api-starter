const Survey = require("../models/survey.model");
const assistQuestions = require("../data/assistQuestions");
const crafftQuestions = require("../data/crafftQuestions");
const { Parser } = require("json2csv");

/**
 * Tính score và riskLevel cho ASSIST/CRAFFT
 */
function evaluate(type, answers) {
  const total = answers.reduce((sum, v) => sum + v, 0);
  let level;
  if (type === "ASSIST") {
    level = total <= 10 ? "low" : total <= 26 ? "moderate" : "high";
  } else {
    level = total === 0 ? "low" : total <= 2 ? "moderate" : "high";
  }
  return { score: total, riskLevel: level };
}

/**
 * Lấy bộ câu hỏi ASSIST/CRAFFT
 */
exports.getQuestions = (req, res) => {
  const { type } = req.query;
  if (type === "ASSIST") return res.json(assistQuestions);
  if (type === "CRAFFT") return res.json(crafftQuestions);
  return res.status(400).json({ message: "Type phải là ASSIST hoặc CRAFFT" });
};

/**
 * Submit một survey mới
 */
exports.submitSurvey = async (req, res) => {
  try {
    const { type, answers } = req.body;
    // Validate type và answers
    const questionList =
      type === "ASSIST"
        ? assistQuestions
        : type === "CRAFFT"
        ? crafftQuestions
        : null;
    if (!questionList) {
      return res.status(400).json({ message: "Type không hợp lệ" });
    }
    if (!Array.isArray(answers) || answers.length !== questionList.length) {
      return res.status(400).json({ message: `Phải có ${questionList.length} câu trả lời` });
    }
    // Validate giá trị trả lời
    for (let i = 0; i < answers.length; i++) {
      const validValues = questionList[i].options.map(o => o.value);
      if (!validValues.includes(answers[i])) {
        return res.status(400).json({ message: `Câu ${i + 1} giá trị không hợp lệ` });
      }
    }

    // Evaluate score
    const { score, riskLevel } = evaluate(type, answers);

    // Lưu survey
    const survey = await Survey.create({
      user: req.user.id,
      type,
      answers,
      score,
      riskLevel
    });

    // Recommendation
    let recommendation;
    if (riskLevel === "high") recommendation = "Bạn nên gặp chuyên viên tư vấn ngay.";
    else if (riskLevel === "moderate") recommendation = "Tham gia khóa kỹ năng từ chối.";
    else recommendation = "Bạn có thể tự theo dõi hoặc tham gia khóa nhận thức.";

    res.status(201).json({ survey, recommendation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Lấy lịch sử survey của chính user
 */
exports.getMySurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ user: req.user.id }).sort("-createdAt");
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Cho Admin/Manager xem tất cả survey
 */
exports.getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().populate("user", "username fullName").sort("-createdAt");
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Lấy chi tiết survey theo ID
 */
exports.getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).populate("user", "username fullName");
    if (!survey) return res.status(404).json({ message: "Không tìm thấy survey" });
    // Kiểm quyền: chỉ owner hoặc Admin/Manager
    if (!["Admin", "Manager"].includes(req.user.role) && survey.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xem survey này" });
    }
    res.json(survey);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Cập nhật survey (Admin/Manager)
 */
exports.updateSurvey = async (req, res) => {
  try {
    const updates = req.body;
    const forbidden = ["user", "score", "riskLevel", "type"];
    if (Object.keys(updates).some(f => forbidden.includes(f))) {
      return res.status(400).json({ message: "Không thể cập nhật trường này" });
    }
    const survey = await Survey.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!survey) return res.status(404).json({ message: "Không tìm thấy survey" });
    res.json(survey);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Xóa survey (Admin/Manager)
 */
exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);
    if (!survey) return res.status(404).json({ message: "Không tìm thấy survey" });
    res.json({ message: "Đã xóa survey" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Lọc & phân trang
 */
exports.filterSurveys = async (req, res) => {
  try {
    const { type, riskLevel, page = 1, limit = 10 } = req.query;
    const q = {};
    if (type) q.type = type;
    if (riskLevel) q.riskLevel = riskLevel;
    const total = await Survey.countDocuments(q);
    const surveys = await Survey.find(q)
      .populate("user", "username fullName")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ total, page: parseInt(page), limit: parseInt(limit), surveys });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Thống kê theo riskLevel
 */
exports.statsByRisk = async (req, res) => {
  try {
    const stats = await Survey.aggregate([
      { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Export CSV
 */
exports.exportCsv = async (req, res) => {
  try {
    const surveys = await Survey.find().populate("user", "username fullName");
    const fields = ["_id", "user.username", "user.fullName", "type", "score", "riskLevel", "createdAt"];
    const parser = new Parser({ fields });
    const data = surveys.map(s => ({
      _id: s._id,
      "user.username": s.user.username,
      "user.fullName": s.user.fullName,
      type: s.type,
      score: s.score,
      riskLevel: s.riskLevel,
      createdAt: s.createdAt
    }));
    const csv = parser.parse(data);
    res.header("Content-Type", "text/csv");
    res.attachment("survey-report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
