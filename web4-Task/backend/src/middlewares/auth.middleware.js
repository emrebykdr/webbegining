const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const { AuthenticationError } = require('../utils/ApiError');

/**
 * JWT Token doğrulama middleware'i
 * Authorization: Bearer <token> header'ını kontrol eder
 */
exports.protect = asyncHandler(async (req, res, next) => {
    // 1) Token var mı?
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new AuthenticationError('Giriş yapmanız gerekiyor. Lütfen token gönderin.');
    }

    // 2) Token geçerli mi?
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new AuthenticationError('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        }
        throw new AuthenticationError('Geçersiz token. Lütfen tekrar giriş yapın.');
    }

    // 3) Kullanıcı hâlâ var mı?
    const user = await User.findById(decoded.id);
    if (!user) {
        throw new AuthenticationError('Bu token\'a ait kullanıcı artık mevcut değil.');
    }

    // 4) Kullanıcı aktif mi?
    if (!user.isActive) {
        throw new AuthenticationError('Hesabınız devre dışı bırakılmış. Yönetici ile iletişime geçin.');
    }

    // 5) Token'dan sonra şifre değişti mi?
    if (user.changedPasswordAfter(decoded.iat)) {
        throw new AuthenticationError('Şifreniz değiştirildi. Lütfen tekrar giriş yapın.');
    }

    req.user = user;
    next();
});

/**
 * Rol bazlı yetkilendirme middleware'i
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new AuthenticationError(
                `'${req.user.role}' rolü bu işlemi gerçekleştirme yetkisine sahip değil.`
            );
        }
        next();
    };
};
