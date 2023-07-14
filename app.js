const express = require("express");
const app = express();
require("./db/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const makefriendsRouter = require("./routes/makefriends");
const userRouter = require("./routes/user");
const logoutRouter = require("./routes/logout");

app.use(express.json());
app.use(
  cors({
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/makefriends", makefriendsRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.send("Yo it worked!");
});

app.listen(3000, () => {
  console.log("Server started!");
});
