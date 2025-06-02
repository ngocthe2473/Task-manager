const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

// @desc    Get time logs with advanced filtering and statistics
// @route   GET /api/timelogs
// @access  Private
exports.getTimeLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      task,
      project,
      user,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query based on user role
    let query = {};

    // Role-based filtering
    if (req.user.role === 'member') {
      // Members can only see their own time logs
      query.user = req.user.id;
    } else if (req.user.role === 'manager') {
      // Managers can see time logs from their team projects
      const managerProjects = await Project.find({ manager: req.user.id }).select('_id');
      const projectIds = managerProjects.map(p => p._id);
      
      if (projectIds.length > 0) {
        const projectTasks = await Task.find({ project: { $in: projectIds } }).select('_id');
        const taskIds = projectTasks.map(t => t._id);
        query.task = { $in: taskIds };
      } else {
        // Manager with no projects can only see own logs
        query.user = req.user.id;
      }
    }
    // Admin can see all time logs (no additional filtering)

    // Apply additional filters
    if (task) {
      query.task = mongoose.Types.ObjectId(task);
    }

    if (project) {
      const projectTasks = await Task.find({ project: mongoose.Types.ObjectId(project) }).select('_id');
      const taskIds = projectTasks.map(t => t._id);
      query.task = { $in: taskIds };
    }

    if (user && req.user.role !== 'member') {
      query.user = mongoose.Types.ObjectId(user);
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const timeLogs = await TimeLog.find(query)
      .populate('user', 'name email')
      .populate('task', 'title project')
      .populate({
        path: 'task',
        populate: {
          path: 'project',
          select: 'name'
        }
      })
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TimeLog.countDocuments(query);

    // Calculate statistics
    const stats = await TimeLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$duration' },
          totalEntries: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.json({
      success: true,
      timeLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      statistics: stats[0] || {
        totalHours: 0,
        totalEntries: 0,
        avgDuration: 0
      }
    });

  } catch (error) {
    console.error('Get time logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get time logs for a specific task
// @route   GET /api/tasks/:taskId/timelogs
// @access  Private
exports.getTaskTimeLogs = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Verify task exists and user has access
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check access permissions
    const hasAccess = task.assignee.toString() === req.user.id ||
      task.assignedBy.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && task.project && task.project.manager.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to task time logs' });
    }

    const timeLogs = await TimeLog.find({ task: taskId })
      .populate('user', 'name email')
      .sort({ date: -1 });

    // Calculate statistics
    const totalHours = timeLogs.reduce((sum, log) => sum + log.duration, 0);
    const userStats = {};

    timeLogs.forEach(log => {
      const userId = log.user._id.toString();
      if (!userStats[userId]) {
        userStats[userId] = {
          user: log.user,
          totalHours: 0,
          entryCount: 0
        };
      }
      userStats[userId].totalHours += log.duration;
      userStats[userId].entryCount += 1;
    });

    res.json({
      success: true,
      timeLogs,
      statistics: {
        totalHours,
        totalEntries: timeLogs.length,
        userBreakdown: Object.values(userStats)
      }
    });

  } catch (error) {
    console.error('Get task time logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add time log with enhanced validation
// @route   POST /api/tasks/:taskId/timelogs
// @access  Private
exports.addTimeLog = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { duration, description, date, startTime, endTime } = req.body;

    // Validate input
    if (!duration || duration <= 0) {
      return res.status(400).json({ message: 'Duration must be greater than 0' });
    }

    if (duration > 24) {
      return res.status(400).json({ message: 'Duration cannot exceed 24 hours' });
    }

    // Verify task exists
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user can log time for this task
    const canLogTime = task.assignee.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && task.project && task.project.manager.toString() === req.user.id);

    if (!canLogTime) {
      return res.status(403).json({ message: 'Not authorized to log time for this task' });
    }

    // Validate date is not in the future
    const logDate = date ? new Date(date) : new Date();
    if (logDate > new Date()) {
      return res.status(400).json({ message: 'Cannot log time for future dates' });
    }

    // Check for overlapping time logs on the same day
    const startOfDay = new Date(logDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(logDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLogs = await TimeLog.find({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const totalDurationForDay = existingLogs.reduce((sum, log) => sum + log.duration, 0);
    if (totalDurationForDay + duration > 24) {
      return res.status(400).json({ 
        message: `Total time logged for this day would exceed 24 hours. Current: ${totalDurationForDay}h, Adding: ${duration}h` 
      });
    }

    const timeLog = await TimeLog.create({
      duration,
      description: description || '',
      date: logDate,
      startTime,
      endTime,
      task: taskId,
      user: req.user.id
    });

    await timeLog.populate('user', 'name email');
    await timeLog.populate('task', 'title');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'TimeLog',
      entityId: timeLog._id,
      metadata: {
        taskId,
        duration,
        date: logDate
      }
    });

    res.status(201).json({
      success: true,
      message: 'Time log added successfully',
      timeLog
    });

  } catch (error) {
    console.error('Add time log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update time log
// @route   PUT /api/timelogs/:id
// @access  Private
exports.updateTimeLog = async (req, res) => {
  try {
    const timeLogId = req.params.id;
    const { duration, description, date, startTime, endTime } = req.body;

    const timeLog = await TimeLog.findById(timeLogId).populate('task');
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    // Check permissions
    const canEdit = timeLog.user.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && timeLog.task.project);

    if (!canEdit) {
      return res.status(403).json({ message: 'Not authorized to edit this time log' });
    }

    // Validate duration if provided
    if (duration !== undefined) {
      if (duration <= 0 || duration > 24) {
        return res.status(400).json({ message: 'Duration must be between 0 and 24 hours' });
      }
    }

    // Validate date if provided
    if (date && new Date(date) > new Date()) {
      return res.status(400).json({ message: 'Cannot log time for future dates' });
    }

    // Check for time conflicts if duration or date is being changed
    if (duration !== undefined || date !== undefined) {
      const checkDate = date ? new Date(date) : timeLog.date;
      const checkDuration = duration !== undefined ? duration : timeLog.duration;

      const startOfDay = new Date(checkDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(checkDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingLogs = await TimeLog.find({
        _id: { $ne: timeLogId },
        user: req.user.id,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      const totalDurationForDay = existingLogs.reduce((sum, log) => sum + log.duration, 0);
      if (totalDurationForDay + checkDuration > 24) {
        return res.status(400).json({ 
          message: `Total time logged for this day would exceed 24 hours` 
        });
      }
    }

    // Update fields
    if (duration !== undefined) timeLog.duration = duration;
    if (description !== undefined) timeLog.description = description;
    if (date !== undefined) timeLog.date = new Date(date);
    if (startTime !== undefined) timeLog.startTime = startTime;
    if (endTime !== undefined) timeLog.endTime = endTime;

    await timeLog.save();

    await timeLog.populate('user', 'name email');
    await timeLog.populate('task', 'title');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'TimeLog',
      entityId: timeLogId,
      metadata: {
        updatedFields: Object.keys(req.body)
      }
    });

    res.json({
      success: true,
      message: 'Time log updated successfully',
      timeLog
    });

  } catch (error) {
    console.error('Update time log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete time log
// @route   DELETE /api/timelogs/:id
// @access  Private
exports.deleteTimeLog = async (req, res) => {
  try {
    const timeLogId = req.params.id;

    const timeLog = await TimeLog.findById(timeLogId).populate('task');
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    // Check permissions
    const canDelete = timeLog.user.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && timeLog.task.project);

    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this time log' });
    }

    await TimeLog.findByIdAndDelete(timeLogId);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'TimeLog',
      entityId: timeLogId,
      metadata: {
        taskId: timeLog.task._id,
        duration: timeLog.duration,
        date: timeLog.date
      }
    });

    res.json({
      success: true,
      message: 'Time log deleted successfully'
    });

  } catch (error) {
    console.error('Delete time log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user time tracking summary
// @route   GET /api/users/:userId/time-summary
// @access  Private
exports.getUserTimeSummary = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { dateFrom, dateTo, groupBy = 'day' } = req.query;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build date range
    const dateRange = {};
    if (dateFrom) dateRange.$gte = new Date(dateFrom);
    if (dateTo) dateRange.$lte = new Date(dateTo);

    const matchStage = { user: mongoose.Types.ObjectId(userId) };
    if (Object.keys(dateRange).length > 0) {
      matchStage.date = dateRange;
    }

    // Group by specified period
    let groupId;
    switch (groupBy) {
      case 'week':
        groupId = { 
          year: { $year: '$date' },
          week: { $week: '$date' }
        };
        break;
      case 'month':
        groupId = { 
          year: { $year: '$date' },
          month: { $month: '$date' }
        };
        break;
      default: // day
        groupId = { 
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        };
    }

    const summary = await TimeLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupId,
          totalHours: { $sum: '$duration' },
          entryCount: { $sum: 1 },
          tasks: { $addToSet: '$task' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Get overall statistics
    const overallStats = await TimeLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$duration' },
          totalEntries: { $sum: 1 },
          avgDailyHours: { $avg: '$duration' },
          uniqueTasks: { $addToSet: '$task' }
        }
      }
    ]);

    res.json({
      success: true,
      summary,
      statistics: overallStats[0] || {
        totalHours: 0,
        totalEntries: 0,
        avgDailyHours: 0,
        uniqueTasks: []
      },
      period: { groupBy, dateFrom, dateTo }
    });

  } catch (error) {
    console.error('Get user time summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project time tracking report
// @route   GET /api/projects/:projectId/time-report
// @access  Private
exports.getProjectTimeReport = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access permissions
    const hasAccess = project.manager.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (project.team && project.team.members.includes(req.user.id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to project time report' });
    }

    // Get all tasks for this project
    const projectTasks = await Task.find({ project: projectId }).select('_id title');
    const taskIds = projectTasks.map(t => t._id);

    // Get time logs for all project tasks
    const timeLogs = await TimeLog.find({ task: { $in: taskIds } })
      .populate('user', 'name email')
      .populate('task', 'title status priority');

    // Calculate statistics
    const report = await TimeLog.aggregate([
      { $match: { task: { $in: taskIds } } },
      {
        $group: {
          _id: '$user',
          totalHours: { $sum: '$duration' },
          entryCount: { $sum: 1 },
          tasks: { $addToSet: '$task' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          user: { name: '$user.name', email: '$user.email' },
          totalHours: 1,
          entryCount: 1,
          taskCount: { $size: '$tasks' }
        }
      },
      { $sort: { totalHours: -1 } }
    ]);

    const totalProjectHours = report.reduce((sum, user) => sum + user.totalHours, 0);

    res.json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        description: project.description
      },
      timeReport: report,
      statistics: {
        totalHours: totalProjectHours,
        totalTasks: projectTasks.length,
        contributorCount: report.length
      },
      taskBreakdown: projectTasks.map(task => {
        const taskLogs = timeLogs.filter(log => log.task._id.toString() === task._id.toString());
        const taskHours = taskLogs.reduce((sum, log) => sum + log.duration, 0);
        return {
          task: task.title,
          taskId: task._id,
          totalHours: taskHours,
          logCount: taskLogs.length
        };
      }).sort((a, b) => b.totalHours - a.totalHours)
    });

  } catch (error) {
    console.error('Get project time report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};