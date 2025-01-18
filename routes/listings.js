const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingsSchema, reviewSchema} = require("../schema.js");

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


router.get("/new", (req, res) => {
    res.render("./listings/new.ejs")
});

router.get("/:id", wrapAsync( async(req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", {listing});
}));


// CREATE ROUTE
router.post("/new", validateListing, wrapAsync( async (req, res) => {
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
    res.redirect("/listings");
}));

router.get("/:id/edit", wrapAsync( async (req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , {listing});
}));


router.put("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing, "image.url": req.body.listing["image.url"]});
    res.redirect(`/listings/${id}`);
}));

router.delete("/:id" ,wrapAsync( async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;