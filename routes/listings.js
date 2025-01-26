const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingsSchema, reviewSchema} = require("../schema.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingControllers = require("../controllers/listings.js");


router.get("/", wrapAsync(listingControllers.showAllListings));


router.get("/new", isLoggedIn,listingControllers.createLisitingForm);

router.get("/:id", wrapAsync( listingControllers.showListing));


// CREATE ROUTE
router.post("/new", isLoggedIn, validateListing, wrapAsync(listingControllers.createListing ));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync( listingControllers.editListingForm));


router.put("/:id", wrapAsync(listingControllers.updateListing));

router.delete("/:id", isLoggedIn, isOwner,  wrapAsync(listingControllers.destroyListing));

module.exports = router;