// src/app.js

require("dotenv").config();             // 1. Nạp .env ngay lập tức
const express               = require("express");
const cors                  = require("cors");
const connectDB             = require("./config/db");
const swaggerUi             = require("swagger-ui-express");
const swaggerSpec           = require("./docs/swagger");
const publicSurveyRoutes = require("./routes/publicSurvey.routes");

// --- Routes ---
const authRoutes            = require("./routes/auth.routes");
const userRoutes            = require("./routes/user.routes");
const courseRoutes          = require("./routes/course.routes");
const surveyRoutes          = require("./routes/survey.routes");
const programRoutes         = require("./routes/program.routes");
const programSurveyRoutes   = require("./routes/programSurvey.routes");
const appointmentRoutes     = require("./routes/appointment.routes");
const blogRoutes            = require("./routes/blog.routes");
const pagesRoutes           = require("./routes/pages.routes");
const consultantRoutes      = require("./routes/consultant.routes");
const aiRoutes              = require('./routes/ai.routes');
const chatHistoryRoutes     = require('./routes/chatHistory.routes');

// Thêm route thanh toán Stripe
const paymentRoutes         = require("./routes/payment.route");

const app = express();

// --- Connect to MongoDB ---
connectDB();

// --- Global middleware ---
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // nếu sau này dùng cookie hoặc auth header
}));

app.use(express.json());

// --- API routes ---
// Public survey routes
app.use("/api/surveys", publicSurveyRoutes);
// Auth & user
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// Consultant profile
app.use("/api/consultants", consultantRoutes);

// Courses & course-survey
app.use("/api/courses", courseRoutes);
// Nếu bạn có nested survey under courses:
// app.use("/api/courses/:id/survey", courseCourseSurveyRoutes);

// Surveys (general ASSIST/CRAFFT)
app.use("/api/surveys", surveyRoutes);

// Programs & program-survey
app.use("/api/programs", programRoutes);
app.use("/api/programs/:id/survey", programSurveyRoutes);

// Appointments
app.use("/api/appointments", appointmentRoutes);
// Blogs
app.use("/api/blogs", blogRoutes);
app.use("/api/pages", pagesRoutes);
// AI routes
app.use('/api/ai', aiRoutes);
// Chat history
app.use('/api/chat', chatHistoryRoutes);

// **Thêm đường dẫn API thanh toán**
app.use("/api/payment", paymentRoutes);

// --- Swagger UI ---
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { tagsSorter: "none" }
  })
);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Something went wrong!" });
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});
