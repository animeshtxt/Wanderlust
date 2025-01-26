const Listing = require("../models/listing");
const {listingsSchema} = require("../schema");

module.exports.showAllListings = async(req, res) => {
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
};


module.exports.createLisitingForm = (req, res) => {
    res.render("./listings/new.ejs")
};

module.exports.createListing = async (req, res) => {
    let result = listingsSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400, result.error );
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.showListing = async(req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    console.log(listing);
    if(!listing){
        req.flash("error", "Listing you requestd for does not exist");
        res.redirect("/listings");
    }else{
        res.render("./listings/show.ejs", {listing});
    }
    
};

module.exports.editListingForm = async (req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }else{
        res.render("listings/edit.ejs" , {listing});
    }
   
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing, "image.url": req.body.listing["image.url"]});
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings");
};