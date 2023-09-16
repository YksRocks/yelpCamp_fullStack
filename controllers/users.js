const express = require("express");
const app = express();
const User = require("../models/user");
var cookieParser = require("cookie-parser");
app.use(cookieParser("thisismysecret"));

module.exports.renderRegister = (req, res) => {
  console.log(req.session);
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registerUser = await User.register(user, password);
    console.log(req.session);
    req.login(registerUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to campgrounds");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
  //   console.log(registerUser);
};

module.exports.renderLogin = (req, res) => {
  // console.log(req.cookies.returnTo);
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "welcome back!");
  const { returnTo } = req.cookies;
  const redirectUrl = returnTo || "/campgrounds";
  // delete req.session.returnTo;
  res.clearCookie("returnTo");
  res.redirect(redirectUrl);
};

module.exports.logout = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "GoodBye!");
    res.redirect("/campgrounds");
  });
};
