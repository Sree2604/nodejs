const express = require("express");
const Orders = require("../models/orders");
const User = require("../models/user");
const Products = require("../models/products");

const router = express.Router();
router.post("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { addressId, products, paymentmethod, totalPrice } = req.body;
    const d = new Date();

    const user = await User.findById(identifier);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.address.findIndex(
      (item) => item._id.toString() === addressId
    );
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    const productsList = await Promise.all(
      products.map(async (item) => {
        const product = await Products.findById(item);
        if (!product) {
          throw new Error(`Product with ID ${item} not found`);
        }
        return product;
      })
    );

    // Fetch the address separately using its ID
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const newOrder = new Orders({
      userId: identifier,
      address: address, // Pass the fetched address object
      products: productsList,
      date: d.toDateString(),
      paymentmethod: paymentmethod,
      paymentDone: "pending",
      delivered: false,
      totalPrice: totalPrice,
    });

    const order = await Orders.create(newOrder);

    res.status(200).json(order);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Orders.find({});

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { OrderId } = req.body;

    const user = await User.findById(identifier);
    const order = await Orders.findById(OrderId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const orderIndex = order.cart.findIndex((item) => item.product === product);

    if (orderIndex !== -1) {
      order.cart.splice(orderIndex, 1);
    }

    await order.save();

    return res
      .status(200)
      .json({ message: "Product deleted from cart successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
