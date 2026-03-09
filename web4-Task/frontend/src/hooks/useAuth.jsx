import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/api.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await authService.login({ email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            setUser(data.data.user);
            return data;
        } catch (err) {
            const errorData = err.response?.data;
            const message = errorData?.message || 'Giriş sırasında bir hata oluştu';
            const errors = errorData?.errors || [];
            setError({ message, errors });
            throw { message, errors };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await authService.register({ name, email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            setUser(data.data.user);
            return data;
        } catch (err) {
            const errorData = err.response?.data;
            const message = errorData?.message || 'Kayıt sırasında bir hata oluştu';
            const errors = errorData?.errors || [];
            setError({ message, errors });
            throw { message, errors };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            error,
            login,
            register,
            logout,
            clearError,
            isAuthenticated: !!user && !!token,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
