const Post = require("../Models/post");
const User = require("../Models/user");
const Comment = require("../Models/comment");
const FriendRequest = require("../Models/friendRequest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Notification = require("../Models/notification");
const {
  storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require("../config/firebase");

class PostController {
  async postGet(req, res) {
    try {
      const cookies = req.cookies["token"];
      const verifiedToken =
        cookies && jwt.verify(cookies, "SomeSecretCodeHere");

      if (verifiedToken) {
        const { id } = verifiedToken;
        // returns currently logged in user
        const loggedInUser = await User.findOne({ _id: Object(id) });

        // returns all the posts user and his friends have posted with sorted by recent posts
        const userWithAllPosts = await User.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(id),
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
              ],
              as: "myPosts",
            },
          },
          {
            $lookup: {
              from: "posts",
              localField: "friends",
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
              ],
              as: "allFriendsPosts",
            },
          },

          {
            $set: {
              allPostsCombined: {
                $concatArrays: ["$myPosts", "$allFriendsPosts"],
              },
            },
          },
          {
            $unwind: {
              path: "$allPostsCombined",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $sort: {
              "allPostsCombined.createdAt": -1,
            },
          },
          {
            $group: {
              _id: "$_id",
              name: { $first: "$name" },
              email: { $first: "$email" },
              bio: { $first: "$bio" },
              livesIn: { $first: "$livesIn" },
              profilePic: { $first: "$profilePic" },
              coverPic: { $first: "$coverPic" },
              coverPic: { $first: "$coverPic" },
              createdAt: { $first: "$createdAt" },
              updatedAt: { $first: "$updatedAt" },
              notifications: { $first: "$notifications" },
              allPostsCombined: { $push: "$allPostsCombined" },
            },
          },
        ]);

        const userAllPosts = await User.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(id),
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

        // returns all friends that user have
        const userAllFriends = await User.aggregate([
          {
            $match: { _id: { $in: loggedInUser.friends } },
          },
          {
            $project: { password: 0 },
          },
        ]);

        res.status(200).json({
          userWithAllPosts,
          userAllFriends,
          userAllPosts,
          // userWithAllPostsCopy,
        });
      } else {
        res.end();
        // res.status(200).send("invalid token");
      }
    } catch (error) {
      console.log("error while making get request to post", error);
      res.status(500).send("Something went wrong!");
    }
  }

  async postPost(req, res) {
    try {
      const {
        description,
        userId,
        username,
        userProfilePic,
        unfriendId,
        commentText,
        postId,
        likedPostId,
        // friendRequestReceiverId,
        // cancelRequestId,
      } = req.body;

      const cookies = req.cookies["token"];
      const verifiedToken =
        cookies && jwt.verify(cookies, "SomeSecretCodeHere");

      if (verifiedToken) {
        const { id } = verifiedToken;
        const loggedInUser = await User.findOne({ _id: Object(id) });
        if (description || req.file) {
          let postImageUrl;

          if (req.file) {
            const postImageRef = await ref(
              storage,
              `post/${req.file.originalname}`
            );

            const postImageFileType = {
              contentType: req.file.mimetype,
            };

            const postImageSnapshot = await uploadBytesResumable(
              postImageRef,
              req.file.buffer,
              postImageFileType
            );

            const imageUrl = await getDownloadURL(postImageSnapshot.ref);
            postImageUrl = imageUrl;
          }

          console.log("userProfilePic");
          const post = await new Post({
            description,
            userId: userId,
            username,
            image: postImageUrl || null,
            // formData is converting null to null of string that's why had to do this
            userProfilePic: userProfilePic === "null" ? null : userProfilePic,
          });
          await User.updateOne({ _id: userId }, { $push: { posts: post._id } });
          post.save();

          res.status(201).json(post);
        }
        // if (description) {
        //   const post = await new Post({
        //     description,
        //     userId: userId,
        //     username,
        //   });
        //   await User.updateOne({ _id: userId }, { $push: { posts: post._id } });
        //   post.save();

        //   res.status(201).json(post);
        // }

        if (unfriendId) {
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

        // comment on post
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
          const latestComment = {
            ...comment._doc,
            commentOwner: [loggedInUser],
          };

          const postOwnerId = await Post.findOne({ _id: postId });

          // do not send the notification if sender and receiver is same (someone likes/comment on his own post)
          if (
            postOwnerId.userId.toString() !==
            new mongoose.Types.ObjectId(id).toString()
          ) {
            const notification = await new Notification({
              sender: id,
              receiver: postOwnerId.userId,
              status: 4,
            });
            notification.save();
            await User.updateOne(
              { _id: postOwnerId.userId },
              { $push: { notifications: notification._id } }
            );
          }

          res
            .status(201)
            .json({ message: "commented!", comment: latestComment });
        }

        // like post
        if (likedPostId) {
          const alreadyLiked = await Post.findOne({
            _id: likedPostId,
            likes: { $elemMatch: { $eq: new mongoose.Types.ObjectId(id) } },
          });

          if (alreadyLiked) {
            const likedPost = await Post.findByIdAndUpdate(
              { _id: likedPostId },
              { $pull: { likes: new mongoose.Types.ObjectId(id) } }
            );
            const postOwnerId = await User.findOne({ _id: likedPost.userId });

            // remove the notification when post is unliked
            const likeNotification = await Notification.findOne({
              sender: id,
              receiver: postOwnerId,
              status: 3,
            });

            await Notification.findByIdAndDelete({ _id: likeNotification._id });

            console.log(
              "remove this notification when unliked",
              likeNotification
            );
            res.status(200).json({ message: "post unliked!" });
          } else {
            const likedPost = await Post.findByIdAndUpdate(
              { _id: likedPostId },
              { $push: { likes: new mongoose.Types.ObjectId(id) } }
            );

            const postOwnerId = await User.findOne({ _id: likedPost.userId });

            // do not send the notification if sender and receiver is same (someone likes/comment on his own post)
            if (
              postOwnerId._id.toString() !==
              new mongoose.Types.ObjectId(id).toString()
            ) {
              const notification = await new Notification({
                sender: id,
                receiver: postOwnerId,
                status: 3,
              });
              notification.save();
              await User.updateOne(
                { _id: postOwnerId },
                { $push: { notifications: notification._id } }
              );
            }

            res.status(200).json({ message: "post liked!" });
          }
        }
      }
    } catch (error) {
      console.log("error while posting a post from backend", error);
    }
  }

  async postDelete(req, res) {
    try {
      const { deletePostId } = req.body;
      await Post.findByIdAndDelete({ _id: deletePostId });
      res.status(200).json({ message: "Post Deleted!" });
    } catch (error) {
      console.log("something went wrong while deleting post", error);
    }
  }
}

module.exports = new PostController();
