const express = require("express");
const signupRouter = express.Router();
const AuthController = require("../controllers/AuthController");
const Validators = require("../validators/Validators");
const { storage } = require("../config/firebase");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// const fields =

signupRouter
  .route("/")
  .get(AuthController.signupGet)
  .post(
    upload.fields([
      { name: "profilePic", maxCount: 1 },
      { name: "coverPic", maxCount: 1 },
    ]),
    Validators.signupValidator,
    AuthController.signupPost
  );

module.exports = signupRouter;
