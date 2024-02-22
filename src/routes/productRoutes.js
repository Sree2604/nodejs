const express = require("express");
const Products = require("../models/products");
const Carousel = require("../models/carousel");
const Bestseller = require("../models/bestSeller");
const multer = require("multer");
const path = require("path");

const router = express.Router();

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

const carouselUpload = multer({ storage: carouselStorage });

const upload = multer({ storage: storage }).single("photo");

router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        console.error(err.message);
        return res.status(500).send("File upload error");
      }

      const { name, price, description, stock, rating, numOfRating } = req.body;

      if (
        !name ||
        !price ||
        !description ||
        !stock ||
        !price ||
        !rating ||
        !numOfRating
      ) {
        return res.status(400).send("Missing required fields");
      }

      const image = req.file.filename;

      const newProduct = new Products({
        name: name,
        price: price,
        photo: image,
        rating: rating,
        numOfRating: numOfRating,
        description: description,
        stock: stock,
      });

      const product = await Products.create(newProduct);
      return res.status(200).send(product);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Internal Server Error...!!");
    }
  });
});

router.post("/test", async (req, res) => {
  try {
    const { name, price, description, rating, image, numOfRating, stock } =
      req.body;

    if (
      !name ||
      !price ||
      !description ||
      !stock ||
      !price ||
      !image ||
      !rating ||
      !numOfRating
    ) {
      return res.status(400).send("Missing required fields");
    }

    const newProduct = new Products({
      name: name,
      price: price,
      photo: image,
      description: description,
      rating: rating,
      numOfRating: numOfRating,
      stock: stock,
    });

    const product = await Products.create(newProduct);
    return res.status(200).send(product);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error...!!");
  }
});
router.get("/", async (req, res) => {
  try {
    const products = await Products.find({});
    return res.status(200).json(products);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error...!!");
  }
});

router.get("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const product = await Products.findOne({ _id });

    if (!product) {
      return res.status(404).send("No products found...!!");
    }

    return res.status(200).json(product);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

router.put("/:_id", async (req, res) => {
  const { _id } = req.params;
  const { name, price, description, stock } = req.body;
  console.log(req.body);

  try {
    if (!name || !price || !description || !stock) {
      return res.status(400).json({ message: "Incomplete data" });
    }

    const product = await Products.findOne({ _id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const update = {
      name: name,
      price: price,
      description: description,
      stock: stock,
    };

    const updatedProduct = await Products.findByIdAndUpdate(_id, update);

    return res.status(200).json({ message: "Product updated", updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    await Products.deleteOne({ _id });
    return res.status(201).send("Product Deleted..!!");
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

router.post(
  "/addcarousels",
  carouselUpload.fields([
    { name: "carouselImage1", maxCount: 1 },
    { name: "carouselImage2", maxCount: 1 },
    { name: "carouselImage3", maxCount: 1 },
    { name: "carouselImage4", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const carouselImageName1 = req.files["carouselImage1"][0].filename;
      const carouselImageName2 = req.files["carouselImage2"][0].filename;
      const carouselImageName3 = req.files["carouselImage3"][0].filename;
      const carouselImageName4 = req.files["carouselImage4"][0].filename;

      const carouselInserts = [
        { photo: carouselImageName1 },
        { photo: carouselImageName2 },
        { photo: carouselImageName3 },
        { photo: carouselImageName4 },
      ];

      await Carousel.deleteMany({});

      try {
        await Carousel.create(carouselInserts);

        res.status(200).send("Images inserted successfully.");
      } catch (error) {
        res.status(500).send("Error inserting images.");
        console.error("Error inserting images:", error);
      }
    } catch (error) {
      res.status(500).send("Error processing request.");
      console.error("Error processing request:", error);
    }
  }
);

router.get("/admin/verify/:token", async (req, res) => {
  try {
    const { token } = req.params; // Extract token from request parameters
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify token using environment variable
    console.log(decoded); // Contains the decoded data
    res.status(200).json(decoded); // Return decoded data
  } catch (err) {
    console.error("Token not valid");
    res.status(401).json({ error: "Invalid token" }); // Return error response for invalid token
  }
});

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

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/bestsellers", async (req, res) => {
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
