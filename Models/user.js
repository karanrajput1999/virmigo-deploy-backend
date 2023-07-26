const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: null },
    coverPic: { type: String, default: null },
    posts: { type: Array },
    comments: { type: Array },
    friends: { type: Array },
    friendRequestsSent: { type: Array },
    friendRequests: { type: Array },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", UserSchema);

module.exports = userModel;
