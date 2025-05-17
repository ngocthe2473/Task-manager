const express = require('express');
const { protect, admin } = require('../middlewares/auth');
const {
  getActivityLogs,
  getMyActivityLogs
} = require('../controllers/activityLogController');
const router = express.Router();

router.route('/')
  .get(protect, admin, getActivityLogs);

router.route('/me')
  .get(protect, getMyActivityLogs);

module.exports = router;