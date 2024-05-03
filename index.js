const cookieParser = require("cookie-parser");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();
const userModel = require("./usermodel");
const port = 8080;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use( (req, res, next) => {
  setTimeout(() => {
    next()
  },2000)
})
app.get("/", (req, res) => {
  res.redirect("/signin");
});

app.get("/signin", async (req, res) => {
  const token = await req.cookies.token;
  if (token) {
    const jwtCookie = jwt.verify(token, "secret");
    const user = await userModel.findOne({
      username: jwtCookie.username,
    });
    if (user) {
      const isPass = bcrypt.compare(jwtCookie.password, user.password);
      if (isPass) {
        return res.redirect(`/profile/${jwtCookie.username}`);
      }
    }
  }
  res.render("signin", { message: "Enter Your Login Details" });
});

app.get("/profile/:username", async (req, res) => {
  const user = await userModel.findOne({ username: req.params.username });
  res.send(user);
});
app.get("/signup", (req, res) => {
  res.render("signup", { message: "" });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/signin");
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const token = jwt.sign({ username, password }, "secret");
  res.cookie("token", token);
  const jwtCookie = jwt.verify(token, "secret");
  const user = await userModel.findOne({ username });
  if (user == null) {
    res.render("signin", { message: "username/password error" });
  } else {
    const isPass = bcrypt.compare(password, jwtCookie.password);
    if (isPass) {
      res.render("profile", { username, password });
    }
  }
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (user == null) {
    bcrypt.hash("a", 10, async function (err, hash) {
      await userModel.create({ username, password: hash });
    });
    const token = jwt.sign({ username, password }, "secret");
    res.cookie("token", token);
    res.render("signin", { message: "Re-enter Login Details" });
  } else {
    res.render("signup", { message: "Username Already Taken" });
  }
});

app.listen(port, () => {
  console.log("Listen on port " + port)
});
