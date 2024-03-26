const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const router = express.Router();

// Mock admin credentials
const adminCredentials = {
  username: "admin",
  password: "$2b$10$qqb6qhJ0fJRrvjtbYFgoruIs/JDatcamvoifU5Qn.WSUhqDF/vSMG", // Hashed password: admin@123
};

// router.get("/:secretKey", async (req, res) => {
//   try {
//     const { secretKey } = req.params;
//     const token = jwt.sign({ userId: 123 }, secretKey, { expiresIn: "1h" });
//     console.log(token);
//     return res.status(200).send({ token: token });
//   } catch (error) {
//     console.err;
//     return res.status(500).send("Internal Eerver Error");
//   }
// });

router.get("/verify/:token", async (req, res) => {
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

router.post("/login", async (req, res) => {
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

module.exports = router;
