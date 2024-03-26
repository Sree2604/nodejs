const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  address: {
    type: Object,
    ref: "address",
    required: true,
  },
  products: {
    type: Array,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  paymentmethod: {
    type: String,
    required: true,
  },
  paymentDone: {
    type: String,
    default: false,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    default: "pending",
  },
});

module.exports = mongoose.model("order", orderSchema);
