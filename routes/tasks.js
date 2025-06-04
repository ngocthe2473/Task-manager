const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const taskController = require('../controllers/taskController');
const commentController = require('../controllers/commentController');
const attachmentController = require('../controllers/attachmentController');
const Task = require('../models/Task');
const upload = require('../config/upload');
const path = require('path');
const fs = require('fs');

// Task routes
router.get('/', protect, taskController.getTasks);
router.post('/', protect, taskController.createTask);
router.get('/:id', protect, taskController.getTaskById);
router.put('/:id', protect, taskController.updateTask);
router.delete('/:id', protect, taskController.deleteTask);
<<<<<<< Updated upstream
router.get('/:id/subtasks', protect, taskController.getSubtasks);
=======
// Subtasks are now handled in subTaskController
// router.get('/:id/subtasks', protect, taskController.getSubtasks);
router.put('/:id/status', protect, taskController.updateTaskStatus);
>>>>>>> Stashed changes

// Comment routes
router.get('/:taskId/comments', protect, commentController.getComments);
router.post('/:taskId/comments', protect, commentController.addComment);

// Attachment routes
router.post('/:taskId/attachments', protect, attachmentController.uploadTaskAttachment);

// Add comment to task
router.post('/:id/comments', async (req, res) => {
  try {
    const { author, content, parentComment } = req.body;
    
    if (!author || !content) {
      return res.status(400).json({ error: 'Author and content are required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newComment = {
      author,
      content,
      parentComment: parentComment || null
    };

    task.comments.push(newComment);
    await task.save();

    // If this is a reply, add it to parent's replies array
    if (parentComment) {
      const parentCommentObj = task.comments.id(parentComment);
      if (parentCommentObj) {
        parentCommentObj.replies.push(task.comments[task.comments.length - 1]._id);
        await task.save();
      }
    }

    res.status(201).json(task.comments[task.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update comment
router.put('/:id/comments/:commentId', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.content = content;
    comment.updatedAt = new Date();
    await task.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comment
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Remove replies to this comment
    task.comments = task.comments.filter(c => 
      c.parentComment?.toString() !== req.params.commentId
    );

    // Remove the comment itself
    comment.deleteOne();
    await task.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload file to task
router.post('/:id/attachments', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { uploadedBy } = req.body;
    if (!uploadedBy) {
      return res.status(400).json({ error: 'uploadedBy is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy
    };

    task.attachments.push(attachment);
    await task.save();

    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download file
router.get('/:id/attachments/:attachmentId/download', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const filePath = attachment.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, attachment.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve images for preview
router.get('/:id/attachments/:attachmentId/preview', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Check if file is an image
    if (!attachment.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File is not an image' });
    }

    const filePath = attachment.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete attachment
router.delete('/:id/attachments/:attachmentId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }

    // Remove attachment from database
    attachment.deleteOne();
    await task.save();

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task with populated comments (threaded)
router.get('/:id/full', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Organize comments into threaded structure
    const topLevelComments = task.comments.filter(comment => !comment.parentComment);
    const threadedComments = topLevelComments.map(comment => {
      const replies = task.comments.filter(reply => 
        reply.parentComment?.toString() === comment._id.toString()
      );
      return {
        ...comment.toObject(),
        replies: replies
      };
    });

    const taskWithThreads = {
      ...task.toObject(),
      threadedComments
    };

    res.json(taskWithThreads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
