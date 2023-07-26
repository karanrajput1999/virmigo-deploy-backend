const express = require("express");
const postRouter = express.Router();
const Post = require("../Models/post");
const User = require("../Models/user");
const jwt = require("jsonwebtoken");

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
        const loggedInUser = await User.findOne({ _id: Object(id) });
        // const userAllPost = await Post.find({ userId: loggedInUser._id });
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
        res.status(200).json({ userWithAllPosts });
      } else {
        res.end();
        // res.status(200).send("invalid token");
      }
    } catch (error) {
      console.log("error while making get request to login", error);
      res.status(500).send("Something went wrong!");
    }
  })
  .post(async (req, res) => {
    try {
      const { description, userId, username } = req.body;
      const post = await new Post({
        description,
        userId: userId,
        username,
      });
      await User.updateOne({ _id: userId }, { $push: { posts: post._id } });

      post.save();
      res.status(201).send(post);
    } catch (error) {
      console.log("error while posting a post from backend", error);
    }
  });

module.exports = postRouter;
