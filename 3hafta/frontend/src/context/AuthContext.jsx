import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) {
            fetchUser()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me')
            setUser(res.data.user)
        } catch {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        const { token: newToken, user: userData } = res.data
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setToken(newToken)
        setUser(userData)
        return res.data
    }

    const register = async (username, email, password) => {
        const res = await api.post('/auth/register', { username, email, password })
        const { token: newToken, user: userData } = res.data
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setToken(newToken)
        setUser(userData)
        return res.data
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    const updateUser = (userData) => {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
