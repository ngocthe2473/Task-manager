const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask,
  getMyTasks,
  getTaskStats,
  searchTasks,
  searchUsers,
  searchProjects,
  getComprehensiveStats,
  getTeamAnalytics,
  getTaskTimeline,
  getTasksByProject
} = require('../controllers/taskController');
const { 
  getSubTasks, 
  createSubTask 
} = require('../controllers/subTaskController');
const { authenticate } = require('../middlewares/auth');
const { 
  validateTaskCreation, 
  validateTaskUpdate, 
  validateMongoId, 
  validatePagination 
} = require('../middlewares/validation');
const { createRateLimit } = require('../middlewares/rateLimiting');

// Task routes
router.route('/')
  .get(authenticate, validatePagination, getTasks)
  .post(authenticate, createRateLimit, validateTaskCreation, createTask);

// User-specific routes
router.get('/my-tasks', authenticate, getMyTasks);
router.get('/dashboard-stats', authenticate, getTaskStats);

// Project-specific routes
router.get('/project/:projectId', authenticate, validateMongoId, getTasksByProject);

// Search routes
router.get('/search', authenticate, searchTasks);
router.get('/search-users', authenticate, searchUsers);
router.get('/search-projects', authenticate, searchProjects);

// Analytics routes
router.get('/stats', authenticate, getComprehensiveStats);
router.get('/team-analytics', authenticate, getTeamAnalytics);
router.get('/timeline', authenticate, getTaskTimeline);

router.route('/:id')
  .get(authenticate, validateMongoId, getTaskById)
  .put(authenticate, validateMongoId, validateTaskUpdate, updateTask)
  .delete(authenticate, validateMongoId, deleteTask);

// SubTask routes
router.get('/:taskId/subtasks', authenticate, validateMongoId, getSubTasks);
router.post('/:taskId/subtasks', authenticate, validateMongoId, createSubTask);

module.exports = router;