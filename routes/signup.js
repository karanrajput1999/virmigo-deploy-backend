const express = require("express");
const signupRouter = express.Router();
const AuthController = require("../controllers/AuthController");
const Validators = require("../validators/Validators");

signupRouter
  .route("/")
  .get(AuthController.signupGet)
  .post(Validators.signupValidator, AuthController.signupPost);

module.exports = signupRouter;
