const User = require("../Models/user");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const FriendRequest = require("../Models/friendRequest");

class UserController {
  async UserControllerGet(req, res) {
    try {
      const { userId } = req.params;

      const cookies = req.cookies["token"];
      const verifiedToken =
        cookies && jwt.verify(cookies, "SomeSecretCodeHere");
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
        cookies && jwt.verify(cookies, "SomeSecretCodeHere");
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
        if (friendRequestReceiverId) {
          const friendRequest = await new FriendRequest({
            sender: id,
            receiver: friendRequestReceiverId,
            status: 1,
          });
          friendRequest.save();
          res.status(201).json({ message: "friend Request Sent!" });
        }
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
}

module.exports = new UserController();
