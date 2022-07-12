const jwt = require("jsonwebtoken");
const User = require("../models/User");

const tokenCheck = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(token, "SacredValu3");

    req.user = decode;
    next();
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      res.status(401).json({
        message: "Token expired!",
      });
      return;
    }
    res.status(401).json({
      message: "Unauthorized!",
    });
  }
};

const adminOnly = (req, res, next) => {
  User.findOne({ token: req.headers.authorization.split(" ")[1] }).then(
    (user) => {
      //   console.log(user.level);
      if (user.level != 1) {
        res.status(401).json({
          message: "Unauthorized Admin Only!",
        });
      } else {
        next();
      }
    }
  );
};

const getToken = (decode) => {
  return jwt.sign({ name: decode.name }, "SacredValu3", {
    expiresIn: "30s",
  });
};

const getRefreshToken = (decode) => {
  return jwt.sign({ name: decode.name }, "RefreshValue", {
    expiresIn: "60s",
  });
};

module.exports = {
  tokenCheck: tokenCheck,
  adminOnly: adminOnly,
  getToken: getToken,
  getRefreshToken: getRefreshToken,
};
