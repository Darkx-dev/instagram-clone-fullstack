const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/usersData");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("user", userSchema);
