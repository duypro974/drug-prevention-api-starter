// src/models/courseRegistration.model.js
const mongoose = require("mongoose");

const courseRegSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course:  { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CourseRegistration", courseRegSchema);
