const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const attachmentController = require('../controllers/attachmentController');

// @desc    Get all attachments with filtering (Admin/Manager only)
// @route   GET /api/attachments
// @access  Private (Admin/Manager)
router.get('/', protect, authorize('admin', 'manager'), attachmentController.getAttachments);

// @desc    Get storage statistics
// @route   GET /api/attachments/stats
// @access  Private (Admin/Manager)
router.get('/stats', protect, authorize('admin', 'manager'), attachmentController.getStorageStats);

// @desc    Bulk delete attachments
// @route   DELETE /api/attachments/bulk
// @access  Private (Admin only)
router.delete('/bulk', protect, authorize('admin'), attachmentController.bulkDeleteAttachments);

// @desc    Clean up orphaned files
// @route   POST /api/attachments/cleanup
// @access  Private (Admin only)
router.post('/cleanup', protect, authorize('admin'), attachmentController.cleanupOrphanedFiles);

// @desc    Get attachment by filename (serve file)
// @route   GET /api/attachments/:filename
// @access  Private
router.get('/:filename', protect, attachmentController.getAttachment);

// @desc    Get attachment metadata
// @route   GET /api/attachments/:id/info
// @access  Private
router.get('/:id/info', protect, attachmentController.getAttachmentInfo);

// @desc    Download attachment with original filename
// @route   GET /api/attachments/:id/download
// @access  Private
router.get('/:id/download', protect, attachmentController.downloadAttachment);

// @desc    Delete attachment
// @route   DELETE /api/attachments/:id
// @access  Private
router.delete('/:id', protect, attachmentController.deleteAttachment);

module.exports = router;
