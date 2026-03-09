import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import FilterBar from './FilterBar';
import Particles from './Particles';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [filters, setFilters] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const {
        todoTasks,
        inProgressTasks,
        doneTasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        updateStatus,
    } = useTasks(filters);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateTask = async (data) => {
        await createTask(data);
        showToast('success', 'Görev başarıyla oluşturuldu! ✨');
    };

    const handleUpdateTask = async (data) => {
        await updateTask(editingTask._id, data);
        showToast('success', 'Görev başarıyla güncellendi! 💾');
    };

    const handleDeleteTask = async (id) => {
        try {
            await deleteTask(id);
            setDeleteConfirm(null);
            showToast('success', 'Görev başarıyla silindi! 🗑️');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Görev silinirken hata oluştu');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateStatus(id, status);
            const statusLabels = { 'todo': 'Yapılacak', 'in-progress': 'Devam Ediyor', 'done': 'Tamamlandı' };
            showToast('success', `Görev durumu "${statusLabels[status]}" olarak güncellendi! 🔄`);
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Durum güncellenirken hata oluştu');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingTask(null);
    };

    const renderColumn = (title, tasks, statusClass, icon) => (
        <div className="kanban-column">
            <div className={`kanban-column-header ${statusClass}`}>
                <span className="kanban-column-title">
                    <span className="status-icon">{icon}</span>
                    {title}
                </span>
                <span className="kanban-column-count">{tasks.length}</span>
            </div>
            <div className="kanban-column-tasks">
                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p className="empty-state-text">Bu sütunda görev yok</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onEdit={handleEdit}
                            onDelete={(id) => setDeleteConfirm(id)}
                            onStatusChange={handleStatusChange}
                        />
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="app-container">
            <Particles />
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <a className="navbar-brand" href="/">Görev Yöneticisi</a>
                    <div className="navbar-user">
                        <span className="navbar-user-name">Merhaba, {user?.name}</span>
                        <div className="navbar-user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <button className="btn btn-logout" onClick={logout}>
                            Çıkış
                        </button>
                    </div>
                </div>
            </nav>

            {/* Page Header */}
            <div className="page-header">
                <div className="container">
                    <h1>Görev Panosu</h1>
                    <p>Görevlerinizi Kanban panosu ile yönetin</p>
                </div>
            </div>

            <hr className="section-divider" />

            {/* Filter Bar */}
            <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                onAddTask={() => { setEditingTask(null); setShowForm(true); }}
            />

            <hr className="section-divider" />

            {/* Kanban Board */}
            <div className="container">
                {error && (
                    <div className="alert alert-error" style={{ marginTop: '20px' }}>
                        <span className="alert-icon">❌</span>
                        <div className="alert-content">
                            <div className="alert-title">Hata</div>
                            <div>{error}</div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading-container" style={{ marginTop: '40px' }}>
                        <div className="spinner" />
                        <p className="loading-text">Görevler yükleniyor...</p>
                    </div>
                ) : (
                    <div className="kanban-board">
                        {renderColumn('Yapılacak', todoTasks, 'todo', '📋')}
                        {renderColumn('Devam Ediyor', inProgressTasks, 'in-progress', '🔄')}
                        {renderColumn('Tamamlandı', doneTasks, 'done', '✅')}
                    </div>
                )}
            </div>

            <hr className="section-divider" />

            {/* Footer */}
            <footer className="app-footer">
                <div className="container">
                    <p>
                        <span className="footer-brand">Görev Yöneticisi</span> — MERN Stack Task Manager | 2025
                    </p>
                </div>
            </footer>

            {/* Task Form Modal */}
            {showForm && (
                <TaskForm
                    task={editingTask}
                    onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                    onClose={handleCloseForm}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Silme Onayı</h2>
                            <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textAlign: 'center' }}>
                                ⚠️ Bu görevi silmek istediğinize emin misiniz?<br />
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Bu işlem geri alınamaz.</span>
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>İptal</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteTask(deleteConfirm)}>🗑️ Sil</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast toast-${toast.type}`}>
                        {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
