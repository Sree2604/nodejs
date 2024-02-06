const express = require("express");
const Products = require("../models/products");
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

const upload = multer({ storage: storage }).single("image");

router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        console.error(err.message);
        return res.status(500).send("File upload error");
      }

      const { name, price, description, stock } = req.body;

      if (!name || !price || !description || !stock || !price) {
        return res.status(400).send("Missing required fields");
      }

      const image = req.file.filename;

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
  try {
    const { _id } = req.params;
    const { name, price, description, stock } = req.body;
    const product = await Products.findOne({ _id });

    if (!product) {
      return res.status(404).send("No products found...!!");
    }

    const update = {
      name: name,
      price: price,
      description: description,
      stock: stock,
    };
    const updatedProduct = await Products.findByIdAndUpdate(_id, update);
    return res.status(201).send("Product Updated..!!");
  } catch (error) {}
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

router.put("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const result = await Products.findOneAndUpdate({ _id }, req.body);

    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).send({ message: "Product updated successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

module.exports = router;
