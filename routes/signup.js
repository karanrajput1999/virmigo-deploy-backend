const express = require("express");
const signupRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../Models/user");
const jwt = require("jsonwebtoken");

signupRouter.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // creating a copy of newUser so that I can delete password and some other properties
    const { password, createdAt, updatedAt, __v, ...newUserCopy } =
      newUser._doc;

    res.status(200).json(newUserCopy);
  } catch (error) {
    console.log("signup", error);
    res.status(500).json("Something went wrong!");
  }
});

signupRouter.get("/", async (req, res) => {
  try {
    const cookies = req.cookies["token"];
    // console.log("this is cookies while get request to signup", req.cookies);
    const verifiedToken = cookies && jwt.verify(cookies, "SomeSecretCodeHere");

    if (verifiedToken) {
      const { id } = verifiedToken;
      const loggedInUser = await User.findOne({ _id: new Object(id) });
      res.status(200).json(loggedInUser);
    } else {
      res.end();
      // res.status(200).send("invalid token");
    }
  } catch (error) {
    console.log("error while making get request to signup", error);
    res.status(500).json("Something went wrong!");
  }
});

module.exports = signupRouter;
