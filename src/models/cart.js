const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
