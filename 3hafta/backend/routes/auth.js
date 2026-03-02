const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email
                    ? 'Bu e-posta adresi zaten kullanılıyor'
                    : 'Bu kullanıcı adı zaten kullanılıyor'
            });
        }

        const user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Kayıt başarılı',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'E-posta veya parola hatalı' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'E-posta veya parola hatalı' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Giriş başarılı',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    res.json({ user: req.user });
});

// PUT /api/auth/me/profile
router.put('/me/profile', auth, async (req, res) => {
    try {
        const { username, email, bio, avatar } = req.body;
        const user = req.user;

        if (username && username !== user.username) {
            const existing = await User.findOne({ username });
            if (existing) return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
            user.username = username;
        }
        if (email && email !== user.email) {
            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
            user.email = email;
        }
        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();
        res.json({ message: 'Profil güncellendi', user: user.toJSON() });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// PUT /api/auth/me/password
router.put('/me/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mevcut parola hatalı' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Yeni parola en az 6 karakter olmalıdır' });
        }

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Parola başarıyla değiştirildi' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// GET /api/auth/me/posts
router.get('/me/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
