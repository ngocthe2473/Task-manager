const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/reports/stats
router.get('/stats', authenticate, reportController.getReportStats);

module.exports = router;
