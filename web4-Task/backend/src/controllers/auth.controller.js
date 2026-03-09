const User = require('../models/User.model');
const { generateToken } = require('../config/jwt');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError, AuthenticationError, DuplicateKeyError } = require('../utils/ApiError');

/**
 * @desc    Kullanıcı kaydı
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Şifre güçlülük kontrolü
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new ValidationError(
            'Şifre en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir.',
            [{ field: 'password', message: 'Şifre yeterince güçlü değil' }]
        );
    }

    // Email zaten kayıtlı mı?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new DuplicateKeyError('email');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
        status: 'success',
        message: 'Kayıt başarılı! Hoş geldiniz.',
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        }
    });
});

/**
 * @desc    Kullanıcı girişi
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Email ve şifre gönderildi mi?
    if (!email || !password) {
        throw new ValidationError(
            'Email ve şifre zorunludur.',
            [
                ...(!email ? [{ field: 'email', message: 'Email adresi zorunludur' }] : []),
                ...(!password ? [{ field: 'password', message: 'Şifre zorunludur' }] : []),
            ]
        );
    }

    // Kullanıcıyı bul (password dahil)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new AuthenticationError('Email veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
    }

    // Hesap aktif mi?
    if (!user.isActive) {
        throw new AuthenticationError('Hesabınız devre dışı bırakılmış. Yönetici ile iletişime geçin.');
    }

    // Şifre doğrulama
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new AuthenticationError('Email veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
    }

    // Son giriş zamanını güncelle
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
        status: 'success',
        message: 'Giriş başarılı!',
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        }
    });
});

/**
 * @desc    Mevcut kullanıcı bilgisi
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                createdAt: req.user.createdAt,
                lastLogin: req.user.lastLogin,
            }
        }
    });
});
