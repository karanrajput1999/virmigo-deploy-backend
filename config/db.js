const mongoose = require("mongoose");
require("dotenv").config();

const db = mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected!");
  });

module.exports = db;
