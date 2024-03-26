const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  addressContact: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Address", addressSchema);
