const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Başlık gereklidir'],
        trim: true,
        maxlength: [200, 'Başlık en fazla 200 karakter olabilir']
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    content: {
        type: String,
        required: [true, 'İçerik gereklidir']
    },
    summary: {
        type: String,
        maxlength: [500, 'Özet en fazla 500 karakter olabilir'],
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'suspended'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Generate slug from title before saving
postSchema.pre('save', function (next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[çÇ]/g, 'c')
            .replace(/[ğĞ]/g, 'g')
            .replace(/[ıİ]/g, 'i')
            .replace(/[öÖ]/g, 'o')
            .replace(/[şŞ]/g, 's')
            .replace(/[üÜ]/g, 'u')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() + '-' + Date.now().toString(36);
    }
    next();
});

module.exports = mongoose.model('Post', postSchema);
