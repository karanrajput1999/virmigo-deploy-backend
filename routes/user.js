const express = require("express");
const userRouter = express.Router();
const UserController = require("../controllers/UserController");

userRouter.get("/:userId", UserController.UserControllerGet);

userRouter.post("/:userId", UserController.UserControllerPost);

userRouter.patch("/:userId", UserController.UserControllerPatch);

module.exports = userRouter;
