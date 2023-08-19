const express = require("express");
const postRouter = express.Router();
const PostController = require("../controllers/PostController");

postRouter
  .route("/")
  .get(PostController.postGet)
  .post(PostController.postPost)
  .delete(PostController.postDelete);

module.exports = postRouter;
