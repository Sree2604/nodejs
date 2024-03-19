const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const router = express.Router();

router.post("/google", async (req, res) => {
  try {
    const { name, mail } = req.body;

    if (!name || !mail) {
      return res.status(400).json({
        message: "All required fields must be provided.",
      });
    }

    const hashedPassword = await bcrypt.hash("asdf@1234", 10);

    const newUser = {
      name,
      mail,
      phone: "1234567890",
      pswd: hashedPassword,
    };

    const user = await User.create(newUser);

    return res.status(201).json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

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

router.put("/changepswd/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const newPswd = req.body.newPswd;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPswd, 10);
    user.pswd = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
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
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY); // Using the secretKey from environment variables
    console.log(decodedToken);
    const userId = decodedToken.username;

    if (userId == "admin") {
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
    return res.status(401).json({ valid: false, error: "Invalid token" });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find({});

    return res.status(200).json(users);
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

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in", // Zoho's SMTP server hostname
  port: 587, // Port number for SMTP (587 is commonly used for secure transmission)
  secure: false, // Indicates if the connection should use TLS (true for 465, false for 587)
  auth: {
    user: "contact@curellifoods.com", // SMTP username (your email address)
    pass: "Curellifoods@2023", // SMTP password
  },
});

async function sendOTP(email, otp, transporter) {
  const mailOptions = {
    from: "contact@curellifoods.com",
    to: email,
    subject: "Verification from Curelli",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve(success);
        }
      });
    });

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log(info);
          resolve(info);
        }
      });
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send OTP");
  }
}

router.post("/sendOTP", async (req, res) => {
  try {
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });
    await sendOTP(req.body.mail, otp, transporter); // Await sendOTP function
    res.json({ message: "OTP sent successfully", otp });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const secretKey = process.env.SECRET_KEY;

// Mock admin credentials
const adminCredentials = {
  username: "admin",
  password: "$2b$10$qqb6qhJ0fJRrvjtbYFgoruIs/JDatcamvoifU5Qn.WSUhqDF/vSMG", // Hashed password: admin@123
};

router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    console.log(await bcrypt.compare(password, adminCredentials.password));
    // Check if username and password are provided
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Check if the provided username exists and passwords match
    if (
      username === adminCredentials.username &&
      (await bcrypt.compare(password, adminCredentials.password))
    ) {
      // Generate JWT token
      const token = jwt.sign(
        { username: adminCredentials.username },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/edit/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    let userId;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      userId = await User.findOne({ _id: identifier });
    } else {
      userId = await User.findOne({ mail: identifier });
    }
    const updatedUserData = req.body;

    const user = await User.findByIdAndUpdate(userId, updatedUserData);

    res.json({
      success: true,
      message: "User information updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
