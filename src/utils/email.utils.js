const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",  // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Gửi khảo sát trước khi học
 */
exports.sendPreSurveyEmail = async (to, courseTitle, linkPath) => {
  const link = `${process.env.BACKEND_URL}${linkPath}`;
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: `Khảo sát trước khi bắt đầu khóa: ${courseTitle}`,
    text: `
Chào bạn,

Cảm ơn bạn đã đăng ký khóa học “${courseTitle}”. Trước khi bắt đầu, hãy giúp chúng tôi bằng cách hoàn thành khảo sát ngắn dưới đây. Kết quả sẽ giúp chúng tôi điều chỉnh nội dung cho phù hợp với bạn.

👉 Vui lòng click vào link sau để làm khảo sát (Pre-Survey):
${link}

Nếu link không hoạt động, sao chép nguyên đường dẫn trên và dán vào trình duyệt của bạn.

Chúc bạn một buổi học hiệu quả!

—
Đội ngũ Drug Prevention
`
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Gửi khảo sát sau khi học
 */
exports.sendPostSurveyEmail = async (to, courseTitle, linkPath) => {
  const link = `${process.env.BACKEND_URL}${linkPath}`;
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: `Khảo sát sau khi hoàn thành khóa: ${courseTitle}`,
    text: `
Chào bạn,

Chúc mừng bạn đã hoàn thành khóa học “${courseTitle}”!
Để giúp chúng tôi cải thiện chất lượng, rất mong bạn dành 2-3 phút làm khảo sát sau khóa:

${link}

Cảm ơn đóng góp quý báu của bạn.

—
Đội ngũ Drug Prevention
`
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Gửi email phản hồi kết quả Pre-Survey theo mức độ rủi ro
 */
exports.sendRiskLevelEmail = async (to, { riskLevel, recommendation, courseTitle, link }) => {
  let subject = `Kết quả đánh giá Pre-Survey - ${courseTitle}`;
  let html;

  if (riskLevel === "low") {
    html = `
      <p>Chào bạn,</p>
      <p>Chúc mừng! Bạn đã hoàn thành Pre-Survey với mức độ rủi ro <strong>thấp</strong>.</p>
      <p><strong>${recommendation}</strong></p>
      <p>Bạn có thể bắt đầu khóa học tại đây: <a href="${link}">${link}</a></p>
      <br>
      <p>Chúc bạn học tập hiệu quả!</p>
      <p>— Đội ngũ Drug Prevention</p>
    `;
  } else {
    html = `
      <p>Chào bạn,</p>
      <p>Kết quả Pre-Survey của bạn cho thấy mức độ rủi ro là <strong>${riskLevel}</strong>.</p>
      <p><strong>${recommendation}</strong></p>
      <p>Vui lòng thực hiện bước tiếp theo tại đây: <a href="${link}">${link}</a></p>
      <br>
      <p>— Đội ngũ Drug Prevention</p>
    `;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html
  });
};
