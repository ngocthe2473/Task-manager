const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');
const { 
  getSubTasks, 
  createSubTask 
} = require('../controllers/subTaskController');
const { protect } = require('../middleware/authMiddleware');

// Task routes
router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

// SubTask routes
router.get('/:taskId/subtasks', protect, getSubTasks);
router.post('/:taskId/subtasks', protect, createSubTask);

module.exports = router;