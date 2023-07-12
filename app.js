const express = require("express");
const app = express();
require("./db/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const signupRoute = require("./routes/signup");
const loginRoute = require("./routes/login");
const makefriendsRoute = require("./routes/makefriends");
const userRoute = require("./routes/user");

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/signup", signupRoute);
app.use("/login", loginRoute);
app.use("/makefriends", makefriendsRoute);
app.use("/user", userRoute);

app.get("/", (req, res) => {
  res.send("Yo it worked!");
});

app.listen(3000, () => {
  console.log("Server started!");
});
