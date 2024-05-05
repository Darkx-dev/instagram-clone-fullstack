const fileUpload = require("express-fileupload");
// const mongoConnection = require('./mongoConnect')
const cookieParser = require("cookie-parser");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();
const userModel = require("./models/user");
const { rmSync } = require("fs");
// const { isAuthorised } = require("./auth");
const port = 8080;

// Functions for protected routes
const isAuthorised = async (req, res, next) => {
  const token = req.cookies.token || null;

  if (token) {
    // return res.send(token)
    const { username, password } = jwt.verify(token, "secret");
    const user = await userModel.findOne({
      username,
    });
    // return res.send(user)
    if (user) {
      const isPass = await bcrypt.compare(password, user.password);
      req.data = { user: user, isAuthorised: isPass };
      if (isPass) {
        // return res.send(isPass)
        return next();
      }
    }
  }
  res.redirect("/login")
};

app.set("view engine", "ejs");

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", isAuthorised, async (req, res) => {
  if (req.data.isAuthorised) {
    return res.redirect(`/profile/${req.data.user.username}`);
  }
  res.redirect("/create");
});

app.get("/login", async (req, res) => {
  res.status(404).render("login", { message: "Enter Login Details" });
});

app.get("/profile/:username", isAuthorised, async (req, res) => {
  if (req.params.username == req.data.user.username) {
    res.render("profile", { user: req.data.user });
    return;
  }
  res.status(404).redirect("/login");
});
app.get("/create", (req, res) => {
  res.render("register", { message: "" });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
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
  res.status(404).render("login", { message: "Invalid Login Details" });
});

app.post("/create", async (req, res) => {
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
  res.render("loginPage", { message: "Username Already Taken" });
});

app.post("/profile/:username/upload", isAuthorised, fileUpload(), async function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  let uploadedFile = req.files.uploadedFile;
  const imageExtention = uploadedFile.name.slice(
    uploadedFile.name.lastIndexOf("."),
    uploadedFile.name.name
  );
  if (imageExtention!= ".png" && imageExtention!= ".jpg") {
    return res.status(400).send("Invalid File Type");
  }
  uploadedFile.mv(
    path.join(__dirname, `/public/pfp/${req.data.user.username + imageExtention}`),
    async (err) => {
      if (err) return res.status(500).send(err);
      await userModel.findOneAndUpdate(
        { username: req.data.user.username },
        { image: `/static/pfp/${req.data.user.username + imageExtention}` }
      );
      res.redirect(`/profile/${req.data.user.username}`);
    }
  );
});

app.get("/profile/:username/edit",isAuthorised, (req, res) => {
  if (req.data.isAuthorised) {
    return res.render("edit", {user: req.data.user})
  }
  res.status(404).redirect("/login");
})

app.listen(port, () => {});
