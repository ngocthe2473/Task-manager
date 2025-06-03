const express = require('express');
const { authenticate, authorize, authorizeTeamRole } = require('../middlewares/auth');
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
  getTeamStats,
  changeTeamRole,
  getMyTeam
} = require('../controllers/teamController');
const router = express.Router();

router.route('/')
  .get(authenticate, validatePagination, getTeams)
  .post(authenticate, createRateLimit, validateTeamCreation, createTeam);

router.route('/:id')
  .get(authenticate, validateMongoId, getTeamById)
  .put(authenticate, authorizeTeamRole('id', 'leader'), validateMongoId, validateTeamUpdate, updateTeam)
  .delete(authenticate, authorize(['admin']), validateMongoId, deleteTeam);

router.route('/:id/members')
  .post(authenticate, authorizeTeamRole('id', 'leader'), validateMongoId, addTeamMember)
  .delete(authenticate, authorizeTeamRole('id', 'leader'), validateMongoId, removeTeamMember);

router.get('/:id/stats', authenticate, validateMongoId, getTeamStats);
router.put('/:id/members/:userId/role', 
  authenticate, 
  authorizeTeamRole('id', 'leader'), 
  validateMongoId, 
  changeTeamRole
);

module.exports = router;