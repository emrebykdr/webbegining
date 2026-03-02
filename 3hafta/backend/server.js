require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files — serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Seed admin user on first run
const User = require('./models/User');
async function seedAdmin() {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const admin = new User({
                username: 'admin',
                email: 'admin@beublog.com',
                password: 'admin123',
                role: 'admin',
                bio: 'Blog yöneticisi'
            });
            await admin.save();
            console.log('👑 Admin hesabı oluşturuldu: admin@beublog.com / admin123');
        }
    } catch (err) {
        console.error('Admin oluşturma hatası:', err.message);
    }
}

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogdb')
    .then(async () => {
        console.log('✅ MongoDB bağlantısı başarılı');
        await seedAdmin();
        app.listen(PORT, () => {
            console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB bağlantı hatası:', err.message);
        process.exit(1);
    });
