const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingsSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


main()
.then((res) => {
    console.log("connected to db");
})
.catch((err) => {
    console.log(err)
});

async function main() {
    await mongoose.connect(MONGO_URL);
};

const validateListing = (req, res, next) => {
    let {error} = listingsSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
}

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
}




app.get("/",  (req, res) => {
    res.send("Hello I am root");
});

app.get("/testListing", wrapAsync( async (req, res) => {
    let sampleListing = new Listing ({
        title: "My New Villa",
        description: "By the beach",
        price: 1200,
        location: "Calangute, Goa",
        country: "India",
    });

    await sampleListing.save();
    console.log("sample was saved");
    res.send("Successful testing");
}));

app.get("/listings", wrapAsync( async(req, res) => {
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
   
    // console.log(allListings);
}));


app.get("/listings/new", (req, res) => {
    res.render("./listings/new.ejs")
});

app.get("/listings/:id", wrapAsync( async(req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", {listing});
}));


// CREATE ROUTE
app.post("/listings/new", wrapAsync( async (req, res) => {
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

app.get("/listings/:id/edit", wrapAsync( async (req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , {listing});
}));


app.put("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing, "image.url": req.body.listing["image.url"]});
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id" ,wrapAsync( async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// Reviews
// Post Route

app.post("/listings/:id/review", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${req.params.id}`);

}));

// Delete review

app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res)=>{
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found !"));
})

app.use((err, req, res, next)=> {
    let {statusCode=500, message="something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs", {message});
})


app.listen(3000, () => {
    console.log("server is listening to port 3000");
});