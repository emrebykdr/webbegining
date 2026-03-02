const express = require('express');
const Post = require('../models/Post');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts — list posts with filters & pagination
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 12, category, search, status = 'approved', author } = req.query;
        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (author) query.author = author;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { summary: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Post.countDocuments(query);
        const posts = await Post.find(query)
            .populate('author', 'username avatar')
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.json({
            posts,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// POST /api/posts — create new post
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, summary, coverImage, category } = req.body;

        const post = new Post({
            title,
            content,
            summary,
            coverImage,
            category: category || undefined,
            author: req.user._id,
            status: req.user.role === 'admin' ? 'approved' : 'pending'
        });

        await post.save();
        await post.populate('author', 'username avatar');
        await post.populate('category', 'name slug');

        res.status(201).json({ message: 'Yazı oluşturuldu', post });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// GET /api/posts/by-slug/:slug — get post by slug
router.get('/by-slug/:slug', async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug })
            .populate('author', 'username avatar bio')
            .populate('category', 'name slug');

        if (!post) {
            return res.status(404).json({ message: 'Yazı bulunamadı' });
        }

        res.json({ post });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// PUT /api/posts/:id — update post
router.put('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Yazı bulunamadı' });
        }

        // Only author or admin can edit
        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu yazıyı düzenleme yetkiniz yok' });
        }

        const { title, content, summary, coverImage, category } = req.body;
        if (title) post.title = title;
        if (content) post.content = content;
        if (summary !== undefined) post.summary = summary;
        if (coverImage !== undefined) post.coverImage = coverImage;
        if (category !== undefined) post.category = category || undefined;

        // Reset status to pending if non-admin edits
        if (req.user.role !== 'admin') {
            post.status = 'pending';
        }

        await post.save();
        await post.populate('author', 'username avatar');
        await post.populate('category', 'name slug');

        res.json({ message: 'Yazı güncellendi', post });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// DELETE /api/posts/:id — delete post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Yazı bulunamadı' });
        }

        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu yazıyı silme yetkiniz yok' });
        }

        await post.deleteOne();
        res.json({ message: 'Yazı silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// PUT /api/posts/:id/like — toggle like
router.put('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Yazı bulunamadı' });
        }

        const userId = req.user._id;
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.json({ message: likeIndex === -1 ? 'Beğenildi' : 'Beğeni kaldırıldı', likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// PUT /api/posts/:id/status — change post status (admin only)
router.put('/:id/status', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Geçersiz durum' });
        }

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('author', 'username avatar').populate('category', 'name slug');

        if (!post) {
            return res.status(404).json({ message: 'Yazı bulunamadı' });
        }

        res.json({ message: 'Yazı durumu güncellendi', post });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
