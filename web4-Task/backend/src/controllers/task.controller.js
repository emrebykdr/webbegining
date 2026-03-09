const taskService = require('../services/task.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Tüm görevleri listele
 * @route   GET /api/tasks
 * @access  Private
 */
exports.getAllTasks = asyncHandler(async (req, res) => {
    const result = await taskService.getAllTasks(req.user._id, req.query);

    res.status(200).json({
        status: 'success',
        results: result.tasks.length,
        pagination: result.pagination,
        tasks: result.tasks,
    });
});

/**
 * @desc    Tek görev detayı
 * @route   GET /api/tasks/:id
 * @access  Private
 */
exports.getTask = asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id, req.user._id);

    res.status(200).json({
        status: 'success',
        task,
    });
});

/**
 * @desc    Yeni görev oluştur
 * @route   POST /api/tasks
 * @access  Private
 */
exports.createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body, req.user._id);

    res.status(201).json({
        status: 'success',
        message: 'Görev başarıyla oluşturuldu!',
        task,
    });
});

/**
 * @desc    Görevi güncelle
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
exports.updateTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body, req.user._id);

    res.status(200).json({
        status: 'success',
        message: 'Görev başarıyla güncellendi!',
        task,
    });
});

/**
 * @desc    Görevi sil
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
exports.deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.params.id, req.user._id);

    res.status(200).json({
        status: 'success',
        message: 'Görev başarıyla silindi!',
    });
});

/**
 * @desc    Sadece durumu güncelle
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
exports.updateStatus = asyncHandler(async (req, res) => {
    const task = await taskService.updateTaskStatus(req.params.id, req.body.status, req.user._id);

    res.status(200).json({
        status: 'success',
        message: `Görev durumu "${req.body.status}" olarak güncellendi!`,
        task,
    });
});
