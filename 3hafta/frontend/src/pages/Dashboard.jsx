import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import {
    LayoutDashboard, FileText, Edit3, Trash2, Eye, Clock,
    CheckCircle, XCircle, PauseCircle, Plus, Tag, Shield,
    User as UserIcon, Mail, Save, Lock, AlertCircle
} from 'lucide-react'

function Dashboard() {
    const { user, updateUser } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('posts')
    const [myPosts, setMyPosts] = useState([])
    const [allPosts, setAllPosts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    // Profile form
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [bio, setBio] = useState('')
    const [profileMsg, setProfileMsg] = useState('')
    const [profileErr, setProfileErr] = useState('')

    // Password form
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [passwordMsg, setPasswordMsg] = useState('')
    const [passwordErr, setPasswordErr] = useState('')

    // Category form
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryDesc, setNewCategoryDesc] = useState('')
    const [categoryMsg, setCategoryMsg] = useState('')

    useEffect(() => {
        if (!user) {
            navigate('/giris')
            return
        }
        setUsername(user.username)
        setEmail(user.email)
        setBio(user.bio || '')
        fetchMyPosts()
        fetchCategories()
        if (user.role === 'admin') {
            fetchAllPosts()
        }
    }, [user])

    const fetchMyPosts = async () => {
        try {
            const res = await api.get('/auth/me/posts')
            setMyPosts(res.data.posts)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchAllPosts = async () => {
        try {
            const res = await api.get('/posts', { params: { status: '', limit: 100 } })
            setAllPosts(res.data.posts)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories')
            setCategories(res.data.categories)
        } catch (err) {
            console.error(err)
        }
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setProfileMsg('')
        setProfileErr('')
        try {
            const res = await api.put('/auth/me/profile', { username, email, bio })
            updateUser(res.data.user)
            setProfileMsg('Profil güncellendi')
        } catch (err) {
            setProfileErr(err.response?.data?.message || 'Hata oluştu')
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setPasswordMsg('')
        setPasswordErr('')
        try {
            await api.put('/auth/me/password', { currentPassword, newPassword })
            setPasswordMsg('Parola değiştirildi')
            setCurrentPassword('')
            setNewPassword('')
        } catch (err) {
            setPasswordErr(err.response?.data?.message || 'Hata oluştu')
        }
    }

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return
        try {
            await api.delete(`/posts/${postId}`)
            setMyPosts(prev => prev.filter(p => p._id !== postId))
            setAllPosts(prev => prev.filter(p => p._id !== postId))
        } catch (err) {
            alert(err.response?.data?.message || 'Silinemedi')
        }
    }

    const handleStatusChange = async (postId, status) => {
        try {
            await api.put(`/posts/${postId}/status`, { status })
            fetchAllPosts()
        } catch (err) {
            alert(err.response?.data?.message || 'Durum güncellenemedi')
        }
    }

    const handleAddCategory = async (e) => {
        e.preventDefault()
        setCategoryMsg('')
        try {
            await api.post('/categories', { name: newCategoryName, description: newCategoryDesc })
            setCategoryMsg('Kategori oluşturuldu')
            setNewCategoryName('')
            setNewCategoryDesc('')
            fetchCategories()
        } catch (err) {
            setCategoryMsg(err.response?.data?.message || 'Hata oluştu')
        }
    }

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Bu kategoriyi silmek istiyor musunuz?')) return
        try {
            await api.delete(`/categories/${id}`)
            fetchCategories()
        } catch (err) {
            alert(err.response?.data?.message || 'Silinemedi')
        }
    }

    const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })

    const statusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle size={16} className="status-approved" />
            case 'pending': return <Clock size={16} className="status-pending" />
            case 'suspended': return <XCircle size={16} className="status-suspended" />
            default: return null
        }
    }

    const statusText = (status) => {
        switch (status) {
            case 'approved': return 'Onaylandı'
            case 'pending': return 'Onay Bekliyor'
            case 'suspended': return 'Askıya Alındı'
            default: return status
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Panel yükleniyor...</p>
            </div>
        )
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1><LayoutDashboard size={28} /> Kontrol Paneli</h1>
                    <p>Hoş geldin, <strong>{user.username}</strong>!</p>
                </div>

                <div className="dashboard-tabs">
                    <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
                        <FileText size={18} /> Yazılarım
                    </button>
                    <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                        <UserIcon size={18} /> Profil
                    </button>
                    {user.role === 'admin' && (
                        <>
                            <button className={`tab-btn ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
                                <Shield size={18} /> Moderasyon
                            </button>
                            <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
                                <Tag size={18} /> Kategoriler
                            </button>
                        </>
                    )}
                </div>

                <div className="dashboard-content">
                    {/* My Posts Tab */}
                    {activeTab === 'posts' && (
                        <div className="tab-content">
                            <div className="tab-header">
                                <h2>Yazılarım ({myPosts.length})</h2>
                                <Link to="/yazi-olustur" className="btn btn-primary btn-sm">
                                    <Plus size={16} /> Yeni Yazı
                                </Link>
                            </div>
                            {myPosts.length === 0 ? (
                                <div className="empty-state">
                                    <FileText size={48} />
                                    <p>Henüz yazınız yok.</p>
                                    <Link to="/yazi-olustur" className="btn btn-primary">İlk Yazınızı Oluşturun</Link>
                                </div>
                            ) : (
                                <div className="posts-table">
                                    {myPosts.map(post => (
                                        <div key={post._id} className="post-row">
                                            <div className="post-row-info">
                                                <h3>{post.title}</h3>
                                                <div className="post-row-meta">
                                                    {statusIcon(post.status)}
                                                    <span>{statusText(post.status)}</span>
                                                    <span className="dot">·</span>
                                                    <span>{formatDate(post.createdAt)}</span>
                                                    {post.category && (
                                                        <>
                                                            <span className="dot">·</span>
                                                            <span>{post.category.name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="post-row-actions">
                                                <Link to={`/yazi/${post.slug}`} className="action-btn" title="Görüntüle"><Eye size={16} /></Link>
                                                <Link to={`/yazi-duzenle/${post.slug}`} className="action-btn" title="Düzenle"><Edit3 size={16} /></Link>
                                                <button onClick={() => handleDeletePost(post._id)} className="action-btn danger" title="Sil"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="tab-content">
                            <h2>Profil Ayarları</h2>

                            {profileMsg && <div className="alert alert-success"><CheckCircle size={18} /><span>{profileMsg}</span></div>}
                            {profileErr && <div className="alert alert-error"><AlertCircle size={18} /><span>{profileErr}</span></div>}

                            <form onSubmit={handleProfileUpdate} className="profile-form">
                                <div className="form-group">
                                    <label htmlFor="prof-username"><UserIcon size={16} /> Kullanıcı Adı</label>
                                    <input id="prof-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="prof-email"><Mail size={16} /> E-posta</label>
                                    <input id="prof-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="prof-bio">Biyografi</label>
                                    <textarea id="prof-bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Kendinizden bahsedin..." className="form-input" rows={3} maxLength={500} />
                                </div>
                                <button type="submit" className="btn btn-primary" id="save-profile-btn"><Save size={16} /> Kaydet</button>
                            </form>

                            <hr className="divider" />

                            <h2><Lock size={20} /> Parola Değiştir</h2>
                            {passwordMsg && <div className="alert alert-success"><CheckCircle size={18} /><span>{passwordMsg}</span></div>}
                            {passwordErr && <div className="alert alert-error"><AlertCircle size={18} /><span>{passwordErr}</span></div>}

                            <form onSubmit={handlePasswordChange} className="profile-form">
                                <div className="form-group">
                                    <label htmlFor="current-pass">Mevcut Parola</label>
                                    <input id="current-pass" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="new-pass">Yeni Parola</label>
                                    <input id="new-pass" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-input" required minLength={6} />
                                </div>
                                <button type="submit" className="btn btn-primary" id="change-password-btn"><Lock size={16} /> Parolayı Değiştir</button>
                            </form>
                        </div>
                    )}

                    {/* Admin Moderation Tab */}
                    {activeTab === 'moderation' && user.role === 'admin' && (
                        <div className="tab-content">
                            <h2><Shield size={20} /> Yazı Moderasyonu</h2>
                            {allPosts.length === 0 ? (
                                <div className="empty-state"><p>Henüz yazı yok.</p></div>
                            ) : (
                                <div className="posts-table">
                                    {allPosts.map(post => (
                                        <div key={post._id} className="post-row">
                                            <div className="post-row-info">
                                                <h3>{post.title}</h3>
                                                <div className="post-row-meta">
                                                    {statusIcon(post.status)}
                                                    <span>{statusText(post.status)}</span>
                                                    <span className="dot">·</span>
                                                    <span>{post.author?.username}</span>
                                                    <span className="dot">·</span>
                                                    <span>{formatDate(post.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="post-row-actions">
                                                <Link to={`/yazi/${post.slug}`} className="action-btn" title="Görüntüle"><Eye size={16} /></Link>
                                                {post.status !== 'approved' && (
                                                    <button onClick={() => handleStatusChange(post._id, 'approved')} className="action-btn success" title="Onayla"><CheckCircle size={16} /></button>
                                                )}
                                                {post.status !== 'suspended' && (
                                                    <button onClick={() => handleStatusChange(post._id, 'suspended')} className="action-btn warning" title="Askıya Al"><PauseCircle size={16} /></button>
                                                )}
                                                <button onClick={() => handleDeletePost(post._id)} className="action-btn danger" title="Sil"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Categories Tab */}
                    {activeTab === 'categories' && user.role === 'admin' && (
                        <div className="tab-content">
                            <h2><Tag size={20} /> Kategori Yönetimi</h2>

                            {categoryMsg && <div className="alert alert-success"><CheckCircle size={18} /><span>{categoryMsg}</span></div>}

                            <form onSubmit={handleAddCategory} className="category-form">
                                <div className="form-row">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        placeholder="Kategori adı"
                                        required
                                        className="form-input"
                                    />
                                    <input
                                        type="text"
                                        value={newCategoryDesc}
                                        onChange={e => setNewCategoryDesc(e.target.value)}
                                        placeholder="Açıklama (opsiyonel)"
                                        className="form-input"
                                    />
                                    <button type="submit" className="btn btn-primary btn-sm" id="add-category-btn">
                                        <Plus size={16} /> Ekle
                                    </button>
                                </div>
                            </form>

                            <div className="categories-grid">
                                {categories.map(cat => (
                                    <div key={cat._id} className="category-card">
                                        <div>
                                            <h3>{cat.name}</h3>
                                            {cat.description && <p>{cat.description}</p>}
                                        </div>
                                        <button onClick={() => handleDeleteCategory(cat._id)} className="action-btn danger" title="Sil">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
