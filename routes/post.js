const express = require("express");
const postRouter = express.Router();
const PostController = require("../controllers/PostController");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

postRouter
  .route("/")
  .get(PostController.postGet)
  .post(upload.single("postImage"), PostController.postPost)
  .delete(PostController.postDelete);

module.exports = postRouter;
