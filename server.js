const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const methodOverride = require("method-override");
const path = require("path");
const app = express();
const { isAuthorised } = require("./auth");
const { mkdir } = require("fs").promises;
const userModel = require("./models/user");
const postModel = require("./models/post");
const { readSubDirectories, deletePost } = require("./fs-functions");
const user = require("./models/user");
const port = 8080;

// Making Directories for each user before creating and setting up user.image path if not exists
const makeDirectories = async (req) => {
  if (!readSubDirectories("./public/users")) {
    const { _id } = req.data.user;
    await mkdir("public/users").catch((err) => {});
    if (!readSubDirectories(`./public/${_id}`)) {
      await mkdir(`./public/users/${_id}`).catch((err) => {});
      if (!readSubDirectories(`./public/${_id}/pfp`)) {
        await mkdir(`./public/users/${_id}/pfp`).catch((err) => {});
        if (!readSubDirectories(`./public/${_id}/posts`)) {
          await mkdir(`./public/users/${_id}/posts`).catch((err) => {});
        }
      }
    }
  }
};

app.set("view engine", "ejs");

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", isAuthorised, async (req, res) => {
  if (req.data.isAuthorised) {
    return res.redirect(`/${req.data.user.username}`);
  }
  res.redirect("/user/create");
});

app.get("/user/login", async (req, res) => {
  res.status(404).render("login", { message: "" });
});

app.get("/user/create", (req, res) => {
  res.render("register", { message: "" });
});

app.get("/:username", isAuthorised, async (req, res) => {
  if (req.data.isAuthorised) {
    if (req.params.username == req.data.user.username) {
      return res.render("profile", {
        user: await req.data.user.populate("posts"),
      });
    }
    return res.status(404).send("NIGGA YOU ARE NOT " + req.params.username);
  }
  res.redirect("/user/login");
});

app.get("/:username/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/user/login");
});

app.post("/user/login", async (req, res) => {
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

app.post("/user/create", async (req, res) => {
  // res.connection.setTimeout(0);
  const { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (!user) {
    if (username.length == 0 && password.length == 0) {
      return res.render("signup", {
        message: "username/passowrd cannot be blank",
      });
    }
    const token = jwt.sign({ username, password }, "secret");
    res.cookie("token", token);
    bcrypt.hash(password, 10, async function (err, hash) {
      await userModel.create({ username, password: hash });
    });
    return res.redirect(`/${username}`);
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
        return res.redirect(`/${req.data.user.username}/edit`);
      }
    );
  }
  res.send("error");
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
    await makeDirectories(req);

    const user = await userModel.findOne({ username: req.params.username });
    const post = await postModel.create({
      user: req.data.user._id,
      caption: req.body.caption,
    });
    user.posts.push(post._id);
    await user.save();

    const uploadedPost = req.files.uploadedPost;
    const imageExtention = uploadedPost.name.slice(
      uploadedPost.name.lastIndexOf("."),
      uploadedPost.name.name
    );
    // if (imageExtention != ".png" || imageExtention != ".jpg") {
    //   res.send("Unsupported image extention");
    // }

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

// Update user profile
app.patch("/:username/update", isAuthorised, async (req, res) => {
  if (req.data.isAuthorised) {
    const { gender, bio, age } = req.body;
    const user = await userModel.findOneAndUpdate(
      { username: req.params.username },
      { bio, age, gender }
    );
  }
  res.redirect(`/${req.data.user.username}`);
});

app.patch("/:username/posts/delete", isAuthorised, async (req, res) => {
  const post = await postModel.findOneAndDelete({ _id: req.body.postID });
  const user = await userModel.findOneAndUpdate(
    { username: req.params.username },
    { $pull: { posts: req.body.postID } }
  );
  deletePost(post._id, user._id, "./public/users");
  res.redirect(`/${req.params.username}`);
});

app.get("/:username/edit", isAuthorised, async (req, res) => {
  if (req.data.isAuthorised) {
    return res.render("edit", { user: req.data.user });
  }
  res.status(404).redirect("/user/login");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
