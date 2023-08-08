const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    commenterId: { type: mongoose.Schema.Types.ObjectId, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, required: true },
    commentText: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const commentModel = mongoose.model("comment", commentSchema);

module.exports = commentModel;
