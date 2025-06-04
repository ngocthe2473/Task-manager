const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController_fixed');
const { protect } = require('../middleware/authMiddleware');

// GET /api/reports/stats
router.get('/stats', protect, reportController.getReportStats);

module.exports = router;
