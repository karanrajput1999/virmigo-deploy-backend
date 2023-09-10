const User = require("../Models/user");
const Post = require("../Models/post");
const FriendRequest = require("../Models/friendRequest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Notification = require("../Models/notification");
require("dotenv").config();

class FindFriendsController {
  async findFriendsGet(req, res) {
    try {
      const cookies = req.cookies["token"];
      const verifiedToken =
        cookies && jwt.verify(cookies, process.env.JWT_SECRET);

      if (verifiedToken) {
        const { id } = verifiedToken;
        const loggedInUser = await User.findOne({ _id: id });
        // returns all the users that are not friends and the logged in user himself
        const friendRequestsReceived = await FriendRequest.find({
          receiver: id,
          status: 1,
        });

        const allSenders = friendRequestsReceived.map((friendRequestSender) => {
          return friendRequestSender.sender;
        });

        const allUsers =
          allSenders.length === 0
            ? await User.find({
                _id: { $nin: [...loggedInUser.friends, id] },
              })
            : await User.find({
                _id: { $nin: [...loggedInUser.friends, ...allSenders, id] },
              });

        // all the friend request user has sent
        const friendRequestsSent = await FriendRequest.find({
          sender: id,
          status: 1,
        });

        // all the users whom friend request has been sent
        const allFriendRequestsSent = await User.find({
          _id: {
            $in: friendRequestsSent.map(
              (friendRequest) =>
                new mongoose.Types.ObjectId(friendRequest.receiver)
            ),
          },
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
              (friendRequest) =>
                new mongoose.Types.ObjectId(friendRequest.sender)
            ),
          },
        });

        res.status(200).json({
          loggedInUser,
          allUsers,
          allFriendRequests,
          allFriendRequestsSent,
        });
      } else {
        res.end();
      }
    } catch (error) {
      console.log("error while making get request to makefriends", error);
      res.status(500).send("Something went wrong!");
    }
  }

  async findFriendsPost(req, res) {
    try {
      const cookies = req.cookies["token"];
      const verifiedToken =
        cookies && jwt.verify(cookies, process.env.JWT_SECRET);

      if (verifiedToken) {
        const { id } = verifiedToken;
        const { receiverId, senderId, rejectSenderId, cancelRequestId } =
          req.body;

        // send friend request
        if (receiverId) {
          const newFriendRequest = new FriendRequest({
            sender: id,
            receiver: receiverId,
          });
          // do not send the notification if sender and receiver is same (someone likes/comment on his own post)
          if (receiverId !== id) {
            const notification = await new Notification({
              sender: id,
              receiver: receiverId,
              status: 1,
            });
            notification.save();
            await User.updateOne(
              { _id: receiverId },
              { $push: { notifications: notification._id } }
            );
          }
          newFriendRequest.save();

          res.status(201).json({ message: "friend Request Sent!" });
        } else if (senderId) {
          // updates the friend request's status to accepted
          await FriendRequest.updateOne(
            { sender: senderId, receiver: id, status: 1 },
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

          // do not send the notification if sender and receiver is same (someone likes/comment on his own post)
          if (senderId !== id) {
            const notification = await new Notification({
              sender: id,
              receiver: senderId,
              status: 2,
            });
            notification.save();
            await User.updateOne(
              { _id: senderId },
              { $push: { notifications: notification._id } }
            );
          }

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

          res
            .status(200)
            .json({ senderId, message: "friend Request accepted!" });
        } // rejecting friend request
        else if (rejectSenderId) {
          await FriendRequest.updateOne(
            {
              sender: rejectSenderId,
              receiver: id,
              status: 1,
            },
            { status: 3 }
          );
          res
            .status(200)
            .json({ rejectSenderId, message: "friend Request rejected!" });
        } // cancel friend request
        else if (cancelRequestId) {
          await FriendRequest.findOneAndDelete({
            sender: id,
            receiver: cancelRequestId,
            status: 1,
          });
          res
            .status(200)
            .json({ cancelRequestId, message: "friend Request cancelled!" });
        }
      } else {
        res.status(200).json({ message: "couldn't send the friend request!" });
      }
    } catch (error) {
      console.log("makefriends", error);
      res.status(400).send("Something went wrong!");
    }
  }
}

module.exports = new FindFriendsController();
