const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

// @desc    Get user notifications with advanced filtering and pagination
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type = '',
      isRead = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { user: req.user.id };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by read status
    if (isRead !== '') {
      query.isRead = isRead === 'true';
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const notifications = await Notification.find(query)
      .populate('relatedEntity.entityId', 'title name')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });    res.json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      unreadCount
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
exports.getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      }
    ]);

    const totalNotifications = await Notification.countDocuments({ user: req.user.id });
    const totalUnread = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });

    res.json({
      success: true,
      statistics: {
        total: totalNotifications,
        unread: totalUnread,
        byType: stats
      }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (notification.isRead) {
      return res.status(400).json({ message: 'Notification already marked as read' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Notification',
      entityId: notification._id,
      metadata: { action: 'mark_read' }
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Notification',
      metadata: { 
        action: 'mark_all_read',
        count: result.modifiedCount
      }
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      markedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'Notification',
      entityId: req.params.id,
      metadata: { type: notification.type }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read
// @access  Private
exports.deleteReadNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user.id,
      isRead: true
    });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'Notification',
      metadata: { 
        action: 'delete_read_notifications',
        count: result.deletedCount
      }
    });

    res.json({
      success: true,
      message: `${result.deletedCount} read notifications deleted`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete read notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create notification (for system use)
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = async (req, res) => {
  try {
    // Only admin can create manual notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { 
      users, // Array of user IDs or 'all'
      title, 
      message, 
      type = 'info',
      priority = 'medium',
      relatedEntity
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    let targetUsers = [];

    if (users === 'all') {
      // Send to all active users
      const User = require('../models/User');
      const allUsers = await User.find({ isActive: true }).select('_id');
      targetUsers = allUsers.map(user => user._id);
    } else if (Array.isArray(users)) {
      targetUsers = users.filter(id => mongoose.Types.ObjectId.isValid(id));
    } else {
      return res.status(400).json({ message: 'Invalid users parameter' });
    }

    // Create notifications for all target users
    const notifications = targetUsers.map(userId => ({
      user: userId,
      title,
      message,
      type,
      priority,
      relatedEntity,
      createdBy: req.user.id
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Notification',
      metadata: { 
        action: 'bulk_create',
        count: createdNotifications.length,
        type,
        title
      }
    });

    res.status(201).json({
      success: true,
      message: `${createdNotifications.length} notifications created successfully`,
      count: createdNotifications.length
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('relatedEntity.entityId', 'title name')
      .populate('createdBy', 'name email');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Auto-mark as read when viewed
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, notificationTypes } = req.body;

    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update notification preferences
    if (emailNotifications !== undefined) {
      user.preferences = user.preferences || {};
      user.preferences.emailNotifications = emailNotifications;
    }

    if (pushNotifications !== undefined) {
      user.preferences = user.preferences || {};
      user.preferences.pushNotifications = pushNotifications;
    }

    if (notificationTypes && Array.isArray(notificationTypes)) {
      user.preferences = user.preferences || {};
      user.preferences.notificationTypes = notificationTypes;
    }

    await user.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'User',
      entityId: req.user.id,
      metadata: { action: 'update_notification_preferences' }
    });

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};