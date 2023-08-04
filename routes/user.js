const express = require("express");
const userRouter = express.Router();
const User = require("../Models/user");
const jwt = require("jsonwebtoken");

userRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cookies = req.cookies["token"];
    // console.log("this is cookies while get request to signup", req.cookies);
    const verifiedToken = cookies && jwt.verify(cookies, "SomeSecretCodeHere");
    console.log("this is being run with cookies ", cookies);
    if (verifiedToken) {
      const { id } = verifiedToken;
      const loggedInUser = await User.findOne({ _id: Object(id) });
      const user = await User.findOne({ _id: userId });
      const { password, ...userProfile } = await user._doc;
      console.log(loggedInUser, userProfile);
      res.status(200).json({ userProfile, loggedInUser });
    } else {
      res.status(400).send("Something went wrong! while fetching user profile");
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
