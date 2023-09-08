const userModel = require("./user");
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    description: { type: String },
    image: { type: String, default: null },
    likes: { type: Array },
    comments: { type: Array },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: userModel },
    username: { type: String, required: true },
    userProfilePic: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

const postModel = mongoose.model("Post", PostSchema);

module.exports = postModel;
