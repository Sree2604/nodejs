const express = require("express");
// import BestSeller from "../models/bestSeller";
const BestSeller = require("../models/bestSeller");

const router = express.Router();

router.post("/:productId", async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product's bestseller status
    product.bestseller = !product.bestseller; // Toggle the bestseller status

    await product.save();

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const bestsellers = await Products.find({ bestseller: true });

    if (bestsellers.length === 0) {
      return res.json([]); // Return an empty array if there are no bestsellers
    }

    res.json(bestsellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
