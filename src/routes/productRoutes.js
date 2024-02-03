const express = require('express')
const Products = require('../models/products')
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Destination for product images
    },
    filename: function (req, file, cb) {
      // Generating a unique filename for uploaded product images
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage }).single('image'); // Use .single() instead of .array() or .fields()
  
  router.post('/', (req, res) => {
    upload(req, res, async (err) => {
      try {
        if (err) {
          // Handle multer error
          console.error(err.message);
          return res.status(500).send('File upload error');
        }
  
        const { name, price, description, stock } = req.body;
        const image = req.file.filename; // Use req.file.filename
        console.log(image);
  
        const newProduct = new Products({
          name: name,
          price: price,
          photo: image,
          description: description,
          stock: stock,
        });
  
        const product = await Products.create(newProduct);
        return res.status(200).send(product);
      } catch (error) {
        console.error(error.message);
        return res.status(500).send('Internal Server Error...!!');
      }
    });
  });
  

router.get('/', async (req, res) => {
    try {
        const products = await Products.find({});

        return res.status(200).json(products)
    } catch (error) {
        console.error(error.message);
        return res.status(404).send("Internal Server Error...!!")
    }
})

router.get('/:name', async (req, res) => {
    try {
        const { name } = req.params;

        const product = await Products.findOne({ name });

        if (!product) {
            res.status(300).send("No products found...!!")
        }

        return res.status(200).json(product)
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
})

router.delete('/:name', async (req, res) => {
    try {
        const { name } = req.params;

        await Products.deleteOne({ name });

        return res.status(201).send('Product Deleted..!!')
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
})

router.put('/:name', async (req, res) => {
    try {
        const { name } = req.params;

        Products.find
        const result = await Products.findOneAndUpdate({name}, req.body);

        if (!result) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).send({ message: 'Product updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
})

module.exports = router;