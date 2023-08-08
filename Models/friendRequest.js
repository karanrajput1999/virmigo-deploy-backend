const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: Number,
      enum: [1, 2, 3], // 1 = pending, 2 = accepted, 3 = rejected
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const friendRequestModel = mongoose.model("FriendRequest", friendRequestSchema);

module.exports = friendRequestModel;
