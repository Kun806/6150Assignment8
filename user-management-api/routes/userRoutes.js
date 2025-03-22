const express = require("express");
const userController = require("../controllers/userController");
const multer = require("multer"); // 额外引入

const router = express.Router();
const upload = userController.upload.single("image");

// ✅ 捕获所有上传错误的中间件包装器
function safeUpload(req, res, next) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error("Custom error:", err.message);
      if (err.message.includes("Invalid file format")) {
        return res.status(400).json({
          error: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
        });
      }
      return res.status(500).json({ error: "Upload failed." });
    }
    next(); // ✅ 一定要 next() 到下一个逻辑
  });
}

router.post("/create", userController.createUser);
router.put("/edit", userController.updateUser);
router.delete("/delete", userController.deleteUser);
router.get("/getAll", userController.getAllUsers);

// ✅ 使用安全封装上传 + 控制器执行
router.post("/uploadImage", safeUpload, userController.uploadImage);

module.exports = router;
