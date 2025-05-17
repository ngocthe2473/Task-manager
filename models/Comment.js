const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  // Trường này cho biết bình luận này là phản hồi cho bình luận nào
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  // Các attachments đính kèm với comment
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

CommentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Phương thức để lấy tất cả các phản hồi cho comment này
CommentSchema.methods.getReplies = function() {
  return mongoose.model('Comment').find({ parentComment: this._id }).sort('createdAt');
};

// Phương thức kiểm tra xem comment có phải là reply không
CommentSchema.methods.isReply = function() {
  return this.parentComment !== null;
};

module.exports = mongoose.model('Comment', CommentSchema);