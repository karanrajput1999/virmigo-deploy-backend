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
        res.cookie("token", token, {
          expires: new Date(Date.now() + 900000000),
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });

        res.status(200).json(matchedUser);
      } else {
        res.status(400).send("Wrong credentials!");
      }
    }
  } catch (error) {
    console.log("error while logging in", error);
    res.status(400).send("Something went wrong!");
  }
});

loginRouter.get("/", async (req, res) => {
  try {
    const cookies = req.cookies["token"];
    // console.log("this is cookies while get request to login", req.cookies);
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
    console.log("error while making get request to login", error);
    res.status(500).send("Something went wrong!");
  }
});

module.exports = loginRouter;
