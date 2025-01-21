const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingsSchema, reviewSchema} = require("../schema.js");
const {isLoggedIn} = require("../middleware.js");
const validateListing = (req, res, next) => {
    let {error} = listingsSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
}

router.get("/", wrapAsync( async(req, res) => {
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
   
    // console.log(allListings);
}));


router.get("/new", isLoggedIn,(req, res) => {
    res.render("./listings/new.ejs")
});

router.get("/:id", wrapAsync( async(req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", "Listing you requestd for does not exist");
        res.redirect("/listings");
    }else{
        res.render("./listings/show.ejs", {listing});
    }
    
}));


// CREATE ROUTE
router.post("/new", isLoggedIn, validateListing, wrapAsync( async (req, res) => {
    // console.log(req.body);
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid listing data");
    // }
    let result = listingsSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400, result.error );
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

router.get("/:id/edit", isLoggedIn, wrapAsync( async (req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }else{
        res.render("listings/edit.ejs" , {listing});
    }
   
}));


router.put("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing, "image.url": req.body.listing["image.url"]});
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

router.delete("/:id" , isLoggedIn, wrapAsync( async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings");
}));

module.exports = router;