const Listing = require("../models/listing");
const User = require("../models/user");
const cloudinary = require("cloudinary").v2;

module.exports.showProfile = async (req, res) => {
  let { q } = req.query;
  if (q === "my-bookings") {
    try {
      const { username } = req.params;
      const userDetails = await User.findOne({ username })
        .populate({
          path: "myBookings.listingId", // Populate listing details
        })
        .lean();
      if (!userDetails) {
        return res.status(404).send("User not found");
      }
      // console.log(userDetails);

      res.render("profile/bookings.ejs", { userDetails });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
  // console.log("req for profile");
  try {
    const { username } = req.params;
    const userDetails = await User.findOne({ username });
    if (!userDetails) {
      return res.status(404).send("User not found");
    }
    // console.log(userDetails);
    const userListings = await Listing.find({ owner: userDetails._id });
    res.render("profile/profile.ejs", { userDetails, userListings });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.renderEditProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const userDetails = await User.findOne({ username });
    if (!userDetails) {
      return res.status(404).send("User not found");
    }
    // console.log(userDetails);
    const userListings = await Listing.find({ owner: userDetails._id });
    res.render("profile/editProfile.ejs", { userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const updateData = req.body.user || {};
    // console.log("New data: \n" + JSON.stringify(req.body.user));
    let updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    const oldFilename = updatedUser.profileImage.filename;
    if (typeof req.file !== "undefined") {
      const filename = req.file.filename;
      const url = req.file.path;
      updatedUser.profileImage = { url, filename };
      await updatedUser.save();
      if (
        oldFilename &&
        updatedUser.profileImage &&
        updatedUser.profileImage.filename &&
        updatedUser.profileImage.filename != oldFilename
      ) {
        await cloudinary.uploader.destroy(oldFilename);
        console.log("old file with fileneme: " + oldFilename + " deleted)");
      }
    }
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    console.log("User" + username + "updated\n" + updatedUser);
    res.redirect(`/profile/${username}`);
    // let userData = await User.findOne({ username });
    // console.log(userData);
    // res.send(userData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
