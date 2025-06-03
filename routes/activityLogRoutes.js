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

// Advanced APIs
router.get('/advanced-search', protect, require('../controllers/activityLogController').advancedSearchActivityLogs);
router.get('/export', protect, require('../controllers/activityLogController').exportActivityLogsCSV);

module.exports = router;