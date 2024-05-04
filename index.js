const fileUpload = require("express-fileupload");
// const mongoConnection = require('./mongoConnect')
const cookieParser = require("cookie-parser");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();
const userModel = require("./models/usermodel");
const { rmSync } = require("fs");
// const { isAuthorised } = require("./auth");
const port = 8080;

// Functions for protected routes
const isAuthorised = async (req, res, next) => {
  const token = req.cookies.token || null;

  if (token) {
    const { username, password } = jwt.verify(token, "secret");
    const user = await userModel.findOne({
      username,
    });
    if (user) {
      const isPass = await bcrypt.compare(password, user.password);
      req.user = { username, isAuthorised: isPass };
      if (isPass) {
        next();
        return;
      }
    }
  }
  res.redirect("/signin")
};

app.set("view engine", "ejs");

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", isAuthorised, async (req, res) => {
  if (req.user.isAuthorised) {
    return res.redirect(`/profile/${req.user.username}`);
  }
  res.redirect("/signup");
});

app.get("/signin", async (req, res) => {
  res.status(404).render("signin", { message: "Enter Login Details" });
});

app.get("/profile/:username", isAuthorised, async (req, res) => {
  if (req.params.username == req.user.username) {
    const user = await userModel.findOne({ username: req.user.username });
    res.render("profile", { user });
    return;
  }
  res.status(404).redirect("/signin");
});
app.get("/signup", (req, res) => {
  res.render("signup", { message: "" });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/signin");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (user) {
    const isPass = bcrypt.compare(password, user.password);
    if (isPass) {
      const token = jwt.sign({ username, password }, "secret");
      res.cookie("token", token);
      return res.redirect(`/profile/${username}`);
    }
  }
  res.status(404).render("signin", { message: "Invalid Login Details" });
});

app.post("/signup", async (req, res) => {
  // res.connection.setTimeout(0);
  const { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (!user) {
    if (username.length != 0 && password.length != 0) {
      const token = jwt.sign({ username, password }, "secret");
      res.cookie("token", token);
      bcrypt.hash(password, 10, async function (err, hash) {
        await userModel.create({ username, password: hash });
      });
      res.redirect(`/profile/${username}`);
    } else {
      return res.render("signup", {
        message: "username/passowrd cannot be blank",
      });
    }
  }
  res.render("signup", { message: "Username Already Taken" });
});

app.post("/upload", isAuthorised, fileUpload(), async function (req, res) {
  console.log(req.files);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  // else if (req.files.uploadFile.size > 200000) {
  //   return res.status(400).send("File size exceeds")
  // }

  let uploadedFile = req.files.uploadFile;
  const imageExtention = uploadedFile.name.slice(
    uploadedFile.name.lastIndexOf("."),
    uploadedFile.name.name
  );
  // const currentUser = await userModel.findOne({username: req.user.username})

  uploadedFile.mv(
    path.join(__dirname, `/public/pfp/${req.user.username + imageExtention}`),
    async (err) => {
      if (err) return res.status(500).send(err);
      await userModel.findOneAndUpdate(
        { username: req.user.username },
        { image: `/static/pfp/${req.user.username + imageExtention}` }
      );
      res.redirect(`/profile/${req.user.username}`);
    }
  );
});

app.listen(port, () => {});
