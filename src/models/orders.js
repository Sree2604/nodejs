const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "address",
    required: true,
  },
  products: {
    type: Array,
    required: true,
  },
  date: {
    type: date,
    required: true,
  },
  paymentmethod: {
    type: String,
    required: true,
  },
  paymentDone: {
    type: Boolean,
    default: false,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("order", orderSchema);
