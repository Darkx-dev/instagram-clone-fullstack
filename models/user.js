const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/social");

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
    required: false,
  },
  image: {
    type: String,
    default: null,
    required: false,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      likes: {
        type: mongoose.Schema.Types.ObjectId,
        default: 0,
        ref: "user",
        required: false,
      },
      ref: "post",
      required: false,
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: 0,
      required: false,
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: 0,
      required: false,
    },
  ],
  bio: {
    type: String,
    default: null,
    required: false,
  },
});

module.exports = mongoose.model("user", userSchema);
