const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const commentController = require('../controllers/commentController');
const attachmentController = require('../controllers/attachmentController');

// @desc    Get comments for a task
// @route   GET /api/comments?task=:taskId
// @access  Private
router.get('/', protect, commentController.getComments);

// @desc    Add comment to task
// @route   POST /api/comments
// @access  Private
router.post('/', protect, commentController.addComment);

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
router.put('/:id', protect, commentController.updateComment);

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
router.delete('/:id', protect, commentController.deleteComment);

// @desc    Like/Unlike comment
// @route   POST /api/comments/:id/like
// @access  Private
router.post('/:id/like', protect, commentController.toggleLike);

// @desc    Add reply to comment
// @route   POST /api/comments/:id/replies
// @access  Private
router.post('/:id/replies', protect, commentController.addReply);

// @desc    Get replies for a comment
// @route   GET /api/comments/:id/replies
// @access  Private
router.get('/:id/replies', protect, commentController.getReplies);

// @desc    Upload attachment to comment
// @route   POST /api/comments/:commentId/attachments
// @access  Private
router.post('/:commentId/attachments', protect, attachmentController.uploadCommentAttachment);

module.exports = router;