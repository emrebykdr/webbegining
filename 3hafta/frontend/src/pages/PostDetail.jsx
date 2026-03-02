import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { Heart, Clock, User, Tag, Edit3, Trash2, ArrowLeft, AlertCircle } from 'lucide-react'

function PostDetail() {
    const { slug } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchPost()
    }, [slug])

    const fetchPost = async () => {
        try {
            const res = await api.get(`/posts/by-slug/${slug}`)
            setPost(res.data.post)
        } catch (err) {
            setError('Yazı bulunamadı')
        } finally {
            setLoading(false)
        }
    }

    const handleLike = async () => {
        if (!user) {
            navigate('/giris')
            return
        }
        try {
            const res = await api.put(`/posts/${post._id}/like`)
            setPost(prev => ({ ...prev, likes: res.data.likes }))
        } catch (err) {
            console.error('Beğeni hatası:', err)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return
        try {
            await api.delete(`/posts/${post._id}`)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Yazı silinemedi')
        }
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    const isLiked = user && post?.likes?.includes(user._id)
    const isOwner = user && post?.author?._id === user._id
    const isAdmin = user?.role === 'admin'

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Yazı yükleniyor...</p>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="error-page">
                <AlertCircle size={48} />
                <h2>{error || 'Yazı bulunamadı'}</h2>
                <Link to="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
            </div>
        )
    }

    return (
        <div className="post-detail-page">
            <div className="post-detail-container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    Geri Dön
                </button>

                {post.status !== 'approved' && (
                    <div className={`alert ${post.status === 'pending' ? 'alert-warning' : 'alert-error'}`}>
                        <AlertCircle size={18} />
                        <span>
                            {post.status === 'pending' ? 'Bu yazı henüz onay bekliyor.' : 'Bu yazı askıya alınmıştır.'}
                        </span>
                    </div>
                )}

                {post.coverImage && (
                    <div className="post-detail-cover">
                        <img src={post.coverImage} alt={post.title} />
                    </div>
                )}

                <div className="post-detail-header">
                    {post.category && (
                        <span className="post-detail-category">
                            <Tag size={14} />
                            {post.category.name}
                        </span>
                    )}
                    <h1 className="post-detail-title">{post.title}</h1>
                    <div className="post-detail-meta">
                        <div className="post-author-info">
                            <div className="author-avatar">
                                {post.author?.avatar ? (
                                    <img src={post.author.avatar} alt={post.author.username} />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                            <div>
                                <span className="author-name">{post.author?.username || 'Anonim'}</span>
                                {post.author?.bio && <p className="author-bio">{post.author.bio}</p>}
                            </div>
                        </div>
                        <div className="post-date">
                            <Clock size={16} />
                            <span>{formatDate(post.createdAt)}</span>
                        </div>
                    </div>
                </div>

                <div className="post-detail-content" dangerouslySetInnerHTML={{ __html: post.content }} />

                <div className="post-detail-actions">
                    <button
                        className={`like-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                        id="like-btn"
                    >
                        <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                        <span>{post.likes?.length || 0} Beğeni</span>
                    </button>

                    {(isOwner || isAdmin) && (
                        <div className="owner-actions">
                            <Link to={`/yazi-duzenle/${post.slug}`} className="btn btn-secondary" id="edit-post-btn">
                                <Edit3 size={16} />
                                Düzenle
                            </Link>
                            <button onClick={handleDelete} className="btn btn-danger" id="delete-post-btn">
                                <Trash2 size={16} />
                                Sil
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PostDetail
