import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    // Client-side validation
    const validateForm = () => {
        const errors = {};

        if (!name.trim()) {
            errors.name = 'İsim zorunludur';
        } else if (name.trim().length < 2) {
            errors.name = 'İsim en az 2 karakter olmalı';
        } else if (name.trim().length > 50) {
            errors.name = 'İsim en fazla 50 karakter olabilir';
        }

        if (!email.trim()) {
            errors.email = 'Email adresi zorunludur';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Geçerli bir email adresi giriniz';
        }

        if (!password) {
            errors.password = 'Şifre zorunludur';
        } else if (password.length < 8) {
            errors.password = 'Şifre en az 8 karakter olmalı';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            errors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Şifre tekrarı zorunludur';
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Şifreler eşleşmiyor';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);

        if (!validateForm()) return;

        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setApiError(err);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        if (!password) return { level: 0, text: '', color: '' };
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { level: score, text: 'Zayıf', color: 'var(--danger)' };
        if (score <= 4) return { level: score, text: 'Orta', color: 'var(--warning)' };
        return { level: score, text: 'Güçlü', color: 'var(--success)' };
    };

    const strength = getPasswordStrength();

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Kayıt Ol</h1>
                <p className="subtitle">Yeni hesap oluşturun</p>

                {apiError && (
                    <div className="alert alert-error">
                        <span className="alert-icon">❌</span>
                        <div className="alert-content">
                            <div className="alert-title">Kayıt Başarısız</div>
                            <div>{apiError.message}</div>
                            {apiError.errors && apiError.errors.length > 0 && (
                                <ul className="validation-errors">
                                    {apiError.errors.map((err, i) => (
                                        <li key={i}>{err.message}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="register-name">İsim</label>
                        <input
                            id="register-name"
                            type="text"
                            className={`form-input ${fieldErrors.name ? 'error' : ''}`}
                            placeholder="Adınız Soyadınız"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                        />
                        {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="register-email">Email</label>
                        <input
                            id="register-email"
                            type="email"
                            className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                        />
                        {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="register-password">Şifre</label>
                        <input
                            id="register-password"
                            type="password"
                            className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                            placeholder="En az 8 karakter"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                        />
                        {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
                        {password && (
                            <div className="mt-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${(strength.level / 6) * 100}%`,
                                        height: '100%',
                                        background: strength.color,
                                        borderRadius: '2px',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600 }}>
                                    {strength.text}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="register-confirm">Şifre Tekrarı</label>
                        <input
                            id="register-confirm"
                            type="password"
                            className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                            placeholder="Şifrenizi tekrar girin"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); }}
                        />
                        {fieldErrors.confirmPassword && <div className="form-error">{fieldErrors.confirmPassword}</div>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading}
                    >
                        {loading ? '⏳ Kayıt yapılıyor...' : '✨ Kayıt Ol'}
                    </button>
                </form>

                <div className="auth-footer">
                    Zaten hesabınız var mı? <Link to="/login">Giriş Yapın</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
