const express = require("express");
const loginRouter = express.Router();
const AuthController = require("../controllers/AuthController");

loginRouter
  .route("/")
  .get(AuthController.loginGet)
  .post(AuthController.loginPost);

module.exports = loginRouter;
