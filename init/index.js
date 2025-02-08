const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require("dotenv").config();
const mapToken = process.env.MAP_TOKEN;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const DB_URL = process.env.ATLAS_DB_URL;

main()
  .then((res) => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(DB_URL);
}

const assignLocation = async (place) => {
  let locResponse = await geocodingClient
    .forwardGeocode({
      query: place,
      limit: 1,
    })
    .send();

  return locResponse.body.features[0].geometry;
};

const initDB = async () => {
  await Listing.deleteMany({});
  const updatedData = await Promise.all(
    initData.data.map(async (obj) => ({
      ...obj,
      tags: ["beach"],
      // geometry: await assignLocation(obj.location) // Use `obj.location`, assuming it holds the place name
    }))
  );
  await Listing.insertMany(updatedData);
  console.log("Data was initialised");
};

initDB();
