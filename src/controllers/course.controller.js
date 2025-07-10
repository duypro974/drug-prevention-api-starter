const Course = require("../models/course.model");
const CourseRegistration = require("../models/courseRegistration.model");

/**
 * Tạo khóa học mới
 */
exports.createCourse = async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.user.id
    };
    const course = await Course.create(data);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Lấy danh sách tất cả khóa học
 */
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("createdBy", "username fullName");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Lấy chi tiết 1 khóa học theo ID
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("createdBy", "username fullName");
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Cập nhật khóa học
 */
exports.updateCourse = async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = ["title","description","ageGroup","content","category"];
    const invalidFields = Object.keys(updates)
      .filter(f => !allowedFields.includes(f));
    if (invalidFields.length) {
      return res
        .status(400)
        .json({ message: `Không thể cập nhật các trường: ${invalidFields.join(", ")}` });
    }

    // Tìm trước document
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    // Chỉ gán những field có trong body
    Object.keys(updates).forEach(field => {
      course[field] = updates[field];
    });

    // Chạy validator & save
    await course.save();

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

/**
 * Xóa khóa học
 */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json({ message: "Đã xóa khóa học" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * User đăng ký khóa học (Member trở lên)
 */
exports.registerCourse = async (req, res) => {
  const { id: courseId } = req.params;
  try {
    // 1. Kiểm xem course có tồn tại?
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    // 2. Kiểm xem user đã đăng ký chưa
    const exists = await CourseRegistration.findOne({
      user: req.user.id,
      course: courseId
    });
    if (exists) {
      return res.status(400).json({ message: "Bạn đã đăng ký khóa này rồi" });
    }
    // 3. Tạo đăng ký mới
    await CourseRegistration.create({
      user: req.user.id,
      course: courseId
    });
    res.json({ message: "Đăng ký khóa học thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
/* Lấy danh sách user đã đăng ký khóa (Admin/Staff)
 */
exports.getCourseRegistrations = async (req, res) => {
  const { id: courseId } = req.params;
  try {
    const regs = await CourseRegistration.find({ course: courseId })
      .populate("user", "username fullName email")
      .sort("-registeredAt");
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};