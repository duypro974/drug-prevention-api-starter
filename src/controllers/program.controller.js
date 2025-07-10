const Program = require("../models/program.model");

/** Tạo chương trình mới (Admin/Manager) */
exports.createProgram = async (req, res) => {
  try {
    const { title, description, startDate, endDate, location } = req.body;
    const program = await Program.create({
      title,
      description,
      startDate,
      endDate,
      location,
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

    // Kiểm xem đã đăng ký chưa
    if (program.participants.some(p => p.user.toString() === req.user.id)) {
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
