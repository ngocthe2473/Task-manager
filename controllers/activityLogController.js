const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs
// @route   GET /api/activitylogs
// @access  Private/Admin
exports.getActivityLogs = async (req, res) => {
  try {
    // Only admin can view all activity logs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const logs = await ActivityLog.find()
      .populate('user', 'username')
      .sort('-createdAt')
      .limit(100);
      
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's activity logs
// @route   GET /api/activitylogs/me
// @access  Private
exports.getMyActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(50);
      
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};