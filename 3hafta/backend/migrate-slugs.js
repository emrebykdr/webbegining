require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');

async function migrateSlugs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogdb');
        console.log('MongoDB bağlantısı başarılı');

        const posts = await Post.find({ $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }] });
        console.log(`${posts.length} yazı slug\'a ihtiyaç duyuyor...`);

        for (const post of posts) {
            post.slug = post.title
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
            await post.save();
            console.log(`  ✅ "${post.title}" → ${post.slug}`);
        }

        console.log('Migrasyon tamamlandı!');
        process.exit(0);
    } catch (error) {
        console.error('Hata:', error.message);
        process.exit(1);
    }
}

migrateSlugs();
