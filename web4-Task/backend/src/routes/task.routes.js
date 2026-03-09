const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../middlewares/validate.middleware');

// Tüm task route'ları koruma altında
router.use(protect);

router
    .route('/')
    .get(taskController.getAllTasks)
    .post(validate(schemas.createTask), taskController.createTask);

router
    .route('/:id')
    .get(taskController.getTask)
    .put(taskController.updateTask)
    .delete(taskController.deleteTask);

router.patch('/:id/status', validate(schemas.updateStatus), taskController.updateStatus);

module.exports = router;
