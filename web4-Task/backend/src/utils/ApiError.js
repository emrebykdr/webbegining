/**
 * Özel API Hata Sınıfı
 * Tüm operasyonel hataların temel sınıfı
 */
class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 400 - Validasyon Hatası
 * Form alanları, veri tipleri, zorunlu alanlar için
 */
class ValidationError extends ApiError {
    constructor(message = 'Validasyon hatası', errors = []) {
        super(message, 400);
        this.name = 'CustomValidationError';
        this.errors = errors;
    }
}

/**
 * 404 - Kaynak Bulunamadı
 * Veritabanında olmayan kayıtlar için
 */
class NotFoundError extends ApiError {
    constructor(resource = 'Kaynak', id = '') {
        const msg = id ? `${resource} bulunamadı (ID: ${id})` : `${resource} bulunamadı`;
        super(msg, 404);
        this.name = 'NotFoundError';
    }
}

/**
 * 401 - Kimlik Doğrulama Hatası
 * Giriş başarısız, token geçersiz/süresi dolmuş
 */
class AuthenticationError extends ApiError {
    constructor(message = 'Kimlik doğrulama başarısız. Lütfen giriş yapın.') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

/**
 * 403 - Yetkilendirme Hatası
 * Yetkisiz erişim denemeleri için
 */
class AuthorizationError extends ApiError {
    constructor(message = 'Bu işlem için yetkiniz bulunmamaktadır.') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

/**
 * 409 - Çakışma / Tekil Anahtar Hatası
 * Duplicate email, unique field violations
 */
class DuplicateKeyError extends ApiError {
    constructor(field = 'alan') {
        super(`Bu ${field} zaten kullanımda. Lütfen farklı bir ${field} deneyin.`, 409);
        this.name = 'DuplicateKeyError';
    }
}

/**
 * 429 - Çok Fazla İstek
 * Rate limiting aşıldığında
 */
class RateLimitError extends ApiError {
    constructor(message = 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.') {
        super(message, 429);
        this.name = 'RateLimitError';
    }
}

module.exports = {
    ApiError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    DuplicateKeyError,
    RateLimitError,
};
