const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema (
    {
        title: {
            type: String,
            required: true,
        },
        description: String,
        image: {
            filename: {
              type: String,
              default: 'defaultImage', // Provide a default filename if needed
            },
            url: {
              type: String,
              default: "https://media.istockphoto.com/id/185321544/photo/beautiful-house-in-florida.jpg?s=2048x2048&w=is&k=20&c=dVUogz715qMWW3m4gDMIwfx9XjzaliKhbQLTNMyEYJI=",
              set: (v) => v === "" ? "https://media.istockphoto.com/id/185321544/photo/beautiful-house-in-florida.jpg?s=2048x2048&w=is&k=20&c=dVUogz715qMWW3m4gDMIwfx9XjzaliKhbQLTNMyEYJI=" : v,
            },
          }, 
        price: Number,
        location: String,
        country: String,
        reviews: [
          {
            type: Schema.Types.ObjectId,
            ref: "Review"
          }
        ]
    }
);

listingSchema.post("findOneAndDelete", async(listing) => {
  if(listing){
    await Review.deleteMany({_id : {$in : listing.reviews}})
  }
  
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;