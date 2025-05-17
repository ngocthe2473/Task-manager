const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get time logs for a task
// @route   GET /api/tasks/:taskId/timelogs
// @access  Private
exports.getTimeLogs = async (req, res) => {
  try {
    const timeLogs = await TimeLog.find({ task: req.params.taskId })
      .populate('user', 'username')
      .sort('-date');
      
    res.json(timeLogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add time log
// @route   POST /api/tasks/:taskId/timelogs
// @access  Private
exports.addTimeLog = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is task assignee
    if (task.assignee && task.assignee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { duration, description, date } = req.body;
    const timeLog = await TimeLog.create({
      duration,
      description,
      date: date || Date.now(),
      task: req.params.taskId,
      user: req.user.id
    });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'TimeLog',
      entityId: timeLog._id
    });

    res.status(201).json(timeLog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};