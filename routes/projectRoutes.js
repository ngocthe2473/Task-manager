const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  validateProjectCreation,
  validateProjectUpdate,
  validateMongoId,
  validatePagination
} = require('../middlewares/validation');
const { createRateLimit } = require('../middlewares/rateLimiting');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getMyProjects,
  searchProjects,
  getProjectAnalytics,
  detailedSearchProjects,
  advancedSearchProjects,
  advancedProjectAnalytics,
  autocompleteProjectName,
  exportProjectsCSV,
  projectDashboardSummary,
  getProjectTasks
} = require('../controllers/projectController');
const router = express.Router();

// Project routes
router.route('/')
  .get(authenticate, validatePagination, getProjects)
  .post(authenticate, createRateLimit, validateProjectCreation, createProject);

router.get('/my', authenticate, getMyProjects);

// Analytics and search routes
router.get('/analytics', authenticate, getProjectAnalytics);
router.get('/search', authenticate, searchProjects);
router.get('/detailed-search', authenticate, detailedSearchProjects);

// Advanced APIs
router.get('/advanced-search', authenticate, advancedSearchProjects);
router.get('/advanced-analytics', authenticate, advancedProjectAnalytics);
router.get('/autocomplete', authenticate, autocompleteProjectName);
router.get('/export', authenticate, exportProjectsCSV);
router.get('/dashboard-summary', authenticate, projectDashboardSummary);

router.route('/:id')
  .get(authenticate, validateMongoId, getProjectById)
  .put(authenticate, validateMongoId, validateProjectUpdate, updateProject)
  .delete(authenticate, validateMongoId, deleteProject);

router.get('/:id/stats', authenticate, validateMongoId, getProjectStats);
router.get('/:id/tasks', authenticate, validateMongoId, getProjectTasks);

module.exports = router;