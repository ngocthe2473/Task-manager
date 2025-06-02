const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Attachment = require('../models/Attachment');
const mongoose = require('mongoose');

// @desc    Get all comments for a task with enhanced features
// @route   GET /api/tasks/:taskId/comments
// @access  Private
exports.getComments = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Verify task exists and user has access
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to task
    const hasAccess = task.assignee.toString() === req.user.id ||
      task.assignedBy.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && task.project);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to task comments' });
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get root comments (not replies) with pagination
    const comments = await Comment.find({ 
      task: req.params.taskId,
      parentComment: null
    })
      .populate('user', 'name avatar email')
      .populate('attachments', 'filename originalName mimeType size url')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await Comment.find({ parentComment: comment._id })
        .populate('user', 'name avatar email')
        .populate('attachments', 'filename originalName mimeType size url')
        .sort({ createdAt: 1 });
      
      const commentObj = comment.toObject();
      commentObj.replies = replies;
      commentObj.replyCount = replies.length;
      return commentObj;
    }));

    // Get total count for pagination
    const total = await Comment.countDocuments({ 
      task: req.params.taskId,
      parentComment: null
    });

    res.json({
      success: true,
      comments: commentsWithReplies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to task with enhanced features
// @route   POST /api/tasks/:taskId/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text, parentComment, mentions = [] } = req.body;
    const taskId = req.params.taskId;
    
    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Verify task exists and user has access
    const task = await Task.findById(taskId).populate('project', 'team');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check access permissions
    const hasAccess = task.assignee.toString() === req.user.id ||
      task.assignedBy.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && task.project);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to add comments' });
    }
    
    // If it's a reply, verify parent comment exists
    if (parentComment) {
      const parentCommentExists = await Comment.findOne({
        _id: parentComment,
        task: taskId
      });
      if (!parentCommentExists) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }
    
    // Create comment
    const comment = await Comment.create({
      text: text.trim(),
      user: req.user.id,
      task: taskId,
      parentComment: parentComment || null,
      mentions: mentions.filter(id => mongoose.Types.ObjectId.isValid(id))
    });
    
    // Populate user information
    await comment.populate('user', 'name avatar email');
    
    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Comment',
      entityId: comment._id,
      metadata: {
        taskId,
        isReply: !!parentComment,
        parentComment: parentComment || null
      }
    });

    // Create notifications
    const notificationPromises = [];

    // Notify task assignee if not the commenter
    if (task.assignee.toString() !== req.user.id) {
      notificationPromises.push(
        Notification.create({
          user: task.assignee,
          title: parentComment ? 'New Reply on Task' : 'New Comment on Task',
          message: `${req.user.name} ${parentComment ? 'replied to a comment' : 'commented'} on task "${task.title}"`,
          type: 'comment',
          relatedEntity: {
            entityType: 'Task',
            entityId: taskId
          }
        })
      );
    }

    // Notify task creator if different from assignee and commenter
    if (task.assignedBy.toString() !== req.user.id && 
        task.assignedBy.toString() !== task.assignee.toString()) {
      notificationPromises.push(
        Notification.create({
          user: task.assignedBy,
          title: parentComment ? 'New Reply on Task' : 'New Comment on Task',
          message: `${req.user.name} ${parentComment ? 'replied to a comment' : 'commented'} on task "${task.title}"`,
          type: 'comment',
          relatedEntity: {
            entityType: 'Task',
            entityId: taskId
          }
        })
      );
    }

    // Notify mentioned users
    if (mentions.length > 0) {
      mentions.forEach(userId => {
        if (userId !== req.user.id) {
          notificationPromises.push(
            Notification.create({
              user: userId,
              title: 'You were mentioned in a comment',
              message: `${req.user.name} mentioned you in a comment on task "${task.title}"`,
              type: 'mention',
              relatedEntity: {
                entityType: 'Task',
                entityId: taskId
              }
            })
          );
        }
      });
    }

    // If it's a reply, notify the original comment author
    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment);
      if (parentCommentDoc && parentCommentDoc.user.toString() !== req.user.id) {
        notificationPromises.push(
          Notification.create({
            user: parentCommentDoc.user,
            title: 'Reply to your comment',
            message: `${req.user.name} replied to your comment on task "${task.title}"`,
            type: 'reply',
            relatedEntity: {
              entityType: 'Task',
              entityId: taskId
            }
          })
        );
      }
    }

    await Promise.all(notificationPromises);
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update comment with enhanced permissions
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const commentId = req.params.id;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const comment = await Comment.findById(commentId)
      .populate('task', 'title assignee assignedBy')
      .populate('user', 'name');
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check edit permissions
    const canEdit = comment.user._id.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && comment.task.assignedBy.toString() === req.user.id);

    if (!canEdit) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    // Check if comment is too old to edit (24 hours)
    const timeDiff = new Date() - comment.createdAt;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff > 24 && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Comments can only be edited within 24 hours' });
    }
    
    const oldText = comment.text;
    comment.text = text.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    
    await comment.save();
    
    await comment.populate('user', 'name avatar email');
    await comment.populate('attachments', 'filename originalName mimeType size url');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Comment',
      entityId: commentId,
      metadata: {
        taskId: comment.task._id,
        oldText: oldText.substring(0, 100),
        newText: text.substring(0, 100)
      }
    });
    
    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete comment with cascading
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId)
      .populate('task', 'title assignee assignedBy')
      .populate('user', 'name');
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check delete permissions
    const canDelete = comment.user._id.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && comment.task.assignedBy.toString() === req.user.id);

    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // If this is a root comment, handle replies
    if (!comment.parentComment) {
      const replies = await Comment.find({ parentComment: commentId });
      
      if (replies.length > 0) {
        // Option 1: Delete all replies (destructive)
        // await Comment.deleteMany({ parentComment: commentId });
        
        // Option 2: Keep replies but mark parent as deleted (non-destructive)
        comment.text = '[This comment has been deleted]';
        comment.isDeleted = true;
        comment.deletedAt = new Date();
        comment.deletedBy = req.user.id;
        await comment.save();

        // Log activity
        await ActivityLog.create({
          user: req.user.id,
          action: 'delete',
          entityType: 'Comment',
          entityId: commentId,
          metadata: {
            taskId: comment.task._id,
            hasReplies: true,
            replyCount: replies.length,
            deletionType: 'soft'
          }
        });

        return res.json({
          success: true,
          message: 'Comment marked as deleted (replies preserved)'
        });
      }
    }
    
    // Delete comment and its attachments
    if (comment.attachments && comment.attachments.length > 0) {
      await Attachment.deleteMany({ _id: { $in: comment.attachments } });
    }

    await Comment.findByIdAndDelete(commentId);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'Comment',
      entityId: commentId,
      metadata: {
        taskId: comment.task._id,
        deletionType: 'permanent'
      }
    });
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add attachment to comment
// @route   POST /api/comments/:id/attachments
// @access  Private
exports.addAttachment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user can add attachments to this comment
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Can only add attachments to your own comments' });
    }

    // This would typically handle file upload
    // For now, assuming attachment data is provided in request body
    const { filename, originalName, mimeType, size, url } = req.body;

    const attachment = await Attachment.create({
      filename,
      originalName,
      mimeType,
      size,
      url,
      uploadedBy: req.user.id,
      relatedEntity: {
        entityType: 'Comment',
        entityId: commentId
      }
    });

    comment.attachments.push(attachment._id);
    await comment.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Attachment',
      entityId: attachment._id,
      metadata: {
        commentId,
        filename: originalName
      }
    });

    res.status(201).json({
      success: true,
      message: 'Attachment added successfully',
      attachment
    });

  } catch (error) {
    console.error('Add attachment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove attachment from comment
// @route   DELETE /api/comments/:id/attachments/:attachmentId
// @access  Private
exports.removeAttachment = async (req, res) => {
  try {
    const { id: commentId, attachmentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Check permissions
    const canRemove = comment.user.toString() === req.user.id ||
      attachment.uploadedBy.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!canRemove) {
      return res.status(403).json({ message: 'Not authorized to remove this attachment' });
    }

    // Remove attachment reference from comment
    comment.attachments = comment.attachments.filter(
      id => id.toString() !== attachmentId
    );
    await comment.save();

    // Delete the attachment
    await Attachment.findByIdAndDelete(attachmentId);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'Attachment',
      entityId: attachmentId,
      metadata: {
        commentId,
        filename: attachment.originalName
      }
    });

    res.json({
      success: true,
      message: 'Attachment removed successfully'
    });

  } catch (error) {
    console.error('Remove attachment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const hasLiked = comment.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      comment.likes.push(userId);
    }

    await comment.save();

    // If liking (not unliking) and not own comment, create notification
    if (!hasLiked && comment.user.toString() !== userId) {
      await Notification.create({
        user: comment.user,
        title: 'Your comment was liked',
        message: `${req.user.name} liked your comment`,
        type: 'like',
        relatedEntity: {
          entityType: 'Comment',
          entityId: commentId
        }
      });
    }

    res.json({
      success: true,
      message: hasLiked ? 'Comment unliked' : 'Comment liked',
      likesCount: comment.likes.length,
      hasLiked: !hasLiked
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get comment by ID with full details
// @route   GET /api/comments/:id
// @access  Private
exports.getComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('user', 'name avatar email')
      .populate('task', 'title')
      .populate('attachments', 'filename originalName mimeType size url')
      .populate('mentions', 'name email')
      .populate('likes', 'name avatar');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user has access to the task
    const task = await Task.findById(comment.task._id);
    const hasAccess = task.assignee.toString() === req.user.id ||
      task.assignedBy.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && task.project);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get replies if this is a root comment
    let replies = [];
    if (!comment.parentComment) {
      replies = await Comment.find({ parentComment: comment._id })
        .populate('user', 'name avatar email')
        .populate('attachments', 'filename originalName mimeType size url')
        .sort({ createdAt: 1 });
    }

    const commentObj = comment.toObject();
    commentObj.replies = replies;
    commentObj.replyCount = replies.length;
    commentObj.likesCount = comment.likes.length;
    commentObj.hasLiked = comment.likes.some(like => like._id.toString() === req.user.id);

    res.json({
      success: true,
      comment: commentObj
    });

  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add reply to comment
// @route   POST /api/comments/:id/replies
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { content, mentions = [] } = req.body;
    const parentCommentId = req.params.id;

    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    // Check if parent comment exists
    const parentComment = await Comment.findById(parentCommentId).populate('task');
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    // Check if user has access to the task
    const task = await Task.findById(parentComment.task._id);
    const hasAccess = task.assignee.toString() === req.user.id ||
      task.assignedBy.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && task.project);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create reply
    const reply = new Comment({
      content: content.trim(),
      user: req.user.id,
      task: parentComment.task._id,
      parentComment: parentCommentId,
      mentions: mentions,
      isEdited: false
    });

    await reply.save();

    // Populate reply with user details
    await reply.populate('user', 'name avatar email');

    // Create activity log
    await ActivityLog.create({
      user: req.user.id,
      action: 'replied_to_comment',
      target: 'comment',
      targetId: parentCommentId,
      details: {
        taskId: parentComment.task._id,
        replyId: reply._id,
        content: content.substring(0, 100)
      }
    });

    // Create notifications for mentions
    if (mentions && mentions.length > 0) {
      const notificationPromises = mentions.map(userId => 
        Notification.create({
          recipient: userId,
          sender: req.user.id,
          type: 'mention',
          message: `${req.user.name} mentioned you in a reply`,
          relatedTask: parentComment.task._id,
          relatedComment: reply._id
        })
      );
      await Promise.all(notificationPromises);
    }

    res.status(201).json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get replies for a comment
// @route   GET /api/comments/:id/replies
// @access  Private
exports.getReplies = async (req, res) => {
  try {
    const parentCommentId = req.params.id;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc' } = req.query;

    // Check if parent comment exists
    const parentComment = await Comment.findById(parentCommentId).populate('task');
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    // Check if user has access to the task
    const task = await Task.findById(parentComment.task._id);
    const hasAccess = task.assignee.toString() === req.user.id ||
      task.assignedBy.toString() === req.user.id ||
      req.user.role === 'admin' ||
      (req.user.role === 'manager' && task.project);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get replies with pagination
    const replies = await Comment.find({ parentComment: parentCommentId })
      .populate('user', 'name avatar email')
      .populate('attachments', 'filename originalName mimeType size url')
      .populate('mentions', 'name email')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const totalReplies = await Comment.countDocuments({ parentComment: parentCommentId });

    // Format replies with additional data
    const formattedReplies = replies.map(reply => {
      const replyObj = reply.toObject();
      replyObj.likesCount = reply.likes.length;
      replyObj.hasLiked = reply.likes.some(like => like._id.toString() === req.user.id);
      return replyObj;
    });

    res.json({
      success: true,
      replies: formattedReplies,
      pagination: {
        current: page,
        pages: Math.ceil(totalReplies / limit),
        total: totalReplies
      }
    });

  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};