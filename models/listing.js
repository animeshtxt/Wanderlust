const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");
const { valid, required } = require("joi");
const cloudinary = require("cloudinary").v2;
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: {
      type: String,
    },
    url: {
      type: String,
    },
    public_id: {
      type: String,
      default: null,
    },
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  tags: {
    type: [String],
    required: false,
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  renters: [
    {
      renterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference another collection (optional)
        required: true,
      },
      duration: {
        from: {
          type: Date,
        },
        to: {
          type: Date,
        },
        days: { type: Number },
      },
      rent: { type: Number },
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
    if (listing.image && listing.image.filename) {
      console.log("public_url : " + listing.image.filename);
      const public_id = listing.image.filename;
      const result = await cloudinary.uploader.destroy(public_id);
      console.log("Image with public_id " + public_id + "deleted/n" + result);
    }
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
