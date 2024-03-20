const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  mail: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  pswd: {
    type: String,
  },
  gender: {
    type: String,
  },
  cart: {
    type: Array,
  },
  wishlist: {
    type: Array,
  },
  address: {
    type: Array,
  },
  orders: {
    type: Array,
  },
});

module.exports = mongoose.model("User", userSchema);
