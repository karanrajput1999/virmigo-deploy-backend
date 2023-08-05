const express = require("express");
const userRouter = express.Router();
const User = require("../Models/user");
const jwt = require("jsonwebtoken");

userRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cookies = req.cookies["token"];
    const verifiedToken = cookies && jwt.verify(cookies, "SomeSecretCodeHere");
    if (verifiedToken) {
      const { id } = verifiedToken;
      const loggedInUser = await User.findOne({ _id: Object(id) });
      const user = await User.findOne({ _id: userId });
      const { password, ...userProfile } = await user._doc;
      const userAllFriends = await User.aggregate([
        {
          $match: { _id: { $in: loggedInUser.friends } },
        },
        {
          $project: { password: 0 },
        },
      ]);
      console.log("user all friends from profile", userAllFriends);
      res.status(200).json({ userProfile, loggedInUser, userAllFriends });
    } else {
      res.end();
    }
  } catch (error) {
    res
      .status(400)
      .send("Something went wrong! while fetching user profile", error);
  }
});

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
