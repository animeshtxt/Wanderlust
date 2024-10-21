const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
        country: String
    }
);

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;