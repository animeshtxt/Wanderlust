const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listings.js");
const reviews = require("./routes/reviews.js");
const session = require("express-session");
const flash = require("connect-flash");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"

const sessionOptions = {
    secret: "mysupersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

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