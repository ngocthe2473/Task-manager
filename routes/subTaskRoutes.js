const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSubTasks,
  createSubTask,
  updateSubTask,
  deleteSubTask,
  getSubTaskById,
} = require('../controllers/subTaskController');

// Routes for subtasks
router.route('/:id')
  .get(protect, getSubTaskById)
  .put(protect, updateSubTask)
  .delete(protect, deleteSubTask);

module.exports = router;
