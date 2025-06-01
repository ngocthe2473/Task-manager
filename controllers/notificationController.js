const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { user: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('relatedEntity')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });
    
    res.status(200).json({
      notifications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: notifications.length,
        totalCount: total
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    ).populate('relatedEntity');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Notification',
      entityId: notification._id,
      metadata: { field: 'isRead', newValue: true }
    });

    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res) => {
  try {
    const { userId, content, type, relatedEntity, onModel } = req.body;
    
    const notification = new Notification({
      user: userId,
      content,
      type,
      relatedEntity,
      onModel
    });
    
    const savedNotification = await notification.save();
    await savedNotification.populate('relatedEntity');
    
    res.status(201).json(savedNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    
    res.status(200).json({ message: 'All notifications cleared successfully' });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to create task-related notifications
exports.createTaskNotification = async (userId, type, taskId, additionalData = {}) => {
  try {
    const notificationContent = {
      task_assigned: `You have been assigned a new task: ${additionalData.taskTitle}`,
      task_created: `New task created: ${additionalData.taskTitle}`,
      task_completed: `Task completed: ${additionalData.taskTitle}`,
      task_comment: `New comment on task: ${additionalData.taskTitle}`,
      task_due_soon: `Task due soon: ${additionalData.taskTitle}`,
      task_overdue: `Task is overdue: ${additionalData.taskTitle}`,
      daily_digest: additionalData.content || 'Daily task digest available'
    };
    
    const notification = new Notification({
      user: userId,
      content: notificationContent[type] || additionalData.content,
      type,
      relatedEntity: taskId,
      onModel: taskId ? 'Task' : null
    });
    
    const savedNotification = await notification.save();
    
    // Send real-time notification via WebSocket
    try {
      if (global.io && global.connectedUsers) {
        const socketId = global.connectedUsers.get(userId.toString());
        if (socketId) {
          global.io.to(socketId).emit('notification', {
            id: savedNotification._id,
            content: savedNotification.content,
            type: savedNotification.type,
            relatedEntity: savedNotification.relatedEntity,
            createdAt: savedNotification.createdAt,
            isRead: false
          });
        }
      }
    } catch (socketError) {
      console.error('Error sending real-time notification:', socketError);
    }
    
    return savedNotification;
  } catch (error) {
    console.error('Error creating task notification:', error);
    throw error;
  }
};