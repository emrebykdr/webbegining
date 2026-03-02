import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { ImagePlus, Send, AlertCircle, Upload } from 'lucide-react'

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
    ]
}

function CreatePost() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [summary, setSummary] = useState('')
    const [coverImage, setCoverImage] = useState('')
    const [category, setCategory] = useState('')
    const [categories, setCategories] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (!user) {
            navigate('/giris')
            return
        }
        fetchCategories()
    }, [user])

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories')
            setCategories(res.data.categories)
        } catch (err) {
            console.error('Kategoriler yüklenemedi:', err)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('image', file)

        try {
            setUploading(true)
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setCoverImage(res.data.url)
        } catch (err) {
            setError(err.response?.data?.message || 'Görsel yüklenemedi')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content || content === '<p><br></p>') {
            setError('İçerik alanı boş olamaz')
            return
        }

        setError('')
        setLoading(true)
        try {
            const res = await api.post('/posts', {
                title,
                content,
                summary,
                coverImage,
                category: category || undefined
            })
            navigate(`/yazi/${res.data.post.slug}`)
        } catch (err) {
            setError(err.response?.data?.message || 'Yazı oluşturulamadı')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="editor-page">
            <div className="editor-container">
                <h1 className="editor-title">
                    <Send size={28} />
                    Yeni Yazı Oluştur
                </h1>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="editor-form">
                    <div className="form-group">
                        <label htmlFor="title">Başlık</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Yazınızın başlığını girin..."
                            required
                            maxLength={200}
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category">Kategori</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="form-input"
                            >
                                <option value="">Kategori seçin (opsiyonel)</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Kapak Görseli</label>
                            <div className="image-upload-area">
                                {coverImage ? (
                                    <div className="image-preview">
                                        <img src={coverImage} alt="Kapak görseli" />
                                        <button type="button" className="remove-image" onClick={() => setCoverImage('')}>×</button>
                                    </div>
                                ) : (
                                    <label className="upload-label" htmlFor="cover-upload">
                                        {uploading ? (
                                            <span>Yükleniyor...</span>
                                        ) : (
                                            <>
                                                <Upload size={24} />
                                                <span>Görsel Yükle</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            id="cover-upload"
                                            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                                            onChange={handleImageUpload}
                                            hidden
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="summary">Özet</label>
                        <textarea
                            id="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Yazınızın kısa bir özetini girin (opsiyonel)..."
                            maxLength={500}
                            rows={3}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>İçerik</label>
                        <div className="quill-wrapper">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                placeholder="Yazınızı buraya yazın..."
                            />
                        </div>
                    </div>

                    <div className="editor-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            İptal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} id="submit-post-btn">
                            {loading ? 'Gönderiliyor...' : 'Yazıyı Yayınla'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePost
