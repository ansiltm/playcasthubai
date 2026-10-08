const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a product (Admin)
router.post('/', async (req, res) => {
    try {
        const product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            stock: req.body.stock,
            imageUrl: req.body.imageUrl
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
