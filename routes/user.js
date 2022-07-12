const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const e = require("express");

router.get("/", auth.tokenCheck, (req, res) => {
  User.find({}, function (err, result) {
    if (err) return handleError(err);
    // console.log(result);
    res.json(result);
  });
});

router.post("/add-new", auth.tokenCheck, auth.adminOnly, (req, res) => {
  // res.json(req.body);
  bcrypt.hash(req.body.password, 10, (err, hashedPass) => {
    if (err) {
      res.json({
        err: err,
      });
    }
    const data = new User({
      username: req.body.username,
      password: hashedPass,
      level: req.body.level,
    });
    data.save((err, result) => {
      if (err) {
        res.status(500).json({
          message: err,
        });
      } else {
        res.json({
          message: "Data Added",
          _id: result._id
        });
      }
    });
  });
});

router.delete("/delete", auth.tokenCheck, auth.adminOnly, (req, res) => {
  let _id = req.body._id;
  User.find({ _id: _id }).remove((err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: err,
      });
    } else {
      res.json(result);
    }
  });
});

router.put("/update", auth.tokenCheck, auth.adminOnly, (req, res) => {
  let _id = req.body._id;
  let password = req.body.password;
  bcrypt.hash(password, 10, (err, hashedPass) => {
    if (err) {
      res.json({
        err: err,
      });
    }
    User.updateOne(
      { _id: _id },
      { $set: { password: hashedPass } },
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            message: err,
          });
        } else {
          console.log(result);
          res.json({
            message: "Updated successfully",
            _id: _id,
            password: hashedPass,
          });
        }
      }
    );
  });
});

router.post("/login", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }).then((user) => {
    if (user && password) {
      console.log("masuk sini");
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          res.status(500).json({
            err: err,
          });
        }
        console.log("2");

        console.log({
          password: password,
          userpass: user.password,
        });
        if (result) {
          let token = auth.getToken(user);
          let refreshToken = auth.getRefreshToken(user);
          User.updateOne(
            { _id: user._id.toString() },
            { $set: { token: token, refreshToken: refreshToken } },
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(500).json({
                  message: err,
                });
              } else {
                console.log(result);
                res.json({
                  token: token,
                  refreshToken: refreshToken,
                });
              }
            }
          );
        } else {
          res.status(401).json({
            message: "Unauthorized!",
          });
        }
      });
    } else {
      res.json({
        status: 404,
        message: "User not found!",
      });
    }
  });
});

router.get("/refresh-token", (req, res) => {
  let refreshToken = req.headers.authorization.split(" ")[1];
  console.log(refreshToken);
  jwt.verify(refreshToken, "RefreshValue", (err, decode) => {
    // console.log(decode)
    if (err) {
      if (err.name == "TokenExpiredError") {
        res.status(401).json({
          message: "Refresh token expired!",
        });
        return;
      }
      res.status(400).json({
        message: err,
      });
    } else {
      console.log("1");
      let token = auth.getToken(decode);
      User.updateOne(
        { refreshToken: refreshToken },
        { $set: { token: token } },
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).json({
              message: err,
            });
          } else {
            console.log(result);
            res.json({
              message: "Token refreshed successfully",
              refreshToken: refreshToken,
              token: token,
            });
          }
        }
      );
    }
  });
});

module.exports = router;
