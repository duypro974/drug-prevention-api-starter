const mongoose = require("mongoose"); // <--- THÊM DÒNG NÀY
const Survey = require("../models/survey.model");
const Program = require("../models/program.model");
const User = require("../models/user.model");
const { evaluate } = require("./survey.controller");
const { sendRiskLevelEmail } = require("../utils/email.utils");

/**
 * Nộp pre- hoặc post-survey cho một Program
 */
exports.submitProgramSurvey = async (req, res) => {
  try {
    const { id: programId, phase } = req.params;
    const { type, answers } = req.body;

    // 1. Kiểm tra program
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: "Chương trình không tồn tại" });
    }

    // 2. Kiểm tra user đã đăng ký
    const isParticipant = program.participants.some(
      (p) =>
        (p.user && p.user.toString() === req.user.id) ||
        (typeof p.user === "string" && p.user === req.user.id)
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Bạn chưa đăng ký chương trình này" });
    }

    // 3. Validate phase và type
    if (!["pre", "post"].includes(phase)) {
      return res.status(400).json({ message: "Phase phải là 'pre' hoặc 'post'" });
    }
    if (!["ASSIST", "CRAFFT"].includes(type)) {
      return res.status(400).json({ message: "Type không hợp lệ" });
    }

    // 4. Tính score/risk
    const { score, riskLevel } = evaluate(type, answers);

    // 5. Lưu survey
    const survey = await Survey.create({
      user: req.user.id,
      program: programId,
      phase,
      type,
      answers,
      score,
      riskLevel,
    });

    // 6. Gợi ý recommendation và nextAction
    let recommendation;
    const nextActions = [
      { label: "Xem chương trình khác", link: "/programs" },
    ];

    if (riskLevel === "high") {
      recommendation = "Bạn đang ở mức rủi ro cao — hãy đặt lịch tư vấn ngay.";
      nextActions.push({ label: "Đặt lịch tư vấn", link: "/appointments" });
    } else if (riskLevel === "moderate") {
      recommendation = "Bạn có mức rủi ro trung bình — cân nhắc trò chuyện với chuyên viên.";
      nextActions.push({ label: "Tìm hiểu thêm", link: "/resources" });
    } else {
      recommendation = "Bạn đang ở mức an toàn — hãy tiếp tục duy trì lối sống tích cực.";
    }

    // 7. Gửi email nếu có
    const user = await User.findById(req.user.id).select("email");
    if (user?.email) {
      await sendRiskLevelEmail(user.email, {
        courseTitle: `Khảo sát ${type} - Chương trình ${program.title}`,
        riskLevel,
        recommendation,
        link: "/programs",
      });
    }

    // 8. Trả về kết quả
    res.status(201).json({
      message: "Khảo sát đã lưu",
      survey,
      recommendation,
      nextActions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Lấy tất cả kết quả pre/post survey của một program
 */
exports.getProgramSurveys = async (req, res) => {
  try {
    const { id: programId } = req.params;

    // Đảm bảo program tồn tại
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: "Chương trình không tồn tại" });
    }

    // Lấy survey phân theo phase
    const surveys = await Survey.find({ program: programId })
      .populate("user", "username fullName")
      .sort("phase createdAt");

    // Gom nhóm theo phase
    const result = {
      pre: surveys.filter((s) => s.phase === "pre"),
      post: surveys.filter((s) => s.phase === "post"),
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Tính hiệu quả chương trình: so sánh score pre vs post trung bình
 */
exports.getProgramSurveyStats = async (req, res) => {
  try {
    const { id: programId } = req.params;

    // Tính trung bình
    const agg = await Survey.aggregate([
      { $match: { program: mongoose.Types.ObjectId(programId) } },
      {
        $group: {
          _id: "$phase",
          avgScore: { $avg: "$score" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Đưa về dạng { pre: {...}, post: {...} }
    const stats = agg.reduce(
      (acc, cur) => {
        acc[cur._id] = { avgScore: cur.avgScore, count: cur.count };
        return acc;
      },
      { pre: { avgScore: 0, count: 0 }, post: { avgScore: 0, count: 0 } }
    );

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// GET /api/programs/:id/survey
exports.getProgramSurveys = async (req, res) => {
  try {
    const { id: programId } = req.params;
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: "Chương trình không tồn tại" });
    }

    // Lấy tất cả survey theo program, phân theo phase (pre/post)
    const surveys = await Survey.find({ program: programId })
      .populate("user", "username fullName email") // lấy info người nộp survey
      .sort("phase createdAt");

    const result = {
      pre: surveys.filter(s => s.phase === "pre"),
      post: surveys.filter(s => s.phase === "post")
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

