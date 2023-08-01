const express = require("express");
const findfriendsRouter = express.Router();
const User = require("../Models/user");
const Post = require("../Models/post");
const FriendRequest = require("../Models/friendRequest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

findfriendsRouter.get("/", async (req, res) => {
  try {
    const cookies = req.cookies["token"];
    const verifiedToken = cookies && jwt.verify(cookies, "SomeSecretCodeHere");

    if (verifiedToken) {
      const { id } = verifiedToken;
      const loggedInUser = await User.findOne({ _id: id });
      const allUsers = await User.find({ _id: { $ne: id } });
      const allFriendRequests = await FriendRequest.find({ receiver: id });

      console.log(allFriendRequests);

      res.status(200).json({ loggedInUser, allUsers, allFriendRequests });
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
    const cookies = req.cookies["token"];
    const verifiedToken = cookies && jwt.verify(cookies, "SomeSecretCodeHere");

    if (verifiedToken) {
      const { id } = verifiedToken;
      const { receiverId } = req.body;

      const newFriendRequest = new FriendRequest({
        sender: id,
        receiver: receiverId,
      });

      console.log("this was logged");
      console.log(newFriendRequest);
      newFriendRequest.save();

      res.status(201).json({ message: "friend Request Sent!" });
    } else {
      res.status(201).json({ message: "couldn't send the friend request!" });
    }

    // res.status(200).send("sab ok hai ");
  } catch (error) {
    console.log("makefriends", error);
    res.status(400).send("Something went wrong!");
  }
});

module.exports = findfriendsRouter;
