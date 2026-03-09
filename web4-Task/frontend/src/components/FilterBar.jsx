import React from 'react';

const FilterBar = ({ filters, onFilterChange, onAddTask }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <div className="filter-bar">
            <div className="container">
                <div className="filter-group">
                    <span className="filter-label">Öncelik</span>
                    <select
                        name="priority"
                        className="filter-select"
                        value={filters.priority || ''}
                        onChange={handleChange}
                    >
                        <option value="">Tümü</option>
                        <option value="düşük">↓ Düşük</option>
                        <option value="orta">→ Orta</option>
                        <option value="yüksek">↑ Yüksek</option>
                        <option value="acil">🔥 Acil</option>
                    </select>
                </div>

                <div className="filter-group">
                    <span className="filter-label">Kategori</span>
                    <select
                        name="category"
                        className="filter-select"
                        value={filters.category || ''}
                        onChange={handleChange}
                    >
                        <option value="">Tümü</option>
                        <option value="iş">💼 İş</option>
                        <option value="kişisel">👤 Kişisel</option>
                        <option value="okul">📚 Okul</option>
                        <option value="sağlık">❤️ Sağlık</option>
                        <option value="diğer">📌 Diğer</option>
                    </select>
                </div>

                <div className="filter-group">
                    <span className="filter-label">Sıralama</span>
                    <select
                        name="sortBy"
                        className="filter-select"
                        value={filters.sortBy || 'createdAt'}
                        onChange={handleChange}
                    >
                        <option value="createdAt">Oluşturma Tarihi</option>
                        <option value="dueDate">Son Tarih</option>
                        <option value="title">Başlık</option>
                    </select>
                </div>

                <div className="filter-spacer" />

                <button className="btn btn-primary" onClick={onAddTask}>
                    ➕ Yeni Görev
                </button>
            </div>
        </div>
    );
};

export default FilterBar;
