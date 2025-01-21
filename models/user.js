const { required } = require("joi");
const mongoose= require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
    // no need to define username and password field in schema as passportLocalMongoose will automatically implement them.
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
