const express = require("express");
const findfriendsRouter = express.Router();
const User = require("../Models/user");
const Post = require("../Models/post");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

findfriendsRouter.get("/", async (req, res) => {
  try {
    const cookies = req.cookies["token"];
    // console.log("this is cookies while get request to login", req.cookies);
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
    const { adminUserId } = req.body;
    // const allUsers = await User.aggregate([{ $match: { _id: adminUserId } }]);

    res.status(200).json({ allUsers });
  } catch (error) {
    console.log("makefriends", error);
    res.status(400).send("Something went wrong!");
  }
});

module.exports = findfriendsRouter;
