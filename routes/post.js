const express = require("express");
const postRouter = express.Router();
const Post = require("../Models/post");
const User = require("../Models/user");
const FriendRequest = require("../Models/friendRequest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

postRouter
  .route("/")
  .get(async (req, res) => {
    try {
      const cookies = req.cookies["token"];
      // console.log("this is cookies while get request to login", req.cookies);
      const verifiedToken =
        cookies && jwt.verify(cookies, "SomeSecretCodeHere");

      if (verifiedToken) {
        const { id } = verifiedToken;
        // returns currently logged in user
        const loggedInUser = await User.findOne({ _id: Object(id) });

        // returns all the posts user have posted
        const userWithAllPosts = await User.aggregate([
          { $match: { email: loggedInUser.email } },
          {
            $lookup: {
              from: "posts",
              localField: "_id",
              foreignField: "userId",
              pipeline: [
                {
                  $sort: {
                    createdAt: -1,
                  },
                },
              ],
              as: "userAllPosts",
            },
          },
        ]);

        // returns all friends that user have
        const userAllFriends = await User.aggregate([
          {
            $match: { _id: { $in: loggedInUser.friends } },
          },
          {
            $project: { password: 0 },
          },
        ]);

        // const allUsers = await User.find({
        //   _id: { $nin: [...loggedInUser.friends, id] },
        // });

        // all the friend request user has sent
        // const friendRequestsSent = await FriendRequest.find({
        //   sender: id,
        //   status: 1,
        // });
        // all the users whom friend request has been sent
        // const allFriendRequestsSent = await User.find({
        //   _id: {
        //     $in: friendRequestsSent.map(
        //       (friendRequest) =>
        //         new mongoose.Types.ObjectId(friendRequest.receiver)
        //     ),
        //   },
        // });

        res.status(200).json({
          userWithAllPosts,
          userAllFriends,
          // allUsers,
          // allFriendRequestsSent,
        });
      } else {
        res.end();
        // res.status(200).send("invalid token");
      }
    } catch (error) {
      console.log("error while making get request to post", error);
      res.status(500).send("Something went wrong!");
    }
  })
  .post(async (req, res) => {
    try {
      const {
        description,
        userId,
        username,
        unfriendId,
        // friendRequestReceiverId,
        // cancelRequestId,
      } = req.body;

      const cookies = req.cookies["token"];
      const verifiedToken =
        cookies && jwt.verify(cookies, "SomeSecretCodeHere");

      if (verifiedToken) {
        const { id } = verifiedToken;
        const loggedInUser = await User.findOne({ _id: Object(id) });
        if (description && userId && username) {
          const post = await new Post({
            description,
            userId: userId,
            username,
          });
          await User.updateOne({ _id: userId }, { $push: { posts: post._id } });
          post.save();

          console.log("post created");

          res.status(201).json(post);
        }

        if (unfriendId) {
          console.log("friend id to unfriend", unfriendId);
          await User.updateOne(
            { _id: id },
            { $pull: { friends: new mongoose.Types.ObjectId(unfriendId) } }
          );
          await User.updateOne(
            { _id: unfriendId },
            { $pull: { friends: new mongoose.Types.ObjectId(id) } }
          );
          res.status(201).send("user unfriended");
        }

        // if (friendRequestReceiverId) {
        //   const friendRequest = await new FriendRequest({
        //     sender: id,
        //     receiver: friendRequestReceiverId,
        //     status: 1,
        //   });
        //   friendRequest.save();
        //   res.status(201).json({ message: "friend Request Sent!" });
        // }

        // if (cancelRequestId) {
        //   await FriendRequest.findOneAndDelete({
        //     sender: id,
        //     receiver: cancelRequestId,
        //     status: 1,
        //   });
        //   res
        //     .status(200)
        //     .json({ cancelRequestId, message: "friend Request cancelled!" });
        // }
      }
    } catch (error) {
      console.log("error while posting a post from backend", error);
    }
  });

module.exports = postRouter;
