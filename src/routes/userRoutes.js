const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, mail, phone, pswd } = req.body;

    if (!name || !mail || !phone || !pswd) {
      return res.status(400).json({
        message: "All required fields must be provided.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
      return res.status(400).json({
        message: "Invalid email format.",
      });
    }

    const hashedPassword = await bcrypt.hash(pswd, 10);

    const newUser = {
      name,
      mail,
      phone,
      pswd: hashedPassword,
    };

    const user = await User.create(newUser);

    return res.status(201).json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    let user;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findOne({ _id: identifier });
    } else {
      user = await User.findOne({ mail: identifier });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/admin/:secretKey", async (req, res) => {
  try {
    const { secretKey } = req.params;
    const token = jwt.sign({ userId: 123 }, secretKey, { expiresIn: "1h" });
    console.log(token);
    return res.status(200).send({ token: token });
  } catch (error) {
    console.err;
    return res.status(500).send("Internal Eerver Error");
  }
});

router.get("/admin/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decodedToken);
    const userId = decodedToken.userId;

    if (userId == 123) {
      console.log("User is authorized");
      return res
        .status(200)
        .json({ valid: true, message: "User is authorized" });
    } else {
      console.log("User is not authorized");
      return res
        .status(403)
        .json({ valid: false, message: "User is not authorized" });
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).send({ valid: false, error: "Invalid token" });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find({});

    return res.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
});

router.post("/cart", async (req, res) => {
  try {
    const { userId, product, quantity } = req.body;

    if (!userId || !product || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingCartItemIndex = user.cart.findIndex(
      (item) => item.product === product
    );

    if (existingCartItemIndex !== -1) {
      const existingCartItem = user.cart[existingCartItemIndex];
      console.log("Updating existing item:", existingCartItem);

      existingCartItem.quantity =
        parseInt(existingCartItem.quantity) + parseInt(quantity);
      user.cart.splice(existingCartItemIndex, 1);
      user.cart.push(existingCartItem);
    } else {
      const cartItem = new Cart({ product, quantity });
      user.cart.push(cartItem);
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/cart", async (req, res) => {
  try {
    const { userId, product } = req.body;

    if (!userId || !product) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingCartItemIndex = user.cart.findIndex(
      (item) => item.product === product
    );

    if (existingCartItemIndex !== -1) {
      user.cart.splice(existingCartItemIndex, 1);
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Product deleted from cart successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/wishlist", async (req, res) => {
  try {
    const { userId, product } = req.body;

    if (!userId || !product) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingWishlistItemIndex = user.wishlist.findIndex(
      (item) => item.product === product
    );

    if (existingWishlistItemIndex !== -1) {
      const existingWishlistItem = user.wishlist[existingWishlistItemIndex];
      console.log("Updating existing item:", existingWishlistItem);

      user.wishlist.splice(existingWishlistItemIndex, 1);
      user.wishlist.push(existingWishlistItem);
    } else {
      const wishlistItem = new Wishlist({ product });
      user.wishlist.push(wishlistItem);
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Product added to wishlist successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/wishlist", async (req, res) => {
  try {
    const { userId, product } = req.body;

    if (!userId || !product) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingWishlistItemIndex = user.wishlist.findIndex(
      (item) => item.product === product
    );

    if (existingWishlistItemIndex !== -1) {
      user.wishlist.splice(existingWishlistItemIndex, 1);
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Product deleted from wishlist successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
