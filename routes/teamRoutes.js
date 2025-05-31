const express = require('express');
const { protect, admin } = require('../middlewares/auth');
const {
  getTeams,
  createTeam,
  addTeamMember
} = require('../controllers/teamController');
const router = express.Router();

router.route('/')
  .get(protect, getTeams)
  .post(protect, admin, createTeam);

router.route('/:id/members')
  .put(protect, addTeamMember);

module.exports = router;