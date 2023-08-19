const express = require("express");
const logoutRouter = express.Router();
const AuthController = require("../controllers/AuthController");

logoutRouter.get("/", AuthController.logout);

module.exports = logoutRouter;
