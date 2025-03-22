const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, match: /^[A-Za-z\s]+$/ },
  email: { type: String, required: true, unique: true, match: /\S+@\S+\.\S+/ },
  password: { type: String, required: true },
  imagePath: { type: String, default: "" },
});

module.exports = mongoose.model("User", UserSchema);
