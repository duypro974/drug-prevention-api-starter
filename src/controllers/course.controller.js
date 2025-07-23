// src/controllers/course.controller.js

const Course               = require("../models/course.model");
const CourseRegistration   = require("../models/courseRegistration.model");
const { sendPreSurveyEmail } = require("../utils/email.utils");
const User = require("../models/user.model");
const { sendPostSurveyEmail } = require("../utils/email.utils");

/**Xem danh sách khóa học của tôi */
exports.getMyCourses = async (req, res) => {
  try {
    const regs = await CourseRegistration.find({ user: req.user.id })
      .populate({
        path: "course",
        select: "title description ageGroup surveyType category price createdAt"
      })
      .sort("-registeredAt");

    const result = regs.map(reg => ({
      course: reg.course,
      completed: reg.completed,
      registeredAt: reg.registeredAt,
      preSurveyDone: reg.preSurveyDone,
      preSurveyAt: reg.preSurveyAt,
      preRiskLevel: reg.preRiskLevel,
      postSurveyDone: reg.postSurveyDone,
      postSurveyAt: reg.postSurveyAt,
      // nếu cần có thêm trường khác, thêm tại đây
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


/**
 * Tạo khóa học mới
 */
exports.createCourse = async (req, res) => {
  try {
    const { title, description, ageGroup, content, category, surveyType, price } = req.body;

    // surveyType bắt buộc
    if (!["ASSIST","CRAFFT"].includes(surveyType)) {
      return res.status(400).json({ message: "surveyType phải là ASSIST hoặc CRAFFT" });
    }

    const course = await Course.create({
      title, description, ageGroup, content, category,
      surveyType,
        price, // Thêm trường price vào đây
      createdBy: req.user.id
    });
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
    const courses = await Course.find()
      .populate("createdBy", "username fullName")
      .sort("-createdAt");
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
 * Cập nhật khóa học (chỉ các trường cho phép)
 */
exports.updateCourse = async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = ["title","description","ageGroup","content","category","price","surveyType"];
    const invalid = Object.keys(updates).filter(f => !allowedFields.includes(f));
    if (invalid.length) {
      return res.status(400)
        .json({ message: `Không thể cập nhật các trường: ${invalid.join(", ")}` });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });

    Object.keys(updates).forEach(f => course[f] = updates[f]);
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
 * User đăng ký khóa học (Member trở lên) và gửi link Pre-Survey qua email
 */
exports.registerCourse = async (req, res) => {
  const { id: courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });

    // Kiểm đăng ký trùng
    if (await CourseRegistration.findOne({ user: req.user.id, course: courseId })) {
      return res.status(400).json({ message: "Bạn đã đăng ký khóa này rồi" });
    }

    // Lưu đăng ký
    await CourseRegistration.create({ user: req.user.id, course: courseId });

    // Lấy email user
    const user = await User.findById(req.user.id).select("email");
    if (!user) throw new Error("Không lấy được thông tin người dùng");

    // Tạo link Pre-Survey dựa vào surveyType
    const linkPath = `/api/courses/${courseId}/survey/pre?type=${course.surveyType}`;
    await sendPreSurveyEmail(user.email, course.title, linkPath);

    res.json({
      message: "Đăng ký thành công. Vui lòng kiểm tra email để làm Pre-Survey.",
      preSurveyLink: `${process.env.BACKEND_URL}${linkPath}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
/**
 * Đánh dấu user đã hoàn thành khóa học
 */
exports.completeCourse = async (req, res) => {
  const { id: courseId } = req.params;
  const userId = req.user.id;

  try {
    const reg = await CourseRegistration.findOne({ user: userId, course: courseId });
    if (!reg) return res.status(403).json({ message: "Bạn chưa đăng ký khóa học này" });

    if (reg.completed) {
      return res.status(400).json({ message: "Bạn đã hoàn thành khóa học này rồi" });
    }

    reg.completed = true;
    await reg.save();

    // Lấy thông tin user + course
    const user = await User.findById(userId).select("email fullName");
    const course = await Course.findById(courseId).select("title surveyType");
    if (!user || !course) {
      return res.status(404).json({ message: "Không tìm thấy user hoặc course" });
    }

    // Gửi email mời làm Post-Survey
    const linkPath = `/api/courses/${courseId}/survey/post?type=${course.surveyType}`;
    await sendPostSurveyEmail(user.email, course.title, linkPath);

    res.json({ message: "Đã đánh dấu hoàn thành khóa học và gửi mail làm Post-Survey" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
/**
 * Lấy danh sách user đã đăng ký khóa (Admin/Staff)
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
