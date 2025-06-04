const express = require('express');
const router = express.Router();
const { getReportStats } = require('../controllers/reportController_new');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/reports/stats
router.get('/stats', authenticate, getReportStats);

module.exports = router;
