const Listing = require("../models/listing");
const User = require("../models/user");
const { listingsSchema } = require("../schema");
const mapToken = process.env.MAP_TOKEN;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const cloudinary = require("../cloudConfig.js");

module.exports.showAllListings = async (req, res) => {
  let { field, tag } = req.query;
  let allListings = [];
  if (!field && tag) {
    // console.log(tag);
    allListings = await Listing.find({
      $or: [
        { country: { $regex: tag, $options: "i" } }, // Case-insensitive search for country
        { location: { $regex: tag, $options: "i" } }, // Case-insensitive search for location
        { tags: { $regex: tag, $options: "i" } },
        { title: { $regex: tag, $options: "i" } }, // Case-insensitive search for tag
      ],
    });
  } else if (field) {
    allListings = await Listing.find({ tags: { $regex: tag, $options: "i" } });
  } else {
    allListings = await Listing.find();
  }

  // let allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.createLisitingForm = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
  const locResponse = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  console.log(locResponse.body.features[0]);
  //   res.send(locResponse.body.features[0].geometry);
  console.log(req.file);
  //   res.send(req.file);
  const filename = req.file.filename;
  const url = req.file.path;
  let result = listingsSchema.validate(req.body);
  console.log(result);
  if (result.error) {
    throw new ExpressError(400, result.error);
  }
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = locResponse.body.features[0].geometry;
  const savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created!");
  res.redirect(`/listings/${savedListing._id}`);
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner")
    .populate({ path: "renters.renterId" });
  // console.log(listing);
  if (!listing) {
    req.flash("error", "Listing you requestd for does not exist");
    res.redirect("/listings");
  } else {
    res.render("./listings/show.ejs", { listing });
  }
};

module.exports.editListingForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  } else {
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  }
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  // let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  let listing = await Listing.findById(id);
  console.log(listing);
  // Handle tags (convert comma-separated string to an array of strings)
  if (req.body.listing.tags) {
    let tags = req.body.listing.tags.split(",").map((tag) => tag.trim());
    listing.tags = tags; // Assign the parsed tags to the listing object
  }

  // Update other fields
  listing = Object.assign(listing, req.body.listing);
  const locResponse = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  if (typeof req.file !== "undefined") {
    const filename = req.file.filename;
    const url = req.file.path;
    listing.image = { url, filename };
    await listing.save();
  }
  listing.geometry = locResponse.body.features[0].geometry;

  const savedListing = await listing.save();
  console.log(savedListing);
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted !");
  res.redirect("/listings");
};

module.exports.bookListing = async (req, res) => {
  try {
    const { listingId, renterId, fromDate, toDate, days, rentAmount } =
      req.body;

    const validDate =
      new Date(fromDate) > Date.now() && new Date(fromDate) < new Date(toDate);
    if (!validDate) {
      console.log("Invalid date range");
      req.flash("error", "Invalid date range");
      return res.redirect(`/listings/${listingId}`);
    }
    // Validate Listing and Renter
    const listing = await Listing.findById(listingId);
    const renter = await User.findById(renterId);
    if (!listing || !renter) {
      req.flash("error", "Invalid listing or renter");
      return res.redirect(`/listings/${listingId}`);
    }

    // Create new renter entry
    const newRenter = {
      renterId,
      duration: { from: new Date(fromDate), to: new Date(toDate), days: days },
      rent: rentAmount,
    };

    const bookedListing = {
      listingId,
      duration: { from: new Date(fromDate), to: new Date(toDate), days: days },
      rent: rentAmount,
    };

    // Push to "renters" array and save
    listing.renters.push(newRenter);
    renter.myBookings.push(bookedListing);
    await listing.save();
    await renter.save();

    req.flash("success", "Booking successful!");
    res.redirect(`/listings/${listingId}`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong.");
    res.redirect("/listings");
  }
};
