const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const adminControlSchema = new Schema({
  name: {
    type: String,
  },
  tags: {
    type: [String],
    required: false,
  },
});

const AdminControl = mongoose.model("AdminControl", adminControlSchema);
module.exports = AdminControl;
