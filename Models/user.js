const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    bio: { type: String, default: "" },
    livesIn: { type: String, default: "" },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    coverPic: { type: String, default: "" },
    posts: { type: Array },
    comments: { type: Array },
    friends: { type: Array },
    notifications: { type: Array },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", UserSchema);

module.exports = userModel;
