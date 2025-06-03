const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true
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
  // File category based on mimetype
  category: {
    type: String,
    enum: ['image', 'document', 'archive', 'other'],
    default: 'other'
  },
  // Whether the file was processed (e.g., image resized)
  processed: {
    type: Boolean,
    default: false
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
  // Additional metadata
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // for video/audio files
    pages: Number,    // for documents
    checksum: String  // file integrity check
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để đảm bảo mỗi attachment thuộc về hoặc task hoặc comment
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

// Update updatedAt on save
AttachmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
AttachmentSchema.index({ task: 1 });
AttachmentSchema.index({ comment: 1 });
AttachmentSchema.index({ uploadedBy: 1 });
AttachmentSchema.index({ category: 1 });
AttachmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Attachment', AttachmentSchema);
