const express = require('express');
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Cart = require("../models/cart");

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, mail, phone, pswd } = req.body;

        if (!name || !mail || !phone || !pswd) {
            return res.status(400).send({
                message: 'All required fields must be provided.',
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mail)) {
            return res.status(400).send({
                message: 'Invalid email format.',
            });
        }
        console.log(req.body)
        const hashedPassword = await bcrypt.hash(pswd, 10);

        const newUser = {
            name,
            mail,
            phone,
            pswd: hashedPassword,
        };

        const user = await User.create(newUser);

        return res.status(201).send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.get('/:mail', async (req, res) => {
    try {
        const { mail } = req.params;
        const user = await User.findOne({ mail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.find({});

        return res.status(200).json({
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: error.message });
    }
});

router.post('/addTocart', async (req, res) => {
    try {
        const { userId, product, quantity } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingCartItemIndex = user.cart.findIndex(item => item.product == product);

        if (existingCartItemIndex !== -1) {
            const existingCartItem = user.cart[existingCartItemIndex];
            console.log('Updating existing item:', existingCartItem);

            existingCartItem.quantity = parseInt(existingCartItem.quantity) + parseInt(quantity);
            user.cart.splice(existingCartItemIndex,1);
            user.cart.push(existingCartItem)
        } else {
            const cartItem = new Cart({ product, quantity });
            user.cart.push(cartItem);
        }

        await user.save();

        return res.status(200).json({ message: 'Product added to cart successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/cart', async (req,res) => {
    try {
        const { userId, product } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingCartItemIndex = user.cart.findIndex(item => item.product == product);

        if (existingCartItemIndex !== -1) {
            user.cart.splice(existingCartItemIndex,1);
        }

        await user.save();

        return res.status(200).json({ message: 'Product deleted from cart successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;