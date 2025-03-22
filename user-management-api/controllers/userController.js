const User = require("../models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

// ✅ 1️⃣ 设置 multer 存储引擎
const storage = multer.diskStorage({
  destination: "images/",
  filename: (req, file, cb) => {
    cb(null, req.body.email + path.extname(file.originalname));
  },
});

// ✅ 2️⃣ 限制上传文件类型
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Invalid file format. Only JPEG, PNG, and GIF are allowed."),
      false
    );
  }
  cb(null, true);
};

// ✅ 3️⃣ 创建 multer 实例
const upload = multer({ storage, fileFilter });

// ✅ 4️⃣ 创建用户
const createUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(fullName)) {
      return res.status(400).json({ error: "Invalid full name format." });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ error: "Password does not meet security requirements." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ 5️⃣ 更新用户
const updateUser = async (req, res) => {
  try {
    const { email, fullName, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (fullName) {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(fullName)) {
        return res.status(400).json({ error: "Invalid full name format." });
      }
      user.fullName = fullName;
    }

    if (password) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res
          .status(400)
          .json({ error: "Password does not meet security requirements." });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ 6️⃣ 删除用户
const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ 7️⃣ 获取所有用户
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-_id fullName email");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ 8️⃣ 上传图片控制器（只处理业务，不再做上传本身）
const uploadImage = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!req.file) {
      return res.status(400).json({
        error: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
      });
    }

    if (user.image) {
      return res
        .status(400)
        .json({ error: "Image already exists for this user." });
    }

    user.image = `/images/${req.file.filename}`;
    await user.save();

    res
      .status(201)
      .json({ message: "Image uploaded successfully.", filePath: user.image });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

// ✅ 9️⃣ 导出模块
module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  uploadImage,
  upload, // ← 这个是 multer 实例（配合 router 使用）
};
