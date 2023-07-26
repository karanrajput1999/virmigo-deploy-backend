const userModel = require("./user");
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    image: { type: String, default: null },
    likes: { type: Array },
    comments: { type: Array },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: userModel },
    username: { type: String, required: true },
  },
  { timestamps: true }
);

const postModel = mongoose.model("Post", PostSchema);

module.exports = postModel;
