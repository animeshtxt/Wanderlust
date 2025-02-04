const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  // no need to define username and password field in schema as passportLocalMongoose will automatically implement them.
  fullName: {
    type: String,
    // required: true,
    default: "Anonymous",
  },
  phone: {
    type: Number,
    default: 1234,
  },
  profileImage: {
    filename: {
      type: String,
    },
    url: {
      type: String,
      default:
        "https://res.cloudinary.com/dtyyfmfuo/image/upload/v1738689939/dummy_profile_image_rilqol.webp",
    },
    // public_id: {
    //   type: String,
    //   default: null,
    // },
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  address: {
    city: {
      type: String,
      // required: true,
      default: null,
    },
    country: {
      type: String,
      // required: true,
      default: null,
    },
    state: {
      type: String,
      // required: true,
      default: null,
    },
    pinCode: {
      type: Number,
      // required: true,
      default: null,
    },
  },
  about: {
    greeting: {
      type: String,
      default: "Hi, there!",
    },
    introduction: {
      type: String,
      default: null,
    },
    profession: {
      type: String,
      default: null,
    },
    languages: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
    instagramId: {
      type: String,
      default: null,
    },
    youtubeId: {
      type: String,
      default: null,
    },
    linkedinId: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
