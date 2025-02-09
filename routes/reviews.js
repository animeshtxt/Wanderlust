const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const { listingsSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
  isRenter,
} = require("../middleware.js");
const reviewControllers = require("../controllers/reviews.js");

router.post(
  "/",
  isLoggedIn,
  isRenter,
  validateReview,
  wrapAsync(reviewControllers.createReview)
);

// Delete review

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewControllers.deleteReview)
);

module.exports = router;
