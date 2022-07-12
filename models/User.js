const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: "string",
    required: "true",
    unique: true,
  },
  password: {
    type: "string",
    required: "true",
  },
  level: {
    type: "string",
    required: "true",
    default: 2,
  },
  token: {
    type: "string",
  },
  refreshToken: {
    type: "string",
  },
});

module.exports = mongoose.model("User", UserSchema);
