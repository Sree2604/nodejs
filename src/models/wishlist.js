const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  product: {
    type: String,
  },
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
