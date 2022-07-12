const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const User = require("./models/User");
require("dotenv/config");
app.use(bodyParser.json());
app.use(logger);

app.get("/", (req, res) => {
  console.log("hi");
  res.json("TEST");
});

const userRouter = require("./routes/user");

app.use("/user", userRouter);

function logger(req, res, next) {
  console.log(req.originalUrl);
  next();
}

//Connect to DB
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true },
  (err) => {
    console.log(err);
    console.log("Connected to DB!");
    //Adding Admin
    bcrypt.hash("admin", 10, (err, hashedPass) => {
      if (err) {
        console.log(err);
      }
      const data = new User({
        username: "admin",
        password: hashedPass,
        level: 1,
      });
      data.save((err, result) => {
        if (err) {
          console.log("E11000 duplicate key error on Admin");
        } else {
          console.log("Adding Admin");
        }
      });
    });
  }
);

app.listen(4000);
