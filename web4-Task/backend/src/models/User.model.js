const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'İsim zorunludur'],
        trim: true,
        minlength: [2, 'İsim en az 2 karakter olmalı'],
        maxlength: [50, 'İsim en fazla 50 karakter olabilir'],
    },
    email: {
        type: String,
        required: [true, 'Email zorunludur'],
        unique: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'Geçerli bir email adresi giriniz'
        }
    },
    password: {
        type: String,
        required: [true, 'Şifre zorunludur'],
        minlength: [8, 'Şifre en az 8 karakter olmalı'],
        select: false,  // Sorgularda varsayılan olarak gelmez
    },
    role: {
        type: String,
        enum: { values: ['user', 'admin'], message: 'Geçersiz rol: {VALUE}' },
        default: 'user'
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
}, {
    timestamps: true,
});

// PRE-SAVE HOOK: Şifre değiştiğinde hash'le
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// METHOD: Şifre karşılaştırma
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// METHOD: JWT token'dan sonra şifre değişti mi?
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
    if (this.passwordChangedAt) {
        const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return jwtTimestamp < changedTime;
    }
    return false;
};

module.exports = mongoose.model('User', userSchema);
