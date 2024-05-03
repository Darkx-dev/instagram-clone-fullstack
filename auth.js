const jwt = require('jsonwebtoken');

const isAuthorised = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const { username, password } = jwt.verify(token, "secret");
    const user = userModel.findOne({
      username,
    });
    if (user) {
      const isPass = bcrypt.compare(password, user.password);
      if (isPass) {
        req.user = { username, password };
        next();
      } else {
        res.redirect("/signin");
      }
    }
  }
};

module.exports = {
  isAuthorised
};
