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
    console.error(error);
    return res.status(500).send("Internal Server Error");
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
    return res.status(401).json({ valid: false, error: "Invalid token" });
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

    // Your cart logic here

    return res
      .status(200)
      .json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Other routes...

// Create a nodemailer transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send OTP
async function sendOTP(email, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verification from Curelli",
      text: `Your OTP is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

router.post("/sendOTP", async (req, res) => {
  try {
    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // Find user by email and update OTP
    const user = await User.findOneAndUpdate(
      { mail: req.body.mail },
      { otp: otp },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send OTP
    await sendOTP(user.mail, user.otp);

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error generating or sending OTP: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/verify/:mail", async (req, res) => {
  try {
    const { otp } = req.body;
    const { mail } = req.params;

    const user = await User.findOne({ mail });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.otp === otp && user.otpExpire > Date.now()) {
      return res
        .status(200)
        .json({ message: "OTP verification completed...!" });
    } else {
      return res.status(400).json({ error: "Invalid OTP or OTP expired" });
    }
  } catch (error) {
    console.error("Error verifying OTP: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
