const mongoose = require("mongoose");

const db = mongoose
  .connect(
    "mongodb+srv://docsdelhi7:virmigo123@virmigo-cluster.ydziizz.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Database connected!");
  });

module.exports = db;
