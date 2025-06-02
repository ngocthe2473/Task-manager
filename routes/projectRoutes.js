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
  getMyProjects
} = require('../controllers/projectController');
const router = express.Router();

// Project routes
router.route('/')
  .get(authenticate, validatePagination, getProjects)
  .post(authenticate, authorize(['admin', 'manager']), createRateLimit, validateProjectCreation, createProject);

router.get('/my', authenticate, getMyProjects);

router.route('/:id')
  .get(authenticate, validateMongoId, getProjectById)
  .put(authenticate, authorize(['admin', 'manager']), validateMongoId, validateProjectUpdate, updateProject)
  .delete(authenticate, authorize(['admin', 'manager']), validateMongoId, deleteProject);

router.get('/:id/stats', authenticate, validateMongoId, getProjectStats);

module.exports = router;