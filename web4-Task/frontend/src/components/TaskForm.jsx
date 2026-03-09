import { useState, useEffect } from 'react';

const TaskForm = ({ task, onSubmit, onClose }) => {
    const isEdit = !!task;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'orta',
        category: 'diğer',
        dueDate: '',
        subtasks: [],
        tags: [],
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [newSubtask, setNewSubtask] = useState('');
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'orta',
                category: task.category || 'diğer',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                subtasks: task.subtasks || [],
                tags: task.tags || [],
            });
        }
    }, [task]);

    // Client-side validation
    const validateForm = () => {
        const errors = {};

        if (!formData.title.trim()) {
            errors.title = 'Görev başlığı zorunludur';
        } else if (formData.title.trim().length < 3) {
            errors.title = 'Başlık en az 3 karakter olmalı';
        } else if (formData.title.trim().length > 200) {
            errors.title = 'Başlık en fazla 200 karakter olabilir';
        }

        if (formData.description.length > 1000) {
            errors.description = 'Açıklama en fazla 1000 karakter olabilir';
        }

        if (formData.dueDate) {
            const selectedDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (!isEdit && selectedDate < today) {
                errors.dueDate = 'Son tarih geçmişte olamaz';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        if (newSubtask.trim().length > 100) {
            setFieldErrors(prev => ({ ...prev, subtask: 'Alt görev başlığı en fazla 100 karakter olabilir' }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, { title: newSubtask.trim(), completed: false }]
        }));
        setNewSubtask('');
        setFieldErrors(prev => ({ ...prev, subtask: '' }));
    };

    const handleRemoveSubtask = (index) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter((_, i) => i !== index)
        }));
    };

    const handleToggleSubtask = (index) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.map((s, i) =>
                i === index ? { ...s, completed: !s.completed } : s
            )
        }));
    };

    const handleAddTag = () => {
        if (!newTag.trim()) return;
        if (newTag.trim().length > 20) {
            setFieldErrors(prev => ({ ...prev, tag: 'Etiket en fazla 20 karakter olabilir' }));
            return;
        }
        if (formData.tags.includes(newTag.trim())) {
            setFieldErrors(prev => ({ ...prev, tag: 'Bu etiket zaten eklenmiş' }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, newTag.trim()]
        }));
        setNewTag('');
        setFieldErrors(prev => ({ ...prev, tag: '' }));
    };

    const handleRemoveTag = (index) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);

        if (!validateForm()) return;

        try {
            setLoading(true);
            await onSubmit(formData);
            onClose();
        } catch (err) {
            const errorData = err.response?.data;
            setApiError({
                message: errorData?.message || 'Görev kaydedilirken bir hata oluştu',
                errors: errorData?.errors || [],
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e, action) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            action();
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEdit ? 'Görevi Düzenle' : 'Yeni Görev'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {apiError && (
                            <div className="alert alert-error">
                                <span className="alert-icon">❌</span>
                                <div className="alert-content">
                                    <div className="alert-title">Hata</div>
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

                        {/* Başlık */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="task-title">Başlık *</label>
                            <input
                                id="task-title"
                                type="text"
                                name="title"
                                maxLength={200}
                                className={`form-input ${fieldErrors.title ? 'error' : ''}`}
                                placeholder="Görev başlığını girin"
                                value={formData.title}
                                onChange={handleChange}
                            />
                            {fieldErrors.title && <div className="form-error">{fieldErrors.title}</div>}
                            <span style={{ fontSize: '0.72rem', color: formData.title.length >= 200 ? 'var(--danger)' : 'var(--text-muted)', float: 'right', marginTop: '4px' }}>
                                {formData.title.length}/200
                            </span>
                        </div>

                        {/* Açıklama */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="task-description">Açıklama</label>
                            <textarea
                                id="task-description"
                                name="description"
                                maxLength={1000}
                                className={`form-textarea ${fieldErrors.description ? 'error' : ''}`}
                                placeholder="Görev açıklaması (isteğe bağlı)"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                            />
                            {fieldErrors.description && <div className="form-error">{fieldErrors.description}</div>}
                            <span style={{ fontSize: '0.72rem', color: formData.description.length >= 1000 ? 'var(--danger)' : 'var(--text-muted)', float: 'right', marginTop: '4px' }}>
                                {formData.description.length}/1000
                            </span>
                        </div>

                        {/* Status & Priority */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="task-status">Durum</label>
                                <select
                                    id="task-status"
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="todo">📋 Yapılacak</option>
                                    <option value="in-progress">🔄 Devam Ediyor</option>
                                    <option value="done">✅ Tamamlandı</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="task-priority">Öncelik</label>
                                <select
                                    id="task-priority"
                                    name="priority"
                                    className="form-select"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="düşük">↓ Düşük</option>
                                    <option value="orta">→ Orta</option>
                                    <option value="yüksek">↑ Yüksek</option>
                                    <option value="acil">🔥 Acil</option>
                                </select>
                            </div>
                        </div>

                        {/* Category & Due Date */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="task-category">Kategori</label>
                                <select
                                    id="task-category"
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="iş">💼 İş</option>
                                    <option value="kişisel">👤 Kişisel</option>
                                    <option value="okul">📚 Okul</option>
                                    <option value="sağlık">❤️ Sağlık</option>
                                    <option value="diğer">📌 Diğer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="task-due">Son Tarih</label>
                                <input
                                    id="task-due"
                                    type="date"
                                    name="dueDate"
                                    className={`form-input ${fieldErrors.dueDate ? 'error' : ''}`}
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                />
                                {fieldErrors.dueDate && <div className="form-error">{fieldErrors.dueDate}</div>}
                            </div>
                        </div>

                        {/* Alt Görevler */}
                        <div className="form-group">
                            <label className="form-label">Alt Görevler</label>
                            <div className="subtask-input-group">
                                <input
                                    type="text"
                                    maxLength={100}
                                    className={`form-input ${fieldErrors.subtask ? 'error' : ''}`}
                                    placeholder="Alt görev ekle"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, handleAddSubtask)}
                                />
                                <button type="button" className="btn btn-secondary" onClick={handleAddSubtask}>+</button>
                            </div>
                            {fieldErrors.subtask && <div className="form-error">{fieldErrors.subtask}</div>}
                            {formData.subtasks.length > 0 && (
                                <ul className="subtask-list">
                                    {formData.subtasks.map((st, i) => (
                                        <li key={i} className="subtask-item">
                                            <input
                                                type="checkbox"
                                                checked={st.completed}
                                                onChange={() => handleToggleSubtask(i)}
                                            />
                                            <label style={{ textDecoration: st.completed ? 'line-through' : 'none' }}>
                                                {st.title}
                                            </label>
                                            <button
                                                type="button"
                                                className="btn btn-icon btn-secondary btn-remove"
                                                onClick={() => handleRemoveSubtask(i)}
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Etiketler */}
                        <div className="form-group">
                            <label className="form-label">Etiketler</label>
                            <div className="subtask-input-group">
                                <input
                                    type="text"
                                    maxLength={20}
                                    className={`form-input ${fieldErrors.tag ? 'error' : ''}`}
                                    placeholder="Etiket ekle"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, handleAddTag)}
                                />
                                <button type="button" className="btn btn-secondary" onClick={handleAddTag}>+</button>
                            </div>
                            {fieldErrors.tag && <div className="form-error">{fieldErrors.tag}</div>}
                            {formData.tags.length > 0 && (
                                <div className="tags-container">
                                    {formData.tags.map((tag, i) => (
                                        <span key={i} className="tag">
                                            #{tag}
                                            <button type="button" className="tag-remove" onClick={() => handleRemoveTag(i)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? '⏳ Kaydediliyor...' : (isEdit ? '💾 Güncelle' : '➕ Oluştur')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskForm;
