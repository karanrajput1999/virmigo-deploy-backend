const express = require("express");
const userRouter = express.Router();
const User = require("../Models/user");

userRouter.post("/:id", async (req, res) => {
  // id of user, we want to send to friend request to
  const { id } = req.params;
  // user sending the friend request
  const { email } = req.body;

  try {
    const friendRequestSender = await User.updateOne(
      { email },
      { $push: { friendRequestsSent: id } }
    );

    res.status(200).send(friendRequestSender);
  } catch (error) {
    console.log("user", error);
    res.status(400).send("Something went wrong!");
  }
});

module.exports = userRouter;
