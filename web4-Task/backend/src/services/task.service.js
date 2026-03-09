const Task = require('../models/Task.model');
const { NotFoundError, AuthorizationError, ValidationError } = require('../utils/ApiError');

/**
 * Task Service - İş mantığı katmanı
 * Controller'dan ayrılarak test edilebilirlik sağlar
 */
class TaskService {
    /**
     * Tüm görevleri getir (filtreleme + sıralama)
     */
    async getAllTasks(userId, queryParams) {
        const {
            status,
            priority,
            category,
            search,
            sortBy = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 50,
        } = queryParams;

        // Filtre oluştur
        const filter = { owner: userId };

        if (status) {
            if (!['todo', 'in-progress', 'done'].includes(status)) {
                throw new ValidationError(`Geçersiz durum filtresi: ${status}`, [
                    { field: 'status', message: 'Geçerli değerler: todo, in-progress, done' }
                ]);
            }
            filter.status = status;
        }

        if (priority) {
            if (!['düşük', 'orta', 'yüksek', 'acil'].includes(priority)) {
                throw new ValidationError(`Geçersiz öncelik filtresi: ${priority}`, [
                    { field: 'priority', message: 'Geçerli değerler: düşük, orta, yüksek, acil' }
                ]);
            }
            filter.priority = priority;
        }

        if (category) {
            if (!['iş', 'kişisel', 'okul', 'sağlık', 'diğer'].includes(category)) {
                throw new ValidationError(`Geçersiz kategori filtresi: ${category}`, [
                    { field: 'category', message: 'Geçerli değerler: iş, kişisel, okul, sağlık, diğer' }
                ]);
            }
            filter.category = category;
        }

        if (search) {
            filter.$text = { $search: search };
        }

        // Sıralama
        const sortOptions = {};
        const allowedSortFields = ['createdAt', 'dueDate', 'priority', 'title', 'status'];
        if (!allowedSortFields.includes(sortBy)) {
            throw new ValidationError(`Geçersiz sıralama alanı: ${sortBy}`, [
                { field: 'sortBy', message: `Geçerli alanlar: ${allowedSortFields.join(', ')}` }
            ]);
        }
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        // Sayfalama
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Task.countDocuments(filter);

        const tasks = await Task.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        return {
            tasks,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit),
            }
        };
    }

    /**
     * Tek görev getir
     */
    async getTaskById(taskId, userId) {
        const task = await Task.findById(taskId);

        if (!task) {
            throw new NotFoundError('Görev', taskId);
        }

        if (task.owner.toString() !== userId.toString()) {
            throw new AuthorizationError('Bu göreve erişim yetkiniz bulunmamaktadır.');
        }

        return task;
    }

    /**
     * Yeni görev oluştur
     */
    async createTask(taskData, userId) {
        const task = await Task.create({
            ...taskData,
            owner: userId,
        });
        return task;
    }

    /**
     * Görev güncelle
     */
    async updateTask(taskId, updateData, userId) {
        const task = await Task.findById(taskId);

        if (!task) {
            throw new NotFoundError('Görev', taskId);
        }

        if (task.owner.toString() !== userId.toString()) {
            throw new AuthorizationError('Bu görevi güncelleme yetkiniz bulunmamaktadır.');
        }

        // owner alanının değiştirilmesini engelle
        delete updateData.owner;

        const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
            new: true,
            runValidators: true,
        });

        return updatedTask;
    }

    /**
     * Görev sil
     */
    async deleteTask(taskId, userId) {
        const task = await Task.findById(taskId);

        if (!task) {
            throw new NotFoundError('Görev', taskId);
        }

        if (task.owner.toString() !== userId.toString()) {
            throw new AuthorizationError('Bu görevi silme yetkiniz bulunmamaktadır.');
        }

        await Task.findByIdAndDelete(taskId);
        return task;
    }

    /**
     * Sadece durum güncelle
     */
    async updateTaskStatus(taskId, status, userId) {
        const task = await Task.findById(taskId);

        if (!task) {
            throw new NotFoundError('Görev', taskId);
        }

        if (task.owner.toString() !== userId.toString()) {
            throw new AuthorizationError('Bu görevin durumunu değiştirme yetkiniz bulunmamaktadır.');
        }

        task.status = status;
        await task.save();
        return task;
    }
}

module.exports = new TaskService();
