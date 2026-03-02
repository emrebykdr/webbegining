const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Kategori adı gereklidir'],
        unique: true,
        trim: true,
        maxlength: [50, 'Kategori adı en fazla 50 karakter olabilir']
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    description: {
        type: String,
        maxlength: [200, 'Açıklama en fazla 200 karakter olabilir'],
        default: ''
    }
}, {
    timestamps: true
});

categorySchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
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
            .trim();
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
