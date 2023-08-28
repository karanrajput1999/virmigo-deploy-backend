const Joi = require("joi");
const {
  storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require("../config/firebase");

class Validators {
  async signupValidator(req, res, next) {
    try {
      const schema = Joi.object({
        name: Joi.string().min(3).max(25).required(),
        email: Joi.string().required(),
        password: Joi.string().min(4).max(20).required(),
        confirmPassword: Joi.string()
          .min(4)
          .max(20)
          .required()
          .equal(Joi.ref("password")),
      });

      if (req.files.profilePic) {
        // uploading profile pic
        const profilePicStorageRef = await ref(
          storage,
          `files/${req.files.profilePic[0].originalname}`
        );

        const profilePicFileType = {
          contentType: req.files.profilePic[0].mimetype,
        };

        const profilePicSnapshot = await uploadBytesResumable(
          profilePicStorageRef,
          req.files.profilePic[0].buffer,
          profilePicFileType
        );

        const profilePicDownloadURL = await getDownloadURL(
          profilePicSnapshot.ref
        );
        req.profilePicURL = profilePicDownloadURL;
      }

      if (req.files.coverPic) {
        // uploading cover pic
        const coverPicStorageRef = await ref(
          storage,
          `files/${req.files.coverPic[0].originalname}`
        );

        const coverPicFileType = {
          contentType: req.files.coverPic[0].mimetype,
        };

        const coverPicSnapshot = await uploadBytesResumable(
          coverPicStorageRef,
          req.files.coverPic[0].buffer,
          coverPicFileType
        );

        const coverPicDownloadURL = await getDownloadURL(coverPicSnapshot.ref);
        req.coverPicURL = coverPicDownloadURL;
      }

      // const storagePromises = req.files.map(async (file) => {
      //   const storageRef = ref(storage, `files/${file.originalName}`);

      //   const fileType = {
      //     contentType: file.mimetype,
      //   };

      //   const snapshot = await uploadBytesResumable(
      //     storageRef,
      //     file.buffer,
      //     fileType
      //   );

      //   const downloadUrl = await getDownloadURL(snapshot.ref);

      //   return downloadUrl;
      // });

      // const downloadUrls = await Promise.all(storagePromises);

      const value = schema.validate(req.body);
      if (value.error) {
        res.status(400).json({ message: value.error.message });
      } else {
        next();
      }
    } catch (error) {
      console.log("error while validating signup", error);
      res.status(500).send("Something went wrong!");
    }
  }
}

module.exports = new Validators();
