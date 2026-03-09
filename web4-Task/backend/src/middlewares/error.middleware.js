const { ApiError, ValidationError, NotFoundError, AuthenticationError, DuplicateKeyError } = require('../utils/ApiError');

/**
 * Mongoose CastError → Okunabilir hata mesajı
 * Geçersiz ObjectId formatı gibi durumlar
 */
const handleCastError = (err) => {
    return new ApiError(`Geçersiz ${err.path}: ${err.value}. Lütfen geçerli bir değer girin.`, 400);
};

/**
 * MongoDB 11000 → Duplicate Key hatası
 * Unique field ihlalleri (email vb.)
 */
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return new DuplicateKeyError(field);
};

/**
 * Mongoose ValidationError → Detaylı validasyon hata mesajları
 */
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
    }));
    const messages = errors.map(e => e.message);
    const apiError = new ValidationError(`Validasyon hatası: ${messages.join('. ')}`, errors);
    return apiError;
};

/**
 * JWT geçersiz token hatası
 */
const handleJWTError = () =>
    new AuthenticationError('Geçersiz token. Lütfen tekrar giriş yapın.');

/**
 * JWT token süresi dolmuş hatası
 */
const handleJWTExpiredError = () =>
    new AuthenticationError('Oturum süresi doldu. Lütfen tekrar giriş yapın.');

/**
 * Global Error Handler Middleware
 * Tüm hataları yakalar ve uygun formatta döner
 */
module.exports = (err, req, res, next) => {
    let error = { ...err, message: err.message };
    error.statusCode = err.statusCode || 500;
    error.status = err.status || 'error';

    // Mongoose & JWT hatalarını dönüştür
    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Geliştirme ortamında detaylı hata bilgisi
    const response = {
        status: error.status || 'error',
        message: error.message || 'Sunucu hatası oluştu',
    };

    // ValidationError ise hata detaylarını ekle
    if (error.errors && Array.isArray(error.errors)) {
        response.errors = error.errors;
    }

    // Geliştirme ortamında stack trace ekle
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.originalError = err.name;
    }

    // 500 hataları logla (internal server errors)
    if (error.statusCode === 500) {
        console.error('💥 SUNUCU HATASI:', err);
    }

    res.status(error.statusCode).json(response);
};
