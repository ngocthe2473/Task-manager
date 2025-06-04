const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Team = require('../models/Team');
const mongoose = require('mongoose');

// @desc    Get activity logs with advanced filtering and analytics (Admin only)
// @route   GET /api/activitylogs
// @access  Private/Admin
exports.getActivityLogs = async (req, res) => {
  try {
    // Only admin can view all activity logs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const {
      page = 1,
      limit = 50,
      user,
      action,
      entityType,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};    if (user) {
      query.user = new mongoose.Types.ObjectId(user);
    }

    if (action) {
      query.action = action;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;    // Execute query with pagination
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(query);

    // Get analytics data
    const analytics = await ActivityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            action: '$action',
            entityType: '$entityType'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get user activity breakdown
    const userActivity = await ActivityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$user',
          activityCount: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
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
          activityCount: 1,
          lastActivity: 1
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 }
    ]);    res.json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      analytics: {
        actionBreakdown: analytics,
        topUsers: userActivity
      }
    });

  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's own activity logs
// @route   GET /api/activitylogs/me
// @access  Private
exports.getMyActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      entityType,
      dateFrom,
      dateTo
    } = req.query;

    // Build query for current user
    const query = { user: req.user.id };

    if (action) {
      query.action = action;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(query);    // Get user's activity summary
    const summary = await ActivityLog.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      summary
    });

  } catch (error) {
    console.error('Get my activity logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get team activity logs (Team Leader only)
// @route   GET /api/activitylogs/team
// @access  Private/Leader
exports.getTeamActivityLogs = async (req, res) => {
  try {
    // Check if user is a team leader
    const team = await Team.findOne({ 
      'members.user': req.user.id,
      'members.team_role': 'leader'
    });
    
    if (!team) {
      return res.status(403).json({ message: 'Access denied. Team leader privileges required.' });
    }

    const teamMemberIds = team.members.map(member => member.user);

    const {
      page = 1,
      limit = 30,
      action,
      entityType,
      dateFrom,
      dateTo
    } = req.query;

    // Build query for team members
    const query = { user: { $in: teamMemberIds } };

    if (action) {
      query.action = action;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(query);

    // Get team activity summary
    const teamSummary = await ActivityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            user: '$user',
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.user',
          activities: {
            $push: {
              action: '$_id.action',
              count: '$count'
            }
          },
          totalActivities: { $sum: '$count' }
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
          activities: 1,
          totalActivities: 1
        }
      },
      { $sort: { totalActivities: -1 } }
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      team: {
        name: team.name,
        memberCount: team.members.length
      },
      teamSummary
    });

  } catch (error) {
    console.error('Get team activity logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get activity log by ID
// @route   GET /api/activitylogs/:id
// @access  Private
exports.getActivityLog = async (req, res) => {
  try {    const log = await ActivityLog.findById(req.params.id)
      .populate('user', 'name email');

    if (!log) {
      return res.status(404).json({ message: 'Activity log not found' });
    }    // Check permissions
    const canView = req.user.role === 'admin' ||
      log.user._id.toString() === req.user.id ||
      (await isUserInTeamWithLeader(req.user.id, log.user._id));

    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      log
    });

  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get system activity statistics (Admin only)
// @route   GET /api/activitylogs/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res) => {
  try {
    // Only admin can view system statistics
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { period = '7d' } = req.query;

    // Calculate date range based on period
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get activity statistics
    const stats = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          activities: {
            $push: {
              action: '$_id.action',
              count: '$count'
            }
          },
          totalActivities: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get most active entities
    const entityStats = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$entityType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get most active users
    const userStats = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
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
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const totalActivities = await ActivityLog.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    res.json({
      success: true,
      period,
      dateRange: { startDate, endDate },
      statistics: {
        total: totalActivities,
        dailyBreakdown: stats,
        entityBreakdown: entityStats,
        topUsers: userStats
      }
    });

  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export activity logs (Admin only)
// @route   GET /api/activitylogs/export
// @access  Private/Admin
exports.exportActivityLogs = async (req, res) => {
  try {
    // Only admin can export activity logs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const {
      format = 'json',
      dateFrom,
      dateTo,
      user,
      action,
      entityType
    } = req.query;

    // Build query
    const query = {};

    if (user) query.user = new mongoose.Types.ObjectId(user);
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    // Date range filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'Date,User,Action,Entity Type,Entity ID,Metadata\n';
      const csvData = logs.map(log => {
        return [
          log.createdAt.toISOString(),
          log.user?.name || 'Unknown',
          log.action,
          log.entityType,
          log.entityId,
          JSON.stringify(log.metadata || {})
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
      res.send(csvHeaders + csvData);
    } else {
      // Return as JSON
      res.json({
        success: true,
        logs,
        exportedAt: new Date(),
        totalRecords: logs.length
      });
    }

  } catch (error) {
    console.error('Export activity logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Advanced search for activity logs (multi-filter, sort, pagination)
// @route   GET /api/activity-logs/advanced-search
// @access  Private
exports.advancedSearchActivityLogs = async (req, res) => {
  try {
    const {
      user,
      action,
      task,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;
    const filter = {};
    if (user) filter.user = user;
    if (action) filter.action = action;
    if (task) filter.task = task;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('user', 'name email')
        .populate('task', 'title')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(filter)
    ]);
    res.json({ success: true, data: logs, total });
  } catch (error) {
    console.error('Advanced search activity logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Export activity logs to CSV (filtered)
// @route   GET /api/activity-logs/export
// @access  Private
exports.exportActivityLogsCSV = async (req, res) => {
  try {
    const { user, action, task } = req.query;
    const filter = {};
    if (user) filter.user = user;
    if (action) filter.action = action;
    if (task) filter.task = task;
    const logs = await ActivityLog.find(filter).populate('user', 'name email').populate('task', 'title');
    let csv = 'User,Action,Task,CreatedAt\n';
    logs.forEach(l => {
      csv += `${l.user?.name || ''},${l.action},${l.task?.title || ''},${l.createdAt ? l.createdAt.toISOString() : ''}\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('activity_logs.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export activity logs CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to check if user is a team leader and the target user is in their team
async function isUserInTeamWithLeader(leaderId, userId) {
  try {
    const team = await Team.findOne({ 
      'members.user': leaderId,
      'members.team_role': 'leader'
    });
    
    if (!team) {
      return false;
    }
    
    // Check if the target user is also in the same team
    return team.members.some(member => member.user.toString() === userId.toString());
  } catch (error) {
    return false;
  }
}