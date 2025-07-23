// src/controllers/courseSurvey.controller.js

const Course = require("../models/course.model");
const CourseRegistration = require("../models/courseRegistration.model");
const Survey = require("../models/survey.model");
const User = require("../models/user.model");
const { sendRiskLevelEmail } = require("../utils/email.utils");

// 👉 Hàm tính risk level và validate theo loại survey
const evaluateSurvey = (type, answers) => {
  const requiredLength = type === "ASSIST" ? 10 : 6;

  if (
    !Array.isArray(answers) ||
    answers.length !== requiredLength ||
    answers.some((v) => typeof v !== "number")
  ) {
    throw new Error(`Bạn phải trả lời đầy đủ ${requiredLength} câu hỏi cho khảo sát ${type}`);
  }

  const total = answers.reduce((sum, v) => sum + v, 0);
  let riskLevel;

  if (type === "ASSIST") {
    riskLevel = total <= 10 ? "low" : total <= 26 ? "moderate" : "high";
  } else {
    riskLevel = total === 0 ? "low" : total <= 2 ? "moderate" : "high";
  }

  return { total, riskLevel };
};

/**
 * Submit Pre-Survey cho khóa học
 */
exports.submitCoursePreSurvey = async (req, res) => {
  const { id: courseId } = req.params;
  const { answers } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });

    const reg = await CourseRegistration.findOne({ user: req.user.id, course: courseId });
    if (!reg) return res.status(403).json({ message: "Bạn chưa đăng ký khóa này" });
    if (reg.preSurveyDone) return res.status(400).json({ message: "Bạn đã làm Pre-Survey rồi" });

    // Check trùng khảo sát (nếu cần)
    const existed = await Survey.findOne({ user: req.user.id, course: courseId, phase: "pre" });
    if (existed) return res.status(409).json({ message: "Bạn đã nộp Pre-Survey rồi" });

    const { total, riskLevel } = evaluateSurvey(course.surveyType, answers);

    const survey = await Survey.create({
      user: req.user.id,
      course: courseId,
      type: course.surveyType,
      phase: "pre",
      answers,
      score: total,
      riskLevel,
    });

    await CourseRegistration.findByIdAndUpdate(reg._id, {
      preSurveyDone: true,
      preSurveyAt: new Date(), // <--- thêm dòng này!
      preRiskLevel: riskLevel,
    });

    // Gợi ý tiếp theo
    let recommendation;
    const nextActions = [
      { label: "Xem khóa học", link: "/courses" },
      { label: "Xem chương trình", link: "/programs" },
    ];

    if (riskLevel === "high" || riskLevel === "moderate") {
      recommendation = riskLevel === "high"
        ? "Bạn đang ở mức rủi ro cao — hãy đặt lịch tư vấn ngay với chuyên viên."
        : "Bạn ở mức rủi ro trung bình — cân nhắc tham gia buổi tư vấn.";
      nextActions.push({
        label: "Đặt lịch tư vấn",
        link: `/appointments?course=${courseId}`,
      });
    } else {
      recommendation = "Bạn có mức rủi ro thấp — bạn có thể bắt đầu khóa học ngay bây giờ.";
      nextActions.push({
        label: "Bắt đầu học",
        link: `/courses/${courseId}/content`,
      });
    }

    const user = await User.findById(req.user.id).select("email");
    if (user?.email) {
      await sendRiskLevelEmail(user.email, {
        courseTitle: course.title,
        riskLevel,
        recommendation,
        link: nextActions.at(-1).link,
      });
    }

    res.status(201).json({
      survey,
      recommendation,
      nextActions,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Lỗi xử lý khảo sát" });
  }
};

/**
 * Submit Post-Survey cho khóa học
 */
exports.submitCoursePostSurvey = async (req, res) => {
  const { id: courseId } = req.params;
  const { answers } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });

    const reg = await CourseRegistration.findOne({ user: req.user.id, course: courseId });
    if (!reg) return res.status(403).json({ message: "Bạn chưa đăng ký khóa học này" });
    if (reg.postSurveyDone) return res.status(400).json({ message: "Bạn đã làm Post-Survey rồi" });

    const { total, riskLevel } = evaluateSurvey(course.surveyType, answers);

    const survey = await Survey.create({
      user: req.user.id,
      course: courseId,
      type: course.surveyType,
      phase: "post",
      answers,
      score: total,
      riskLevel,
    });

    await CourseRegistration.findByIdAndUpdate(reg._id, {
      postSurveyDone: true,
      postSurveyAt: new Date(), // <--- thêm dòng này!
    });

    res.status(201).json({
      message: "Post-Survey đã được lưu",
      survey,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Lỗi xử lý khảo sát" });
  }
};
