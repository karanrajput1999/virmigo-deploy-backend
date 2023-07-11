const express = require("express");
const signupRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../Models/user");

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
    res.status(200).json("User registered successfully!");
  } catch (error) {
    console.log("signup", error);
    res.status(500).json("Something went wrong!");
  }
});

module.exports = signupRouter;
