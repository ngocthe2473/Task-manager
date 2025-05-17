const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
exports.getComments = async (req, res) => {
  try {
    // Chỉ lấy root comments (không phải replies)
    const comments = await Comment.find({ 
      task: req.params.taskId,
      parentComment: null
    })
      .populate('user', 'name avatar')
      .populate('attachments')
      .sort('-createdAt');

    // Lấy replies cho mỗi comment
    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await Comment.find({ parentComment: comment._id })
        .populate('user', 'name avatar')
        .populate('attachments')
        .sort('createdAt');
      
      // Chuyển đổi Mongoose document sang plain object để có thể thêm trường
      const commentObj = comment.toObject();
      commentObj.replies = replies;
      return commentObj;
    }));

    res.json(commentsWithReplies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    
    // Kiểm tra task tồn tại không
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Nếu là reply, kiểm tra parent comment tồn tại không
    if (parentComment) {
      const parentCommentExists = await Comment.findById(parentComment);
      if (!parentCommentExists) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }
    
    const comment = await Comment.create({
      text,
      user: req.user.id,
      task: req.params.taskId,
      parentComment: parentComment || null
    });
    
    // Populate thông tin người dùng
    await comment.populate('user', 'name avatar');
    
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Kiểm tra quyền sửa
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    comment.text = req.body.text;
    comment.updatedAt = Date.now();
    
    await comment.save();
    await comment.populate('user', 'name avatar');
    await comment.populate('attachments');
    
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Kiểm tra quyền xóa
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Xóa tất cả replies nếu đây là comment gốc
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: comment._id });
    }
    
    await comment.remove();
    
    res.json({ message: 'Comment removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};