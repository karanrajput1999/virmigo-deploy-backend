const express = require("express");
const jwt = require("jsonwebtoken");
const notificationsRouter = express.Router();
const User = require("../Models/user");
const Notification = require("../Models/notification");

notificationsRouter.get("/", async (req, res) => {
  try {
    const cookies = req.cookies["token"];
    const verifiedToken = cookies && jwt.verify(cookies, "SomeSecretCodeHere");

    if (verifiedToken) {
      const { id } = verifiedToken;
      const loggedInUser = await User.findOne({ _id: Object(id) });
      //   const notifications = await Notification.find({
      //     _id: { $in: loggedInUser.notifications },
      //   });

      const notifications = await Notification.aggregate([
        {
          $match: {
            _id: { $in: loggedInUser.notifications },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  password: 0,
                },
              },
            ],
            as: "notificationSender",
          },
        },
      ]);

      console.log(
        "aggregate notifications",
        notifications[0].notificationSender
      );
      const { password, ...loggedInUserWithoutPassword } = loggedInUser._doc;
      res
        .status(200)
        .json({ loggedInUser: loggedInUserWithoutPassword, notifications });
    } else {
      res.end();
    }
  } catch (error) {
    console.log("error in notifications", error);
  }
});

module.exports = notificationsRouter;
