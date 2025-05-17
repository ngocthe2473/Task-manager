const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'username')
      .sort('-createdAt');
      
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { content } = req.body;
    const comment = await Comment.create({
      content,
      task: req.params.taskId,
      user: req.user.id
    });

    // Create notification for task assignee (if not the commenter)
    if (task.assignee && task.assignee.toString() !== req.user.id) {
      await Notification.create({
        user: task.assignee,
        content: `New comment on task: ${task.title}`,
        type: 'comment',
        relatedEntity: comment._id,
        onModel: 'Comment'
      });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Comment',
      entityId: comment._id
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};