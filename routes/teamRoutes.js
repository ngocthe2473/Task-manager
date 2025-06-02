const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  validateTeamCreation,
  validateTeamUpdate,
  validateMongoId,
  validatePagination
} = require('../middlewares/validation');
const { createRateLimit } = require('../middlewares/rateLimiting');
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  getTeamStats
} = require('../controllers/teamController');
const router = express.Router();

router.route('/')
  .get(authenticate, validatePagination, getTeams)
  .post(authenticate, authorize(['admin', 'manager']), createRateLimit, validateTeamCreation, createTeam);

router.route('/:id')
  .get(authenticate, validateMongoId, getTeamById)
  .put(authenticate, authorize(['admin', 'manager']), validateMongoId, validateTeamUpdate, updateTeam)
  .delete(authenticate, authorize(['admin']), validateMongoId, deleteTeam);

router.route('/:id/members')
  .post(authenticate, authorize(['admin', 'manager']), validateMongoId, addTeamMember)
  .delete(authenticate, authorize(['admin', 'manager']), validateMongoId, removeTeamMember);

router.get('/:id/stats', authenticate, validateMongoId, getTeamStats);

module.exports = router;