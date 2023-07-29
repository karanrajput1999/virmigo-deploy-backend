const express = require("express");
const findfriendsRouter = express.Router();
const User = require("../Models/user");
const Post = require("../Models/post");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

findfriendsRouter.get("/", async (req, res) => {
  try {
    const cookies = req.cookies["token"];
    const verifiedToken = cookies && jwt.verify(cookies, "SomeSecretCodeHere");

    if (verifiedToken) {
      const { id } = verifiedToken;

      const loggedInUser = await User.findOne({ _id: id });
      const allUsers = await User.find({
        _id: { $ne: id },
      });

      res.status(200).json({ loggedInUser, allUsers });
    } else {
      res.end();
      // res.status(200).send("invalid token");
    }
  } catch (error) {
    console.log("error while making get request to makefriends", error);
    res.status(500).send("Something went wrong!");
  }
});

findfriendsRouter.post("/", async (req, res) => {
  try {
    const { friendId } = req.body;

    const cookies = req.cookies["token"];
    const verifiedToken = cookies && jwt.verify(cookies, "SomeSecretCodeHere");

    if (verifiedToken) {
      const { id } = verifiedToken;
      await User.updateOne(
        { _id: id },
        { $push: { friendRequestsSent: new mongoose.Types.ObjectId(friendId) } }
      );
      await User.updateOne(
        { _id: friendId },
        { $push: { friendRequests: new mongoose.Types.ObjectId(id) } }
      );
      res.status(200).json({ message: "friend request sent!" });
    }

    // res.status(200).send("sab ok hai ");
  } catch (error) {
    console.log("makefriends", error);
    res.status(400).send("Something went wrong!");
  }
});

module.exports = findfriendsRouter;
