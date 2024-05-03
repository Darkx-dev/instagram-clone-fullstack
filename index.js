const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();
const userModel = require("./models/usermodel");
// const { isAuthorised } = require("./auth");
const port = 8080;

// Functions for protected routes
const isAuthorised = async (req, res, next) => {
  const token = req.cookies.token || null;

  if (token != null) {
    const { username, password } = jwt.verify(token, "secret");
    const user = await userModel.findOne({
      username,
    });
    if (user) {
      const isPass = await bcrypt.compare(password, user.password);
      if (isPass) {
        req.user = { username, password };
        next();
        return;
      } else {
        res.send("negga");
        return;
      }
    }
  } else if (req.url == "/signin") {
    next();
    return;
  }

  res.redirect("/signin");
};

// const isAuthorisedToUpload = async (req, res, next) => {
//   const token = req.cookies.token || null;
//   if (token) {
//     const { username, password } = jwt.verify(token, "secret");
//     const user = await userModel.findOne({
//       username,
//     });
//     if (user) {
//       const isPass = await bcrypt.compare(password, user.password);
//       if (isPass) {
//         next();
//         return;
//       } else {
//         res.send("negga die!");
//         return;
//       }
//     }
//   }
// }

app.set("view engine", "ejs");

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/signin");
});

app.get("/signin", isAuthorised, async (req, res) => {
  if (req.user) {
    const user = await userModel.findOne({ username: req.user.username });
    res.redirect(`/profile/${user.username}`);
    return;
  }
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
  const token = jwt.sign({ username, password }, "secret");
  if (token) {
    const jwtCookie = jwt.verify(token, "secret");
    const user = await userModel.findOne({ username });
    if (user) {
      const isPass = await bcrypt.compare(jwtCookie.password, user.password);
      if (isPass) {
        res.cookie("token", token);
        res.redirect(`/profile/${jwtCookie.username}`);
        return;
      }
    }
  }
  res.status(404).render("signin", { message: "Invalid Login Details" });
});

app.post("/signup", async (req, res) => {
  // res.connection.setTimeout(0);
  const { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (!user) {
    if (username != "" && password != "") {
      const token = jwt.sign({ username, password }, "secret");
      res.cookie("token", token);
      bcrypt.hash(password, 10, async function (err, hash) {
        await userModel.create({ username, password: hash });
      });
      res.redirect(`/profile/${username}`);
    } else {
      res.render("signup", {
        message: "username/passowrd cannot be blank",
      });
      return;
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
