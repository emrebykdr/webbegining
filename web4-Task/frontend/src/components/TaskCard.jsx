import React from 'react';

const priorityLabels = {
    'düşük': '↓ Düşük',
    'orta': '→ Orta',
    'yüksek': '↑ Yüksek',
    'acil': '🔥 Acil',
};

const categoryLabels = {
    'iş': '💼 İş',
    'kişisel': '👤 Kişisel',
    'okul': '📚 Okul',
    'sağlık': '❤️ Sağlık',
    'diğer': '📌 Diğer',
};

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
    });

    if (days < 0) return { text: `${formatted} (${Math.abs(days)} gün gecikmiş)`, isOverdue: true };
    if (days === 0) return { text: `${formatted} (Bugün!)`, isOverdue: false };
    if (days === 1) return { text: `${formatted} (Yarın)`, isOverdue: false };
    if (days <= 3) return { text: `${formatted} (${days} gün kaldı)`, isOverdue: false };
    return { text: formatted, isOverdue: false };
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
    const dateInfo = formatDate(task.dueDate);
    const isOverdue = task.isOverdue || (dateInfo && dateInfo.isOverdue && task.status !== 'done');

    return (
        <div className={`task-card priority-${task.priority} ${isOverdue ? 'overdue' : ''}`}>
            <div className="task-card-header">
                <h4 className="task-card-title">{task.title}</h4>
                <div className="task-card-actions">
                    <button
                        className="btn btn-icon btn-secondary"
                        onClick={() => onEdit(task)}
                        title="Düzenle"
                    >
                        ✏️
                    </button>
                    <button
                        className="btn btn-icon btn-secondary"
                        onClick={() => onDelete(task._id)}
                        title="Sil"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            <div className="task-card-body">
                {task.description && (
                    <p className="task-card-description">{task.description}</p>
                )}

                <div className="task-card-meta">
                    <span className={`task-badge badge-priority-${task.priority}`}>
                        {priorityLabels[task.priority] || task.priority}
                    </span>
                    <span className="task-badge badge-category">
                        {categoryLabels[task.category] || task.category}
                    </span>
                </div>

                {dateInfo && (
                    <div className={`task-card-due ${isOverdue ? 'overdue' : ''}`} style={{ marginTop: '8px' }}>
                        📅 {dateInfo.text}
                    </div>
                )}

                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="task-card-subtasks">
                        <span className="subtask-label">
                            ✅ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} alt görev
                        </span>
                        <div className="subtask-progress">
                            <div
                                className="subtask-progress-bar"
                                style={{ width: `${task.subtaskProgress || 0}%` }}
                            />
                        </div>
                    </div>
                )}

                {task.tags && task.tags.length > 0 && (
                    <div className="tags-container" style={{ marginTop: '8px' }}>
                        {task.tags.map((tag, i) => (
                            <span key={i} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}

                <div className="task-status-actions">
                    {task.status !== 'todo' && (
                        <button
                            className="btn-status todo"
                            onClick={() => onStatusChange(task._id, 'todo')}
                        >
                            📋 Yapılacak
                        </button>
                    )}
                    {task.status !== 'in-progress' && (
                        <button
                            className="btn-status in-progress"
                            onClick={() => onStatusChange(task._id, 'in-progress')}
                        >
                            🔄 Devam
                        </button>
                    )}
                    {task.status !== 'done' && (
                        <button
                            className="btn-status done"
                            onClick={() => onStatusChange(task._id, 'done')}
                        >
                            ✅ Tamam
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
