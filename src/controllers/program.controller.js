const Program = require("../models/program.model");

// Danh sách khảo sát hợp lệ
const allowedSurveyTypes = [null, "ASSIST", "CRAFFT"];

/** Tạo chương trình mới (Admin/Manager) */
exports.createProgram = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      preSurvey,
      postSurvey
    } = req.body;

    // Validate loại khảo sát
    if (!allowedSurveyTypes.includes(preSurvey) || !allowedSurveyTypes.includes(postSurvey)) {
      return res.status(400).json({ message: "preSurvey hoặc postSurvey không hợp lệ" });
    }

    const program = await Program.create({
      title,
      description,
      startDate,
      endDate,
      location,
      preSurvey,
      postSurvey,
      createdBy: req.user.id
    });

    res.status(201).json(program);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/** Lấy danh sách tất cả chương trình (public) */
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find()
      .populate("createdBy", "username fullName")
       .populate("participants.user", "_id username fullName") // <-- thêm dòng này!
      .sort("-startDate");
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/** Lấy chi tiết 1 chương trình theo ID */
exports.getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate("createdBy", "username fullName")
      .populate("participants.user", "username fullName");
    if (!program) return res.status(404).json({ message: "Không tìm thấy chương trình" });
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/** Cập nhật chương trình (Admin/Manager) */
exports.updateProgram = async (req, res) => {
  try {
    const updates = req.body;

    // Nếu cập nhật khảo sát thì kiểm tra hợp lệ
    if (updates.preSurvey && !allowedSurveyTypes.includes(updates.preSurvey)) {
      return res.status(400).json({ message: "preSurvey không hợp lệ" });
    }
    if (updates.postSurvey && !allowedSurveyTypes.includes(updates.postSurvey)) {
      return res.status(400).json({ message: "postSurvey không hợp lệ" });
    }

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!program) return res.status(404).json({ message: "Không tìm thấy chương trình" });
    res.json(program);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/** Xóa chương trình (Admin/Manager) */
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ message: "Không tìm thấy chương trình" });
    res.json({ message: "Đã xóa chương trình" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/** Đăng ký tham gia chương trình (Member trở lên) */
exports.registerProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Không tìm thấy chương trình" });

    const alreadyRegistered = program.participants.some(
      (p) => p.user.toString() === req.user.id
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: "Bạn đã đăng ký rồi" });
    }

    program.participants.push({ user: req.user.id });
    await program.save();
    res.json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Lấy danh sách người tham gia (Admin/Manager) */
exports.getParticipants = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate("participants.user", "username fullName email");
    if (!program) return res.status(404).json({ message: "Không tìm thấy chương trình" });
    res.json(program.participants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
