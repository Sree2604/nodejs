const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  mail: {
    type: String,
    required: true,
  },
  pswd: {
    type: String,
    required: true,
  },
  cart: {
    type: Array,
  },
  wishlist: {
    type: Array,
  },
  otp: {
    type: String,
  },
  otpExpiration: {
    type: Boolean,
  },
});

module.exports = mongoose.model("User", userSchema);
