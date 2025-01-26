const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingControllers = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage});

router.get("/", wrapAsync(listingControllers.showAllListings));

router.route("/new")
.get(isLoggedIn,listingControllers.createLisitingForm)
.post(isLoggedIn,  upload.single('listing[image]'), validateListing,wrapAsync(listingControllers.createListing ));


router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync( listingControllers.editListingForm));

router.route("/:id")
  .get(wrapAsync( listingControllers.showListing))
  .put(wrapAsync(listingControllers.updateListing))
  .delete( isLoggedIn, isOwner,  wrapAsync(listingControllers.destroyListing));

module.exports = router;