const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },  type: {
    type: String,
    enum: [
      'task_assigned', 
      'task_created', 
      'task_completed', 
      'task_comment', 
      'task_due_soon', 
      'task_overdue',
      'comment', 
      'due_date_reminder', 
      'project_update',
      'daily_digest',
      'deadline_warning'
    ],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Task', 'Project', 'Comment']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);