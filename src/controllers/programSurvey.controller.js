const Survey  = require("../models/survey.model");
const Program = require("../models/program.model");
const { evaluate } = require("./survey.controller");  // tái sử dụng hàm evaluate

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
      p => p.user.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Bạn chưa đăng ký chương trình này" });
    }
    // 3. Tính score/risk
    const { score, riskLevel } = evaluate(type, answers);

    // 4. Lưu survey
    const survey = await Survey.create({
      user: req.user.id,
      program: programId,
      phase,      // "pre" hoặc "post"
      type,
      answers,
      score,
      riskLevel
    });

    res.status(201).json({ survey });
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
      .populate("user","username fullName")
      .sort("phase createdAt");

    // Gom nhóm theo phase
    const result = {
      pre: surveys.filter(s => s.phase === "pre"),
      post: surveys.filter(s => s.phase === "post")
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
          count:    { $sum: 1 }
        }
      }
    ]);

    // Đưa về dạng { pre: {...}, post: {...} }
    const stats = agg.reduce((acc, cur) => {
      acc[cur._id] = { avgScore: cur.avgScore, count: cur.count };
      return acc;
    }, { pre: { avgScore:0,count:0 }, post:{avgScore:0,count:0} });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
