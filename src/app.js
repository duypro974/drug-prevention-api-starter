// src/app.js

const express       = require("express");
const cors          = require("cors");
const dotenv        = require("dotenv");
const connectDB     = require("./config/db");
const authRoutes    = require("./routes/auth.routes");
const courseRoutes  = require("./routes/course.routes");
const swaggerUi     = require("swagger-ui-express");
const swaggerSpec   = require("./docs/swagger");
const surveyRoutes    = require("./routes/survey.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const userRoutes = require("./routes/user.routes");
const programRoutes = require("./routes/program.routes");
const programSurveyRoutes = require("./routes/programSurvey.routes");


dotenv.config();
connectDB();

const app = express();

// --- Global middleware ---
app.use(cors());
app.use(express.json());

// --- API routes ---
app.use("/api/programs", programRoutes);
// Nested: /api/programs/:id/survey
app.use("/api/programs/:id/survey", programSurveyRoutes);

app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/surveys", surveyRoutes);

app.use("/api/auth",   authRoutes);
app.use("/api/courses",courseRoutes);


// --- Swagger UI ---
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      tagsSorter: "none",
    }
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

// --- Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});
