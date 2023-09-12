const express = require("express");
const app = express();
require("./config/db");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const findfriendsRouter = require("./routes/findfriends");
const userRouter = require("./routes/user");
const logoutRouter = require("./routes/logout");
const postRouter = require("./routes/post");
const notificationsRouter = require("./routes/notifications");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://virmigo.vercel.app",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://virmigo.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});
app.use(cookieParser());
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/findfriends", findfriendsRouter);
app.use("/user", userRouter);
app.use("/notifications", notificationsRouter);
app.use("/", postRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server started at port no ${process.env.PORT}!`);
});
