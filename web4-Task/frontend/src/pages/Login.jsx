import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    // Client-side validation
    const validateForm = () => {
        const errors = {};

        if (!email.trim()) {
            errors.email = 'Email adresi zorunludur';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Geçerli bir email adresi giriniz';
        }

        if (!password) {
            errors.password = 'Şifre zorunludur';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);

        if (!validateForm()) return;

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setApiError(err);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Görev Yöneticisi</h1>
                <p className="subtitle">Hesabınıza giriş yapın</p>

                {apiError && (
                    <div className="alert alert-error">
                        <span className="alert-icon">❌</span>
                        <div className="alert-content">
                            <div className="alert-title">Giriş Başarısız</div>
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
                        <label className="form-label" htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                        />
                        {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="login-password">Şifre</label>
                        <input
                            id="login-password"
                            type="password"
                            className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                        />
                        {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading}
                    >
                        {loading ? '⏳ Giriş yapılıyor...' : '🔐 Giriş Yap'}
                    </button>
                </form>

                <div className="auth-footer">
                    Hesabınız yok mu? <Link to="/register">Kayıt Olun</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
