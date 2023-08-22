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

// .post(
//   async (req, res, next) => {
//     try {
//       await upload.fields([
//         { name: "profile-pic", maxCount: 1 },
//         { name: "cover-pic", maxCount: 1 },
//       ])(req, res, (err) => {
//         if (err instanceof multer.MulterError) {
//           // Handle Multer-related errors (e.g., file size exceeded)
//           return res.status(400).json({ error: "Multer error: " + err.message });
//         } else if (err) {
//           // Handle other errors
//           return res.status(500).json({ error: "An error occurred during file upload." });
//         }
//         next(); // Proceed to the next middleware
//       });
//     } catch (err) {
//       // Handle other asynchronous errors
//       return res.status(500).json({ error: "An error occurred." });
//     }
//   },
//   Validators.signupValidator,
//   AuthController.signupPost
// );
