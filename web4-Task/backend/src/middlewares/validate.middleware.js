const { ValidationError } = require('../utils/ApiError');

/**
 * Request body validation middleware factory
 * Her endpoint için validate edilecek alanları belirler
 */
const validate = (schema) => {
    return (req, res, next) => {
        const errors = [];

        for (const field of schema) {
            const value = req.body[field.name];

            // Zorunlu alan kontrolü
            if (field.required && (value === undefined || value === null || value === '')) {
                errors.push({
                    field: field.name,
                    message: field.message || `${field.label || field.name} zorunludur`,
                });
                continue;
            }

            // Opsiyonel alan boşsa atla
            if (value === undefined || value === null || value === '') continue;

            // Tip kontrolü
            if (field.type === 'string' && typeof value !== 'string') {
                errors.push({
                    field: field.name,
                    message: `${field.label || field.name} metin olmalıdır`,
                });
            }

            // Minimum uzunluk
            if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
                errors.push({
                    field: field.name,
                    message: `${field.label || field.name} en az ${field.minLength} karakter olmalı`,
                });
            }

            // Maksimum uzunluk
            if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
                errors.push({
                    field: field.name,
                    message: `${field.label || field.name} en fazla ${field.maxLength} karakter olabilir`,
                });
            }

            // Email format kontrolü
            if (field.isEmail && typeof value === 'string') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors.push({
                        field: field.name,
                        message: 'Geçerli bir email adresi giriniz',
                    });
                }
            }

            // Enum kontrolü
            if (field.enum && !field.enum.includes(value)) {
                errors.push({
                    field: field.name,
                    message: `${field.label || field.name} geçersiz. Geçerli değerler: ${field.enum.join(', ')}`,
                });
            }
        }

        if (errors.length > 0) {
            const messages = errors.map(e => e.message).join('. ');
            const validationError = new ValidationError(`Validasyon hatası: ${messages}`, errors);
            return next(validationError);
        }

        next();
    };
};

// Önceden tanımlanmış validation şemaları
const schemas = {
    register: [
        { name: 'name', label: 'İsim', required: true, type: 'string', minLength: 2, maxLength: 50 },
        { name: 'email', label: 'Email', required: true, type: 'string', isEmail: true },
        { name: 'password', label: 'Şifre', required: true, type: 'string', minLength: 8 },
    ],
    login: [
        { name: 'email', label: 'Email', required: true, type: 'string', isEmail: true },
        { name: 'password', label: 'Şifre', required: true, type: 'string' },
    ],
    createTask: [
        { name: 'title', label: 'Başlık', required: true, type: 'string', minLength: 3, maxLength: 200 },
        { name: 'status', label: 'Durum', required: false, enum: ['todo', 'in-progress', 'done'] },
        { name: 'priority', label: 'Öncelik', required: false, enum: ['düşük', 'orta', 'yüksek', 'acil'] },
        { name: 'category', label: 'Kategori', required: false, enum: ['iş', 'kişisel', 'okul', 'sağlık', 'diğer'] },
    ],
    updateStatus: [
        { name: 'status', label: 'Durum', required: true, enum: ['todo', 'in-progress', 'done'] },
    ],
};

module.exports = { validate, schemas };
