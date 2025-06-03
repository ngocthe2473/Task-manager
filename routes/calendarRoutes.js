const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const calendarController = require('../controllers/calendarController');

// @desc    Get calendar view of tasks and subtasks
// @route   GET /api/calendar
// @access  Private
router.get('/', protect, calendarController.getCalendarView);

// @desc    Get calendar statistics for a date range
// @route   GET /api/calendar/stats
// @access  Private
router.get('/stats', protect, calendarController.getCalendarStats);

// @desc    Get upcoming deadlines
// @route   GET /api/calendar/deadlines
// @access  Private
router.get('/deadlines', protect, calendarController.getUpcomingDeadlines);

module.exports = router;
