const express = require("express");
const postRouter = express.Router();
const Post = require("../Models/post");
const User = require("../Models/user");
const Comment = require("../Models/comment");
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
        const userWithAllPostsCopy = await User.aggregate([
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

                {
                  $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "postId",
                    pipeline: [
                      {
                        $lookup: {
                          from: "users",
                          localField: "commenterId",
                          foreignField: "_id",
                          as: "commentOwner",
                        },
                      },
                    ],
                    as: "postAllComments",
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

        // });

        res.status(200).json({
          userWithAllPosts,
          userAllFriends,
          userWithAllPostsCopy,
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
        commentText,
        postId,
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

        // creating comment
        if (commentText && postId) {
          const comment = await new Comment({
            commenterId: id,
            postId,
            commentText,
          });
          comment.save();

          await Post.updateOne(
            { _id: postId },
            { $push: { comments: comment._id } }
          );
          res.status(201).send("commented!");
        }
      }
    } catch (error) {
      console.log("error while posting a post from backend", error);
    }
  });

module.exports = postRouter;
