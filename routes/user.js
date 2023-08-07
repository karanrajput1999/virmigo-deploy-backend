const express = require("express");
const userRouter = express.Router();
const UserController = require("../controllers/UserController");
const Joi = require("joi");
const User = require("../Models/user");
const jwt = require("jsonwebtoken");

userRouter.get("/:userId", UserController.UserControllerGet);

userRouter.post("/:userId", UserController.UserControllerPost);

userRouter.patch("/:userId", async (req, res) => {
  try {
    const cookies = req.cookies["token"];
    const verifiedToken = cookies && jwt.verify(cookies, "SomeSecretCodeHere");
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
          await User.updateOne({ _id: id }, { bio: validatedValue.value.bio });
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
});

module.exports = userRouter;
