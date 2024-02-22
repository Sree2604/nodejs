const express = require("express");
const Products = require("../models/products");
const Carousel = require("../models/carousel");
const Bestseller = require("../models/bestSeller");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Multer storage configurations
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const carouselStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/carousels");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Multer upload configurations
const upload = multer({ storage: storage }).single("photo");
const carouselUpload = multer({ storage: carouselStorage }).fields([
  { name: "carouselImage1", maxCount: 1 },
  { name: "carouselImage2", maxCount: 1 },
  { name: "carouselImage3", maxCount: 1 },
  { name: "carouselImage4", maxCount: 1 },
]);

// Create product
router.post("/", upload, async (req, res) => {
  try {
    // Check if file upload has error
    if (req.fileValidationError) {
      return res.status(400).send(req.fileValidationError);
    }

    const { name, price, description, stock, rating, numOfRating } = req.body;

    // Check for missing fields
    if (!name || !price || !description || !stock || !rating || !numOfRating) {
      return res.status(400).send("Missing required fields");
    }

    // Construct new product object
    const newProduct = new Products({
      name,
      price,
      photo: req.file.filename,
      rating,
      numOfRating,
      description,
      stock,
    });

    // Save product to database
    const product = await newProduct.save();

    return res.status(200).json(product);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error...!!");
  }
});

// Test route for creating product without file upload
router.post("/test", async (req, res) => {
  try {
    const { name, price, description, rating, image, numOfRating, stock } =
      req.body;

    if (
      !name ||
      !price ||
      !description ||
      !stock ||
      !image ||
      !rating ||
      !numOfRating
    ) {
      return res.status(400).send("Missing required fields");
    }

    const newProduct = new Products({
      name,
      price,
      photo: image,
      description,
      rating,
      numOfRating,
      stock,
    });

    const product = await newProduct.save();

    return res.status(200).json(product);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error...!!");
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Products.find({});
    return res.status(200).json(products);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error...!!");
  }
});

// Get product by ID
router.get("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const product = await Products.findById(_id);

    if (!product) {
      return res.status(404).send("No products found...!!");
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error...!!");
  }
});

// Update product by ID
router.put("/:_id", async (req, res) => {
  const { _id } = req.params;
  const { name, price, description, stock } = req.body;

  try {
    if (!name || !price || !description || !stock) {
      return res.status(400).json({ message: "Incomplete data" });
    }

    const product = await Products.findByIdAndUpdate(
      _id,
      { name, price, description, stock },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res
      .status(200)
      .json({ message: "Product updated", updatedProduct: product });
  } catch (error) {
    console.error("Error updating product:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Delete product by ID
router.delete("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    await Products.deleteOne({ _id });
    return res.status(204).send();
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error...!!");
  }
});

// Add carousel images
router.post("/addcarousels", carouselUpload, async (req, res) => {
  try {
    // Process uploaded carousel images
    // Your logic here

    return res.status(200).send("Images inserted successfully.");
  } catch (error) {
    console.error("Error inserting images:", error);
    return res.status(500).send("Internal Server Error...!!");
  }
});

// JWT token verification route
router.get("/admin/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decoded); // Contains the decoded data
    return res.status(200).json(decoded);
  } catch (err) {
    console.error("Token not valid");
    return res.status(401).send("Invalid token");
  }
});

// Toggle product bestseller status
router.post("/bestsellers/:productId", async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product's bestseller status
    product.bestseller = !product.bestseller; // Toggle the bestseller status

    await product.save();

    return res.status(204).end();
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: err.message });
  }
});

// Get bestseller products
router.get("/bestsellers", async (req, res) => {
  try {
    const bestsellers = await Products.find({ bestseller: true });

    if (bestsellers.length === 0) {
      return res.json([]); // Return an empty array if there are no bestsellers
    }

    res.json(bestsellers);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
