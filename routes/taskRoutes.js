const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getTasks,
  createTask,
  updateTaskStatus
} = require('../controllers/taskController');
const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id/status')
  .put(protect, updateTaskStatus);

module.exports = router;