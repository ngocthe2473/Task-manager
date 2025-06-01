const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getProjectTasks
} = require('../controllers/projectController');
const router = express.Router();

// Public routes
router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.get('/:id/stats', protect, getProjectStats);
router.get('/:id/tasks', protect, getProjectTasks);

module.exports = router;