const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  // URL để truy cập tệp
  url: {
    type: String,
    required: true
  },
  // Có thể thuộc về task hoặc comment
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  // Người tải lên
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để đảm bảo mỗi attachment thuộc về hoặc task hoặc comment
AttachmentSchema.pre('validate', function(next) {
  if (!this.task && !this.comment) {
    return next(new Error('Attachment must be associated with either a task or a comment'));
  }
  if (this.task && this.comment) {
    return next(new Error('Attachment cannot be associated with both a task and a comment'));
  }
  next();
});

module.exports = mongoose.model('Attachment', AttachmentSchema);
