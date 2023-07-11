const express = require("express");
const loginRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/user");

loginRouter.post("/", async (req, res) => {
  const { email, password } = req.body;

  const createToken = function (id) {
    return jwt.sign({ id }, "SomeSecretCodeHere");
  };

  try {
    const matchedUser = await User.findOne({ email });

    if (matchedUser) {
      const comparePassword = await bcrypt.compare(
        password,
        matchedUser.password
      );

      if (comparePassword) {
        const token = createToken(matchedUser._id);
        res.cookie("token", token);
        console.log("cookies result ", req.cookies);
        res.status(200).send(`${matchedUser.username} logged in successfully!`);
      } else {
        res.status(400).send("Wrong credentials!");
      }
    }
  } catch (error) {
    console.log("login", error);
    res.status(400).send("Something went wrong!");
  }
});

module.exports = loginRouter;
