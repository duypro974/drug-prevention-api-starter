// src/controllers/courseSurvey.controller.js

const Course = require("../models/course.model");
const CourseRegistration = require("../models/courseRegistration.model");
const Survey = require("../models/survey.model");
const User = require("../models/user.model");
const { sendRiskLevelEmail } = require("../utils/email.utils");

/**
 * Submit Pre-Survey cho khóa học
 */

exports.submitCoursePreSurvey = async (req, res) => {
  const { id: courseId } = req.params;
  const { answers } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học" });

    const reg = await CourseRegistration.findOne({
      user: req.user.id,
      course: courseId,
    });
    if (!reg) {
      return res.status(403).json({ message: "Bạn chưa đăng ký khóa này" });
    }

    if (!Array.isArray(answers) || answers.some((v) => typeof v !== "number")) {
      return res.status(400).json({ message: "answers phải là mảng số" });
    }

    const type = course.surveyType;
    const total = answers.reduce((sum, v) => sum + v, 0);
    // 🔒 BỔ SUNG KIỂM TRA SỐ LƯỢNG CÂU TRẢ LỜI
    const requiredLength = type === "ASSIST" ? 10 : 6;
    if (
      !Array.isArray(answers) ||
      answers.some((v) => typeof v !== "number") ||
      answers.length !== requiredLength
    ) {
      return res.status(400).json({
        message: `Bạn phải trả lời đầy đủ ${requiredLength} câu hỏi cho khảo sát ${type}`,
      });
    }

    let riskLevel;
    if (type === "ASSIST") {
      riskLevel = total <= 10 ? "low" : total <= 26 ? "moderate" : "high";
    } else {
      riskLevel = total === 0 ? "low" : total <= 2 ? "moderate" : "high";
    }

    const survey = await Survey.create({
      user: req.user.id,
      course: courseId,
      type,
      phase: "pre",
      answers,
      score: total,
      riskLevel,
    });

    await CourseRegistration.findOneAndUpdate(
      { user: req.user.id, course: courseId },
      { preSurveyDone: true, preRiskLevel: riskLevel }
    );

    let recommendation, nextAction;
    if (riskLevel === "high") {
      recommendation =
        "Bạn đang ở mức rủi ro cao — hãy đặt lịch tư vấn ngay với chuyên viên.";
      nextAction = {
        action: "bookConsultation",
        link: `/api/appointments?course=${courseId}`,
      };
    } else if (riskLevel === "moderate") {
      recommendation =
        "Bạn ở mức rủi ro trung bình — cân nhắc tham gia buổi tư vấn.";
      nextAction = {
        action: "bookConsultation",
        link: `/api/appointments?course=${courseId}`,
      };
    } else {
      recommendation =
        "Bạn có mức rủi ro thấp — bạn có thể bắt đầu khóa học ngay bây giờ.";
      nextAction = {
        action: "startCourse",
        link: `/courses/${courseId}/content`,
      };
    }

    const user = await User.findById(req.user.id).select("email");
    await sendRiskLevelEmail(user.email, {
      courseTitle: course.title,
      riskLevel,
      recommendation,
      link: nextAction.link,
    });

    res.status(201).json({
      survey,
      recommendation,
      nextAction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Submit Post-Survey cho khóa học
 */
exports.submitCoursePostSurvey = async (req, res) => {
  const { id: courseId } = req.params;
  const { answers } = req.body;

  try {
    // 1. Khóa học tồn tại
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    // 2. Kiểm user đã đăng ký
    const reg = await CourseRegistration.findOne({
      user: req.user.id,
      course: courseId,
    });
    if (!reg) {
      return res.status(403).json({ message: "Bạn chưa đăng ký khóa học này" });
    }

    // 3. Validate answers
    if (!Array.isArray(answers) || answers.some((v) => typeof v !== "number")) {
      return res.status(400).json({ message: "answers phải là mảng số" });
    }

    // 4. Lấy surveyType và tính score & risk
    const type = course.surveyType;
    const total = answers.reduce((sum, v) => sum + v, 0);
    // 🔒 BỔ SUNG KIỂM TRA SỐ LƯỢNG CÂU TRẢ LỜI
    const requiredLength = type === "ASSIST" ? 10 : 6;
    if (
      !Array.isArray(answers) ||
      answers.some((v) => typeof v !== "number") ||
      answers.length !== requiredLength
    ) {
      return res.status(400).json({
        message: `Bạn phải trả lời đầy đủ ${requiredLength} câu hỏi cho khảo sát ${type}`,
      });
    }
    let riskLevel;
    if (type === "ASSIST") {
      riskLevel = total <= 10 ? "low" : total <= 26 ? "moderate" : "high";
    } else {
      riskLevel = total === 0 ? "low" : total <= 2 ? "moderate" : "high";
    }

    // 5. Tạo Post-Survey
    const survey = await Survey.create({
      user: req.user.id,
      course: courseId,
      type,
      phase: "post",
      answers,
      score: total,
      riskLevel,
    });

    // 6. Trả về
    res.status(201).json({
      message: "Post-Survey đã được lưu",
      survey,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
