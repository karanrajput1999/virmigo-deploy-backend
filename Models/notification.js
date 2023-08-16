const mongoose = require("mongoose");
const userModel = require("./user");

const notificationSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: userModel },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: userModel },
  status: { type: Number, enum: [1, 2, 3, 4] }, // 1 = fr received, 2 = fr accepted, 3 = post liked, 4 = post commented
});

const notificationModel = mongoose.model("notification", notificationSchema);

module.exports = notificationModel;
