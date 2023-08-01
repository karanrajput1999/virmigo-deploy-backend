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
      // returns all the users that are not friends and the logged in user himself
      const allUsers = await User.find({
        _id: { $nin: [...loggedInUser.friends, id] },
      });
      // returns all the friend requests a user has
      const friendRequests = await FriendRequest.find({
        receiver: id,
        status: 1,
      });
      // returns all the friend request sender from those friend requests
      const allFriendRequests = await User.find({
        _id: {
          $in: friendRequests.map(
            (friendRequest) => new mongoose.Types.ObjectId(friendRequest.sender)
          ),
        },
      });

      res.status(200).json({ loggedInUser, allUsers, allFriendRequests });
    } else {
      res.end();
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
      const { receiverId, senderId, rejectSenderId } = req.body;

      if (receiverId) {
        const newFriendRequest = new FriendRequest({
          sender: id,
          receiver: receiverId,
        });
        newFriendRequest.save();

        res.status(201).json({ message: "friend Request Sent!" });
      } else if (senderId) {
        // updates the friend request's status to accepted
        await FriendRequest.updateOne(
          { sender: senderId, receiver: id },
          { status: 2 }
        );
        // udpates the friend array of both the sender and receiver
        await User.updateOne(
          { _id: id },
          { $push: { friends: new mongoose.Types.ObjectId(senderId) } }
        );
        await User.updateOne(
          { _id: senderId },
          { $push: { friends: new mongoose.Types.ObjectId(id) } }
        );

        /* checks if both user has sent friend requests to each other and if they have, 
        when one of the user accepts the friend request other friend request gets deleted */
        const duplicateFriendRequest = await FriendRequest.findOne({
          sender: id,
          receiver: senderId,
          status: 1,
        });

        if (duplicateFriendRequest) {
          await FriendRequest.findByIdAndDelete({
            _id: duplicateFriendRequest._id,
          });
        }

        res.status(200).json({ senderId, message: "friend Request accepted!" });
      } else if (rejectSenderId) {
        await FriendRequest.updateOne(
          { sender: rejectSenderId, receiver: id },
          { status: 3 }
        );
        res
          .status(200)
          .json({ rejectSenderId, message: "friend Request rejected!" });
      }
    } else {
      res.status(200).json({ message: "couldn't send the friend request!" });
    }

    // res.status(200).send("sab ok hai ");
  } catch (error) {
    console.log("makefriends", error);
    res.status(400).send("Something went wrong!");
  }
});

module.exports = findfriendsRouter;
