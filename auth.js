const jwt = require('jsonwebtoken');
const userModel = require('./models/user')
const bcrypt = require('bcrypt');
const isAuthorised = async (req, res, next) => {
  const token = req.cookies.token || null;

  if (token) {
    const { username, password } = jwt.verify(token, "secret");
    const user = await userModel.findOne({
      username,
    });
    if (user) {
      const isPass = await bcrypt.compare(password, user.password);
      req.data = { user: user, isAuthorised: isPass };
      if (isPass) {
        return next();
      }
    }
  }
  res.redirect("/user/login");
};

module.exports = { isAuthorised };
