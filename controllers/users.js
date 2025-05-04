const user = require("../models/user");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    const { fullName, username, email, phone, password } = req.body;
    const newUser = new User({ fullName, email, phone, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      res.redirect(`/profile/${username}`);
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  let currUser = res.locals.currUser;
  if (currUser) {
    return res.redirect(`/profile/${currUser.username}`);
  }
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust !");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You have been logged out successfully !");
    res.redirect("/listings");
  });
};

module.exports.renderForgotPwForm = (req, res) => {
  res.render("users/forgotPw.ejs");
};

module.exports.updatePw = async (req, res) => {
  const { username, password, otp } = req.body;
  if (otp !== "123456") {
    req.flash("error", "Invalid OTP !");
    return res.redirect("/forgotPw");
  }

  try {
    let user = await User.findOne({ username: username });
    if (!user) {
      req.flash("error", "User not found !");
      res.redirect("/forgotPw");
      // console.log(pwtoken);
      // console.log(req.body.username);

      // console.log(user);
    } else {
      await user.setPassword(password);
      await user.save();
      req.flash("success", "Password reset successfull !");
      res.redirect("/login");
    }
  } catch (e) {
    res.send(e);
  }
};
