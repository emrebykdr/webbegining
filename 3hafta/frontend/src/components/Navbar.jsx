import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Menu, X, PenSquare, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react'
import { useState } from 'react'

function Navbar() {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/')
        setMenuOpen(false)
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
                    <span className="brand-icon">B</span>
                    <span className="brand-text">BEUBlog</span>
                </Link>

                <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü">
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
                    <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Ana Sayfa</Link>

                    {user ? (
                        <>
                            <Link to="/yazi-olustur" className="nav-link" onClick={() => setMenuOpen(false)}>
                                <PenSquare size={18} />
                                <span>Yazı Oluştur</span>
                            </Link>
                            <Link to="/panel" className="nav-link" onClick={() => setMenuOpen(false)}>
                                <LayoutDashboard size={18} />
                                <span>Panel</span>
                            </Link>
                            <div className="nav-user">
                                <span className="nav-username">{user.username}</span>
                                {user.role === 'admin' && <span className="admin-badge">Admin</span>}
                                <button onClick={handleLogout} className="nav-btn logout-btn">
                                    <LogOut size={18} />
                                    <span>Çıkış</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="nav-auth">
                            <Link to="/giris" className="nav-btn login-btn" onClick={() => setMenuOpen(false)}>
                                <LogIn size={18} />
                                <span>Giriş</span>
                            </Link>
                            <Link to="/kayit" className="nav-btn register-btn" onClick={() => setMenuOpen(false)}>
                                <UserPlus size={18} />
                                <span>Kayıt Ol</span>
                            </Link>
                        </div>
                    )}

                    <button onClick={toggleTheme} className="theme-toggle" aria-label="Tema değiştir">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
