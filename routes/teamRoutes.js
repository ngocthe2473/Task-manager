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
  getMyTeam,
  getMyTeamMembers,
  checkUserIsTeamLeader
} = require('../controllers/teamController');
const router = express.Router();

router.route('/')
  .get(authenticate, validatePagination, getTeams)
  .post(authenticate, createRateLimit, validateTeamCreation, createTeam);

// Get user's teams
router.get('/my', authenticate, getMyTeam);

// Get user's team members
router.get('/my-members', authenticate, getMyTeamMembers);

// Check if user is team leader
router.get('/check-leader', authenticate, checkUserIsTeamLeader);

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