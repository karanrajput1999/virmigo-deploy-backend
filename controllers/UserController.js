const User = require("../Models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const FriendRequest = require("../Models/friendRequest");
const Joi = require("joi");
require("dotenv").config();

class UserController {
  async UserControllerGet(req, res) {
    try {
      const { userId } = req.params;

      const cookies = req.cookies["token"];
      const verifiedToken =
        cookies && jwt.verify(cookies, process.env.JWT_SECRET);
      if (verifiedToken) {
        const { id } = verifiedToken;
        const loggedInUser = await User.findOne({ _id: Object(id) });
        const user = await User.findOne({ _id: userId });

        const { password, ...userProfile } = await user._doc;
        const userAllFriends = await User.aggregate([
          {
            $match: { _id: { $in: user.friends } },
          },
          {
            $project: { password: 0 },
          },
        ]);

        const userAllPosts = await User.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(userId),
            },
          },
          {
            $lookup: {
              from: "posts",
              localField: "_id",
              foreignField: "userId",
              pipeline: [
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
                    as: "postComments",
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "likes",
                    foreignField: "_id",
                    as: "likedUsers",
                  },
                },
                {
                  $sort: {
                    createdAt: -1,
                  },
                },
              ],
              as: "userPosts",
            },
          },
        ]);

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

        res.status(200).json({
          userProfile,
          loggedInUser,
          userAllFriends,
          allFriendRequestsSent,
          userAllPosts,
        });
      } else {
        res.status(400).end();
      }
    } catch (error) {
      res
        .status(400)
        .send("Something went wrong! while fetching user profile", error);
    }
  }

  async UserControllerPost(req, res) {
    const { unfriendId, friendRequestReceiverId, cancelRequestId } = req.body;

    try {
      const cookies = req.cookies["token"];
      const verifiedToken =
        cookies && jwt.verify(cookies, process.env.JWT_SECRET);
      if (verifiedToken) {
        const { id } = verifiedToken;

        if (unfriendId) {
          await User.updateOne(
            { _id: id },
            { $pull: { friends: new mongoose.Types.ObjectId(unfriendId) } }
          );
          await User.updateOne(
            { _id: unfriendId },
            { $pull: { friends: new mongoose.Types.ObjectId(id) } }
          );
          res.status(200).send("user unfriended");
        }
        // send friend request
        if (friendRequestReceiverId) {
          const friendRequest = await new FriendRequest({
            sender: id,
            receiver: friendRequestReceiverId,
            status: 1,
          });

          friendRequest.save();
          res.status(201).json({ message: "friend Request Sent!" });
        }
        // cancel friend request
        if (cancelRequestId) {
          await FriendRequest.findOneAndDelete({
            sender: id,
            receiver: cancelRequestId,
            status: 1,
          });
          res
            .status(200)
            .json({ cancelRequestId, message: "friend Request cancelled!" });
        }
      }
    } catch (error) {
      console.log("user", error);
      res.status(400).send("Something went wrong!");
    }
  }

  async UserControllerPatch(req, res) {
    try {
      const cookies = req.cookies["token"];
      const verifiedToken =
        cookies && jwt.verify(cookies, process.env.JWT_SECRET);
      if (verifiedToken) {
        const { id } = verifiedToken;
        const loggedInUser = await User.findOne({ _id: Object(id) });

        const schema = Joi.object({
          name: Joi.string().min(3).max(25).allow("").optional(),
          email: Joi.string().email().allow("").optional(),
          bio: Joi.string().min(3).max(100).allow("").optional(),
          state: Joi.string().min(3).max(30).allow("").optional(),
        });

        const validatedValue = schema.validate(req.body);

        if (validatedValue.error) {
          console.log(validatedValue.error.message);
          res.status(400).json({ message: validatedValue.error.message });
        } else {
          if (validatedValue.value.name) {
            await User.updateOne(
              { _id: id },
              { name: validatedValue.value.name }
            );
          }
          if (validatedValue.value.email) {
            await User.updateOne(
              { _id: id },
              { email: validatedValue.value.email }
            );
          }
          if (validatedValue.value.bio) {
            await User.updateOne(
              { _id: id },
              { bio: validatedValue.value.bio }
            );
          }
          if (validatedValue.value.state) {
            await User.updateOne(
              { _id: id },
              { livesIn: validatedValue.value.state }
            );
          }
        }

        res.status(200).json({ status: "OK" });
      } else {
        res.status(400).end();
      }
    } catch (error) {
      console.log("error while patching profile", error);
    }
  }
}

module.exports = new UserController();
