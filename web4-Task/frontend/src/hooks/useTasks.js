import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/api.service';

export const useTasks = (filters = {}) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await taskService.getAll(filters);
            setTasks(data.tasks || []);
        } catch (err) {
            const message = err.response?.data?.message || 'Görevler yüklenirken bir hata oluştu';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Derived state - her status için filtrele
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const createTask = async (taskData) => {
        const { data } = await taskService.create(taskData);
        await fetchTasks();
        return data;
    };

    const updateTask = async (id, taskData) => {
        const { data } = await taskService.update(id, taskData);
        await fetchTasks();
        return data;
    };

    const deleteTask = async (id) => {
        await taskService.delete(id);
        await fetchTasks();
    };

    const updateStatus = async (id, status) => {
        await taskService.updateStatus(id, status);
        await fetchTasks();
    };

    return {
        tasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        loading,
        error,
        refetch: fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        updateStatus,
    };
};
