require('dotenv').config();   
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,               // smtp.gmail.com
  port: Number(process.env.SMTP_PORT),       // 465
  secure: process.env.SMTP_SECURE === 'true',// true
  auth: {
    user: process.env.SMTP_USER,             // your Gmail address
    pass: process.env.SMTP_PASS              // your 16-char App Password
  }
});

async function sendVerificationEmail(to, token, type = "verifyEmail") {
  const isResetPassword = type === "resetPassword";
  const subject = isResetPassword ? 'Đặt lại mật khẩu' : 'Xác thực email đăng ký';
  const url = isResetPassword 
    ? `${process.env.BACKEND_URL}/api/auth/reset-password?token=${token}`
    : `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`;
  const actionText = isResetPassword ? 'đặt lại mật khẩu' : 'xác thực email';

  await transporter.sendMail({
    from: process.env.SMTP_FROM,             // e.g. "Drug Prevention <youremail@gmail.com>"
    to,
    subject,
    html: `
      <p>Chào bạn,</p>
      <p>Vui lòng click vào link bên dưới để ${actionText}:</p>
      <p><a href="${url}">${actionText.charAt(0).toUpperCase() + actionText.slice(1)}</a></p>
      <p>Nếu bạn không yêu cầu, bỏ qua email này.</p>
    `
  });
}

module.exports = { sendVerificationEmail };