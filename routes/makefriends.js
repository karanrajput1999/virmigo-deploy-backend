const express = require("express");
const makefriendsRouter = express.Router();
const User = require("../Models/user");

makefriendsRouter.get("/", async (req, res) => {
  try {
    const allUsers = await User.find({});

    res.status(200).send(allUsers);
  } catch (error) {
    console.log("makefriends", error);
    res.status(400).send("Something went wrong!");
  }
});

module.exports = makefriendsRouter;
