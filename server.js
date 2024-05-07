const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();
const { mkdir } = require("fs").promises;
const userModel = require("./models/user");
const postModel = require("./models/post");
const port = 8080;

const makeDirectories = async (req) => {
  // Making Directories for each user before creating and setting up user.image path
  await mkdir("public/users").catch((err) => {});
  await mkdir(`public/users/${req.data.user._id}`).catch((err) => {});
  await mkdir(`public/users/${req.data.user._id}/pfp`).catch((err) => {});
  await mkdir(`public/users/${req.data.user._id}/posts`).catch((err) => {});
};
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
  res.redirect("/login");
};

app.set("view engine", "ejs");

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", isAuthorised, async (req, res) => {
  if (req.data.isAuthorised) {
    return res.redirect(`/${req.data.user.username}`);
  }
  res.redirect("/create");
});

app.get("/login", async (req, res) => {
  res.status(404).render("login", { message: "" });
});

app.get("/user/create", (req, res) => {
  
  res.render("register", { message: "sefe" });
});

app.get("/:username", isAuthorised, async (req, res) => {
  if (req.params.username == req.data.user.username) {
    res.render("profile", { user: req.data.user });
    return;
  }
  res.status(404).redirect("/login");
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
      return res.redirect(`/${username}`);
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
      res.redirect(`/${username}`);
    } else {
      return res.render("signup", {
        message: "username/passowrd cannot be blank",
      });
    }
  }
  res.render("register", { message: "Username Already Taken" });
});

//Upload Pfp----------------------------------------------------------------
app.post("/:username/upload", isAuthorised, fileUpload(), async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  let uploadedFile = req.files.uploadedFile;
  const imageExtention = uploadedFile.name.slice(
    uploadedFile.name.lastIndexOf("."),
    uploadedFile.name.name
  );
  
  await makeDirectories(req);
  
  if (imageExtention == ".png" || imageExtention == ".jpg") {
    // Uploading pfp to pfp directory
    return uploadedFile.mv(
      path.join(
        __dirname,
        `/public/users/${req.data.user._id}/pfp/${req.data.user._id}.png`
      ),
      async (err) => {
        if (err) return res.status(500).send(err);
        await userModel.findOneAndUpdate(
          { username: req.data.user.username },
          {
            image: `/static/users/${req.data.user._id}/pfp/${req.data.user._id}.png`,
          }
        );
        // res.send("OK")
        return res.redirect(`/${req.data.user.username}`);
      }
    );
  }
  res.send("error");
  // res.redirect(`/${req.data.user.username}`);
});

//Create a new post----------------------------------------------------------------
app.post(
  "/:username/posts/new",
  isAuthorised,
  fileUpload(),
  async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    await makeDirectories(req)

    const user = await userModel.findOne({username: req.params.username})
    console.log(user)
    const post = await postModel.create({
      user: req.data.user._id,
      caption: req.body.caption
    })
    user.posts.push(post._id)
    await user.save()

    let uploadedPost = req.files.uploadedPost
    uploadedPost.mv(
      path.join(
        __dirname,
        `/public/users/${req.data.user._id}/posts/${post._id}.png`
      ),
      async (err) => {
        if (err) return res.status(500).send(err);
      }
    );

    res.redirect(`/${req.data.user.username}`);
  }
);

app.get("/:username/edit", isAuthorised, async (req, res) => {
  if (req.data.isAuthorised) {
    return res.render("edit", { user: req.data.user });
  }
  res.status(404).redirect("/login");
});

app.listen(port, () => {});
