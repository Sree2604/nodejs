const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
  },
  photo: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  categories: {
    type: Array,
    // required : true
  },
  stock: {
    type: Boolean,
    required: true,
  },
  offerPrice: {
    type: Number,
    // required  : true
  },
});

module.exports = mongoose.model("Products", productSchema);
