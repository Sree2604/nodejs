const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema({
  photo: {
    type: String,
    required: true,
  },
  mobile: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Carousel", carouselSchema);
