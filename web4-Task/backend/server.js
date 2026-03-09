require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const taskRoutes = require('./src/routes/task.routes');
const authRoutes = require('./src/routes/auth.routes');
const errorMiddleware = require('./src/middlewares/error.middleware');
const { ApiError } = require('./src/utils/ApiError');

const app = express();

// Güvenlik Middleware'leri
app.use(helmet());
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100,
    message: {
        status: 'fail',
        message: 'Çok fazla istek gönderildi. 15 dakika sonra tekrar deneyin.'
    }
});
app.use('/api', limiter);

// Auth için ayrı rate limiter (daha sıkı)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        status: 'fail',
        message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.'
    }
});
app.use('/api/auth', authLimiter);

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server çalışıyor',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.all('*', (req, res, next) => {
    next(new ApiError(`${req.originalUrl} endpoint'i bulunamadı`, 404));
});

// Global Error Handler (en sonda!)
app.use(errorMiddleware);

// Server'ı başlat
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server port ${PORT}'da çalışıyor`);
        console.log(`📝 API: http://localhost:${PORT}/api`);
        console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
        console.log(`📋 Tasks: http://localhost:${PORT}/api/tasks`);
    });
});
