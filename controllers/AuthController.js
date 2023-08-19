const User = require("../Models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class AuthController {
  async signupPost(req, res) {
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
      console.log("signup error", error);
      if (error.code === 11000) {
        res.status(401).send("Email Already exist!");
      } else {
        res.status(500).json("Something went wrong!");
      }
    }
  }

  async signupGet(req, res) {
    try {
      const cookies = req.cookies["token"];
      // console.log("this is cookies while get request to signup", req.cookies);
      const verifiedToken =
        cookies && jwt.verify(cookies, "SomeSecretCodeHere");

      if (verifiedToken) {
        const { id } = verifiedToken;
        const loggedInUser = await User.findOne({ _id: Object(id) });
        console.log("signup get request from backend", loggedInUser);
        res.status(200).json(loggedInUser);
      } else {
        res.end();
        // res.status(200).send("invalid token");
      }
    } catch (error) {
      console.log("error while making get request to signup", error);
      res.status(500).json("Something went wrong!");
    }
  }

  async loginPost(req, res) {
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
          res.status(401).send("Wrong credentials!");
        }
      } else {
        res.status(401).send("No user found with this email!");
      }
    } catch (error) {
      console.log("error while logging in", error);
      res.status(400).send("Something went wrong!");
    }
  }

  async loginGet(req, res) {
    try {
      const cookies = req.cookies["token"];
      // console.log("this is cookies while get request to login", req.cookies);
      const verifiedToken =
        cookies && jwt.verify(cookies, "SomeSecretCodeHere");

      if (verifiedToken) {
        const { id } = verifiedToken;
        const loggedInUser = await User.findOne({ _id: Object(id) });
        res.status(200).json(loggedInUser);
      } else {
        res.end();
        // res.status(200).send("invalid token");
      }
    } catch (error) {
      console.log("error while making get request to login", error);
      res.status(500).send("Something went wrong!");
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.end();
    } catch (error) {
      console.log("error while logging out from backend", error);
    }
  }
}

module.exports = new AuthController();
