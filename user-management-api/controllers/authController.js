const bcrypt = require("bcryptjs");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 验证密码强度
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ error: "Password does not meet security requirements." });
    }

    // 哈希加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser };
