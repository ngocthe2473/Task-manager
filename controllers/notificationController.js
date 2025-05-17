const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(20);
      
    res.json(notifications);
  } catch (error) {
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

    notification.isRead = true;
    await notification.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Notification',
      entityId: notification._id,
      metadata: { field: 'isRead', newValue: true }
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};