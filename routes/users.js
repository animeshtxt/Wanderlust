const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userControllers = require("../controllers/users.js");

router
  .route("/signup")
  .get(userControllers.renderSignupForm)
  .post(wrapAsync(userControllers.signup));

router
  .route("/login")
  .get(userControllers.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userControllers.login
  );

router.get("/logout", userControllers.logout);

router
  .get("/forgotPw", userControllers.renderForgotPwForm)
  .put("/resetPw/:pwtoken", userControllers.updatePw);

module.exports = router;
