const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getProjects,
  createProject,
  updateProjectStatus
} = require('../controllers/projectController');
const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id/status')
  .put(protect, updateProjectStatus);

module.exports = router;