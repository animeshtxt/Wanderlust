const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {
  saveRedirectUrl,
  isLoggedIn,
  isProfileOwner,
} = require("../middleware.js");
const userControllers = require("../controllers/profile.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/:username").get(wrapAsync(userControllers.showProfile));
router
  .route("/:username/edit")
  .get(wrapAsync(userControllers.renderEditProfile))
  .put(
    isProfileOwner,
    upload.single("user[profileImage]"),
    wrapAsync(userControllers.updateProfile)
  );

module.exports = router;
