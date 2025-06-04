const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const taskController = require('../controllers/taskController');
const commentController = require('../controllers/commentController');
const attachmentController = require('../controllers/attachmentController');

// Task routes
router.get('/', protect, taskController.getTasks);
router.post('/', protect, taskController.createTask);
router.get('/my', protect, taskController.getMyTasks);
router.get('/stats', protect, taskController.getTaskStats);
router.get('/:id', protect, taskController.getTaskById);
router.put('/:id', protect, taskController.updateTask);
router.delete('/:id', protect, taskController.deleteTask);
router.get('/:id/subtasks', protect, taskController.getSubtasks);
router.put('/:id/status', protect, taskController.updateTaskStatus);

// Comment routes for tasks
router.get('/:taskId/comments', protect, commentController.getComments);
router.post('/:taskId/comments', protect, commentController.addComment);

// Attachment routes for tasks
router.post('/:taskId/attachments', protect, attachmentController.uploadTaskAttachment);

module.exports = router;
