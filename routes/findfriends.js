const express = require("express");
const findfriendsRouter = express.Router();
const FindFriendsController = require("../controllers/findFriendsController");

findfriendsRouter.get("/", FindFriendsController.findFriendsGet);

findfriendsRouter.post("/", FindFriendsController.findFriendsPost);

module.exports = findfriendsRouter;
