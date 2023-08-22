const express = require("express");
const app = express();
require("./config/db");
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
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
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

app.get("/", (req, res) => {
  res.send("Yo it worked!");
});

app.listen(3000, () => {
  console.log("Server started!");
});
