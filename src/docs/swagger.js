// src/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Drug Use Prevention API", version: "1.0.0" },
    // CHỖ NÀY thêm tags để chỉ định thứ tự và mô tả
    tags: [
      {
        name: "Auth",
        description: "Xác thực: đăng ký, đăng nhập, profile, logout"
      },
      {
        name: "Users",
        description: "Quản lý người dùng"
      },
      {
        name: "Course",
        description: "Quản lý các khóa học"
      },
      {
        name: "Survey",
        description: "Quản lý các khảo sát"
      },
      {
        name: "Appointment",
        description: "Quản lý các lịch hẹn"
      },
      {
        name: "Program",
        description: "Quản lý các chương trình"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
