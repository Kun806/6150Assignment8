const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config(); // 加载环境变量
connectDB(); // 连接数据库

const app = express();
app.use(express.json()); // 允许解析 JSON 请求体

//  **Swagger 配置**
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Management API",
      version: "1.0.0",
      description:
        "API for managing users (Create, Read, Update, Delete, Upload Image)",
    },
  },
  apis: ["./routes/*.js"], // 让 Swagger 扫描 `routes` 目录下的所有路由文件
};

//  **初始化 Swagger**
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//  **设置 API 路由**
app.use("/user", userRoutes);

//  **监听端口**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
