const express = require("express");
const logoutRouter = express.Router();

logoutRouter.get("/", (req, res) => {
  try {
    console.log("cookie here", req.cookies);

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.end();
  } catch (error) {
    console.log("error while logging out from backend", error);
  }
});

module.exports = logoutRouter;
