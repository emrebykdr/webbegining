import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { Heart, Clock, User, Search, ChevronLeft, ChevronRight, Tag } from 'lucide-react'

function Home() {
    const [posts, setPosts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchPosts()
    }, [page, selectedCategory])

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchPosts = async () => {
        try {
            setLoading(true)
            const params = { page, limit: 12, status: 'approved' }
            if (selectedCategory) params.category = selectedCategory
            if (search) params.search = search
            const res = await api.get('/posts', { params })
            setPosts(res.data.posts)
            setTotalPages(res.data.totalPages)
        } catch (err) {
            console.error('Yazılar yüklenirken hata:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories')
            setCategories(res.data.categories)
        } catch (err) {
            console.error('Kategoriler yüklenirken hata:', err)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchPosts()
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    const stripHtml = (html) => {
        const tmp = document.createElement('div')
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ''
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="hero-gradient">BEUBlog</span>'a Hoş Geldiniz
                    </h1>
                    <p className="hero-subtitle">
                        Düşüncelerinizi paylaşın, yeni bakış açıları keşfedin ve topluluğumuzla etkileşimde bulunun.
                    </p>
                    <form className="hero-search" onSubmit={handleSearch}>
                        <div className="search-input-wrapper">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Yazı ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="search-input"
                                id="search-input"
                            />
                        </div>
                        <button type="submit" className="search-btn" id="search-btn">Ara</button>
                    </form>
                </div>
                <div className="hero-decoration">
                    <div className="hero-blob blob-1"></div>
                    <div className="hero-blob blob-2"></div>
                    <div className="hero-blob blob-3"></div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="categories-section">
                    <div className="categories-list">
                        <button
                            className={`category-chip ${!selectedCategory ? 'active' : ''}`}
                            onClick={() => { setSelectedCategory(''); setPage(1) }}
                        >
                            Tümü
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat._id}
                                className={`category-chip ${selectedCategory === cat._id ? 'active' : ''}`}
                                onClick={() => { setSelectedCategory(cat._id); setPage(1) }}
                            >
                                <Tag size={14} />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Posts Grid */}
            <section className="posts-section">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Yazılar yükleniyor...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-title">Henüz yazı yok</p>
                        <p className="empty-text">İlk yazınızı oluşturmak için "Yazı Oluştur" butonuna tıklayın.</p>
                    </div>
                ) : (
                    <div className="posts-grid">
                        {posts.map(post => (
                            <Link to={`/yazi/${post.slug}`} key={post._id} className="post-card" id={`post-${post._id}`}>
                                {post.coverImage && (
                                    <div className="post-card-image">
                                        <img src={post.coverImage} alt={post.title} loading="lazy" />
                                    </div>
                                )}
                                <div className="post-card-body">
                                    {post.category && (
                                        <span className="post-card-category">{post.category.name}</span>
                                    )}
                                    <h2 className="post-card-title">{post.title}</h2>
                                    <p className="post-card-excerpt">
                                        {post.summary || stripHtml(post.content).substring(0, 150) + '...'}
                                    </p>
                                    <div className="post-card-meta">
                                        <div className="post-card-author">
                                            <User size={14} />
                                            <span>{post.author?.username || 'Anonim'}</span>
                                        </div>
                                        <div className="post-card-date">
                                            <Clock size={14} />
                                            <span>{formatDate(post.createdAt)}</span>
                                        </div>
                                        <div className="post-card-likes">
                                            <Heart size={14} />
                                            <span>{post.likes?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft size={18} /> Önceki
                        </button>
                        <span className="pagination-info">Sayfa {page} / {totalPages}</span>
                        <button
                            className="pagination-btn"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Sonraki <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </section>
        </div>
    )
}

export default Home
