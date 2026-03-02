const express = require('express');
const Category = require('../models/Category');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// POST /api/categories (admin)
router.post('/', auth, isAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;

        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: 'Bu kategori zaten mevcut' });
        }

        const category = new Category({ name, description });
        await category.save();

        res.status(201).json({ message: 'Kategori oluşturuldu', category });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// DELETE /api/categories/:id (admin)
router.delete('/:id', auth, isAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        res.json({ message: 'Kategori silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
