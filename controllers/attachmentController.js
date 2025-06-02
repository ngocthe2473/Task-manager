const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const sharp = require('sharp'); // For image processing

// Configuration
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const TEMP_DIR = path.join(__dirname, '../temp');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ],
  archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  others: ['application/json', 'text/xml']
};

const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.archives,
  ...ALLOWED_FILE_TYPES.others
];

// Ensure directories exist
const ensureDirectories = async () => {
  try {
    if (!fsSync.existsSync(UPLOAD_DIR)) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!fsSync.existsSync(TEMP_DIR)) {
      await fs.mkdir(TEMP_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating directories:', error);
  }
};

ensureDirectories();

// Helper functions
const generateSecureFilename = (originalName) => {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(16).toString('hex');
  return `${hash}${ext}`;
};

const getFileCategory = (mimetype) => {
  if (ALLOWED_FILE_TYPES.images.includes(mimetype)) return 'image';
  if (ALLOWED_FILE_TYPES.documents.includes(mimetype)) return 'document';
  if (ALLOWED_FILE_TYPES.archives.includes(mimetype)) return 'archive';
  return 'other';
};

const validateFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return errors;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  if (!ALL_ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push('File type not allowed');
  }
  
  return errors;
};

const processImage = async (inputPath, outputPath) => {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    // Resize large images to save space
    if (metadata.width > 1920 || metadata.height > 1080) {
      await sharp(inputPath)
        .resize(1920, 1080, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error processing image:', error);
    return false;
  }
};

// @desc    Upload attachment to task
// @route   POST /api/tasks/:taskId/attachments
// @access  Private
exports.uploadTaskAttachment = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No files were uploaded' 
      });
    }

    const task = await Task.findById(req.params.taskId)
      .populate('assignee', 'name email')
      .populate('project', 'name team');
      
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    // Check permissions
    const canUpload = req.user.role === 'admin' ||
                     task.assignee?._id.toString() === req.user.id ||
                     task.createdBy.toString() === req.user.id ||
                     (req.user.role === 'manager' && task.project?.team?.toString() === req.user.team?.toString());

    if (!canUpload) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to upload attachments to this task' 
      });
    }

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files || req.files.file];
    const uploadedAttachments = [];
    const errors = [];

    for (const file of files) {
      const validationErrors = validateFile(file);
      if (validationErrors.length > 0) {
        errors.push({ filename: file.name, errors: validationErrors });
        continue;
      }

      try {
        const secureFilename = generateSecureFilename(file.name);
        const filePath = path.join(UPLOAD_DIR, secureFilename);
        
        // Save file
        await file.mv(filePath);
        
        // Process image if needed
        let processedPath = filePath;
        let processed = false;
        if (getFileCategory(file.mimetype) === 'image') {
          const processedFilename = `processed_${secureFilename}`;
          processedPath = path.join(UPLOAD_DIR, processedFilename);
          processed = await processImage(filePath, processedPath);
          
          if (processed) {
            // Remove original if processed version was created
            await fs.unlink(filePath);
            secureFilename = processedFilename;
          } else {
            processedPath = filePath;
          }
        }

        // Get file stats
        const stats = await fs.stat(processedPath);

        // Create attachment in database
        const attachment = await Attachment.create({
          filename: secureFilename,
          originalName: file.name,
          mimetype: file.mimetype,
          size: stats.size,
          path: processedPath,
          url: `/api/attachments/${secureFilename}`,
          task: task._id,
          uploadedBy: req.user.id,
          category: getFileCategory(file.mimetype),
          processed
        });

        // Add attachment to task
        task.attachments.push(attachment._id);
        
        uploadedAttachments.push(attachment);

        // Log activity
        await ActivityLog.create({
          user: req.user.id,
          action: 'upload',
          entityType: 'Attachment',
          entityId: attachment._id,
          metadata: {
            filename: file.name,
            size: stats.size,
            task: task._id,
            taskName: task.title
          }
        });

      } catch (fileError) {
        console.error('Error uploading file:', fileError);
        errors.push({ 
          filename: file.name, 
          errors: ['Failed to upload file'] 
        });
      }
    }

    await task.save();

    // Notify task assignee if different from uploader
    if (task.assignee && task.assignee._id.toString() !== req.user.id) {
      await Notification.create({
        user: task.assignee._id,
        content: `${req.user.name} uploaded ${uploadedAttachments.length} attachment(s) to task "${task.title}"`,
        type: 'task_update',
        relatedEntity: task._id,
        onModel: 'Task'
      });
    }

    res.status(201).json({
      success: true,
      message: `${uploadedAttachments.length} file(s) uploaded successfully`,
      data: uploadedAttachments,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error uploading task attachment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during file upload' 
    });
  }
};

// @desc    Upload attachment to comment
// @route   POST /api/comments/:commentId/attachments
// @access  Private
exports.uploadCommentAttachment = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No files were uploaded' 
      });
    }

    const comment = await Comment.findById(req.params.commentId)
      .populate('task', 'title assignee createdBy')
      .populate('author', 'name email');
      
    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }

    // Check permissions
    const canUpload = req.user.role === 'admin' ||
                     comment.author._id.toString() === req.user.id ||
                     comment.task?.assignee?.toString() === req.user.id ||
                     comment.task?.createdBy?.toString() === req.user.id;

    if (!canUpload) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to upload attachments to this comment' 
      });
    }

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files || req.files.file];
    const uploadedAttachments = [];
    const errors = [];

    for (const file of files) {
      const validationErrors = validateFile(file);
      if (validationErrors.length > 0) {
        errors.push({ filename: file.name, errors: validationErrors });
        continue;
      }

      try {
        const secureFilename = generateSecureFilename(file.name);
        const filePath = path.join(UPLOAD_DIR, secureFilename);
        
        // Save file
        await file.mv(filePath);
        
        // Process image if needed
        let processedPath = filePath;
        let processed = false;
        if (getFileCategory(file.mimetype) === 'image') {
          const processedFilename = `processed_${secureFilename}`;
          processedPath = path.join(UPLOAD_DIR, processedFilename);
          processed = await processImage(filePath, processedPath);
          
          if (processed) {
            await fs.unlink(filePath);
            secureFilename = processedFilename;
          } else {
            processedPath = filePath;
          }
        }

        const stats = await fs.stat(processedPath);

        // Create attachment in database
        const attachment = await Attachment.create({
          filename: secureFilename,
          originalName: file.name,
          mimetype: file.mimetype,
          size: stats.size,
          path: processedPath,
          url: `/api/attachments/${secureFilename}`,
          comment: comment._id,
          uploadedBy: req.user.id,
          category: getFileCategory(file.mimetype),
          processed
        });

        // Add attachment to comment
        comment.attachments.push(attachment._id);
        
        uploadedAttachments.push(attachment);

        // Log activity
        await ActivityLog.create({
          user: req.user.id,
          action: 'upload',
          entityType: 'Attachment',
          entityId: attachment._id,
          metadata: {
            filename: file.name,
            size: stats.size,
            comment: comment._id,
            task: comment.task?._id
          }
        });

      } catch (fileError) {
        console.error('Error uploading file:', fileError);
        errors.push({ 
          filename: file.name, 
          errors: ['Failed to upload file'] 
        });
      }
    }

    await comment.save();

    res.status(201).json({
      success: true,
      message: `${uploadedAttachments.length} file(s) uploaded successfully`,
      data: uploadedAttachments,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error uploading comment attachment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during file upload' 
    });
  }
};

// @desc    Get attachment by filename
// @route   GET /api/attachments/:filename
// @access  Private
exports.getAttachment = async (req, res) => {
  try {
    const filename = req.params.filename;
    const attachment = await Attachment.findOne({ filename })
      .populate('task', 'title assignee createdBy project')
      .populate('comment', 'task author')
      .populate('uploadedBy', 'name email');

    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: 'Attachment not found' 
      });
    }

    // Check permissions
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (attachment.task) {
      // For task attachments
      hasAccess = attachment.task.assignee?.toString() === req.user.id ||
                 attachment.task.createdBy?.toString() === req.user.id ||
                 attachment.uploadedBy._id.toString() === req.user.id;
    } else if (attachment.comment) {
      // For comment attachments
      const comment = attachment.comment;
      hasAccess = comment.author?.toString() === req.user.id ||
                 comment.task?.assignee?.toString() === req.user.id ||
                 comment.task?.createdBy?.toString() === req.user.id ||
                 attachment.uploadedBy._id.toString() === req.user.id;
    }

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access this attachment' 
      });
    }
    
    const filePath = attachment.path;
    
    if (!fsSync.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false,
        message: 'File not found on server' 
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Error getting attachment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while accessing file' 
    });
  }
};

// @desc    Download attachment with original filename
// @route   GET /api/attachments/:id/download
// @access  Private
exports.downloadAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id)
      .populate('task', 'title assignee createdBy')
      .populate('comment', 'task author')
      .populate('uploadedBy', 'name email');

    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: 'Attachment not found' 
      });
    }

    // Check permissions (same as getAttachment)
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (attachment.task) {
      hasAccess = attachment.task.assignee?.toString() === req.user.id ||
                 attachment.task.createdBy?.toString() === req.user.id ||
                 attachment.uploadedBy._id.toString() === req.user.id;
    } else if (attachment.comment) {
      const comment = attachment.comment;
      hasAccess = comment.author?.toString() === req.user.id ||
                 comment.task?.assignee?.toString() === req.user.id ||
                 comment.task?.createdBy?.toString() === req.user.id ||
                 attachment.uploadedBy._id.toString() === req.user.id;
    }

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to download this attachment' 
      });
    }

    if (!fsSync.existsSync(attachment.path)) {
      return res.status(404).json({ 
        success: false,
        message: 'File not found on server' 
      });
    }

    // Log download activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'download',
      entityType: 'Attachment',
      entityId: attachment._id,
      metadata: {
        filename: attachment.originalName,
        task: attachment.task?._id,
        comment: attachment.comment?._id
      }
    });

    // Set download headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    
    res.sendFile(path.resolve(attachment.path));
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while downloading file' 
    });
  }
};

// @desc    Get attachment metadata
// @route   GET /api/attachments/:id/info
// @access  Private
exports.getAttachmentInfo = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id)
      .populate('task', 'title')
      .populate('comment', 'content')
      .populate('uploadedBy', 'name email avatar');

    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: 'Attachment not found' 
      });
    }

    // Check if file exists on disk
    const fileExists = fsSync.existsSync(attachment.path);

    res.status(200).json({
      success: true,
      data: {
        ...attachment.toObject(),
        fileExists,
        uploadedAt: attachment.createdAt,
        sizeFormatted: formatFileSize(attachment.size)
      }
    });
  } catch (error) {
    console.error('Error getting attachment info:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while getting attachment info' 
    });
  }
};

// @desc    Get attachments with filtering and pagination
// @route   GET /api/attachments
// @access  Private (Admin/Manager)
exports.getAttachments = async (req, res) => {
  try {
    if (req.user.role === 'member') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to list all attachments' 
      });
    }

    const {
      category,
      task,
      comment,
      uploadedBy,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};
    
    if (category) filter.category = category;
    if (task) filter.task = task;
    if (comment) filter.comment = comment;
    if (uploadedBy) filter.uploadedBy = uploadedBy;
    
    if (search) {
      filter.originalName = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const attachments = await Attachment.find(filter)
      .populate('task', 'title status')
      .populate('comment', 'content')
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attachment.countDocuments(filter);

    // Add file existence check
    const attachmentsWithStatus = attachments.map(attachment => ({
      ...attachment.toObject(),
      fileExists: fsSync.existsSync(attachment.path),
      sizeFormatted: formatFileSize(attachment.size)
    }));

    res.status(200).json({
      success: true,
      count: attachments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: attachmentsWithStatus
    });
  } catch (error) {
    console.error('Error getting attachments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while getting attachments' 
    });
  }
};

// @desc    Delete attachment
// @route   DELETE /api/attachments/:id
// @access  Private
exports.deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id)
      .populate('task', 'title assignee createdBy')
      .populate('comment', 'task author');
    
    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: 'Attachment not found' 
      });
    }
    
    // Check permissions
    const canDelete = req.user.role === 'admin' ||
                     attachment.uploadedBy.toString() === req.user.id ||
                     (attachment.task && (
                       attachment.task.assignee?.toString() === req.user.id ||
                       attachment.task.createdBy?.toString() === req.user.id
                     )) ||
                     (attachment.comment && (
                       attachment.comment.author?.toString() === req.user.id ||
                       attachment.comment.task?.assignee?.toString() === req.user.id ||
                       attachment.comment.task?.createdBy?.toString() === req.user.id
                     ));

    if (!canDelete) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this attachment' 
      });
    }
    
    // Delete file from filesystem
    try {
      if (fsSync.existsSync(attachment.path)) {
        await fs.unlink(attachment.path);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with database cleanup even if file deletion fails
    }
    
    // Remove references from task or comment
    if (attachment.task) {
      await Task.findByIdAndUpdate(
        attachment.task._id,
        { $pull: { attachments: attachment._id } }
      );
    } else if (attachment.comment) {
      await Comment.findByIdAndUpdate(
        attachment.comment._id,
        { $pull: { attachments: attachment._id } }
      );
    }
    
    // Log activity before deletion
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'Attachment',
      entityId: attachment._id,
      metadata: {
        filename: attachment.originalName,
        size: attachment.size,
        task: attachment.task?._id,
        comment: attachment.comment?._id
      }
    });

    // Delete from database
    await Attachment.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting attachment' 
    });
  }
};

// @desc    Get storage statistics
// @route   GET /api/attachments/stats
// @access  Private (Admin/Manager)
exports.getStorageStats = async (req, res) => {
  try {
    if (req.user.role === 'member') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view storage statistics' 
      });
    }

    const stats = await Attachment.aggregate([
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          avgSize: { $avg: '$size' },
          imageFiles: {
            $sum: { $cond: [{ $eq: ['$category', 'image'] }, 1, 0] }
          },
          documentFiles: {
            $sum: { $cond: [{ $eq: ['$category', 'document'] }, 1, 0] }
          },
          archiveFiles: {
            $sum: { $cond: [{ $eq: ['$category', 'archive'] }, 1, 0] }
          },
          otherFiles: {
            $sum: { $cond: [{ $eq: ['$category', 'other'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalFiles: 0,
      totalSize: 0,
      avgSize: 0,
      imageFiles: 0,
      documentFiles: 0,
      archiveFiles: 0,
      otherFiles: 0
    };

    // Get top uploaders
    const topUploaders = await Attachment.aggregate([
      {
        $group: {
          _id: '$uploadedBy',
          fileCount: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          fileCount: 1,
          totalSize: 1,
          userName: '$user.name',
          userEmail: '$user.email'
        }
      },
      {
        $sort: { totalSize: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get recent uploads
    const recentUploads = await Attachment.find()
      .populate('uploadedBy', 'name email')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('originalName size category createdAt');

    res.status(200).json({
      success: true,
      data: {
        ...result,
        totalSizeFormatted: formatFileSize(result.totalSize),
        avgSizeFormatted: formatFileSize(result.avgSize),
        topUploaders: topUploaders.map(uploader => ({
          ...uploader,
          totalSizeFormatted: formatFileSize(uploader.totalSize)
        })),
        recentUploads: recentUploads.map(upload => ({
          ...upload.toObject(),
          sizeFormatted: formatFileSize(upload.size)
        }))
      }
    });
  } catch (error) {
    console.error('Error getting storage stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while getting storage statistics' 
    });
  }
};

// @desc    Bulk delete attachments
// @route   DELETE /api/attachments/bulk
// @access  Private (Admin only)
exports.bulkDeleteAttachments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can perform bulk operations' 
      });
    }

    const { attachmentIds } = req.body;
    
    if (!attachmentIds || !Array.isArray(attachmentIds) || attachmentIds.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide an array of attachment IDs' 
      });
    }

    const attachments = await Attachment.find({ _id: { $in: attachmentIds } });
    const deletedFiles = [];
    const errors = [];

    for (const attachment of attachments) {
      try {
        // Delete file from filesystem
        if (fsSync.existsSync(attachment.path)) {
          await fs.unlink(attachment.path);
        }

        // Remove references
        if (attachment.task) {
          await Task.findByIdAndUpdate(
            attachment.task,
            { $pull: { attachments: attachment._id } }
          );
        } else if (attachment.comment) {
          await Comment.findByIdAndUpdate(
            attachment.comment,
            { $pull: { attachments: attachment._id } }
          );
        }

        deletedFiles.push({
          id: attachment._id,
          filename: attachment.originalName
        });

        // Log activity
        await ActivityLog.create({
          user: req.user.id,
          action: 'bulk_delete',
          entityType: 'Attachment',
          entityId: attachment._id,
          metadata: {
            filename: attachment.originalName,
            bulkOperation: true
          }
        });

      } catch (fileError) {
        console.error('Error deleting attachment:', fileError);
        errors.push({
          id: attachment._id,
          filename: attachment.originalName,
          error: 'Failed to delete file'
        });
      }
    }

    // Delete from database
    await Attachment.deleteMany({ _id: { $in: attachmentIds } });

    res.status(200).json({
      success: true,
      message: `Bulk deletion completed. ${deletedFiles.length} files deleted successfully.`,
      data: {
        deleted: deletedFiles,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during bulk deletion' 
    });
  }
};

// @desc    Clean up orphaned files
// @route   POST /api/attachments/cleanup
// @access  Private (Admin only)
exports.cleanupOrphanedFiles = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can perform cleanup operations' 
      });
    }

    const attachments = await Attachment.find();
    const orphanedFiles = [];
    const missingFiles = [];

    // Check for missing files in database
    for (const attachment of attachments) {
      if (!fsSync.existsSync(attachment.path)) {
        missingFiles.push({
          id: attachment._id,
          filename: attachment.originalName,
          path: attachment.path
        });
      }
    }

    // Check for orphaned files in filesystem
    const uploadedFiles = await fs.readdir(UPLOAD_DIR);
    const dbFilenames = attachments.map(att => att.filename);
    
    for (const filename of uploadedFiles) {
      if (!dbFilenames.includes(filename)) {
        orphanedFiles.push(filename);
      }
    }

    // Optionally remove orphaned files
    if (req.body.removeOrphaned === true) {
      for (const filename of orphanedFiles) {
        try {
          await fs.unlink(path.join(UPLOAD_DIR, filename));
        } catch (error) {
          console.error(`Error deleting orphaned file ${filename}:`, error);
        }
      }
    }

    // Optionally remove missing file records
    if (req.body.removeMissing === true) {
      const missingIds = missingFiles.map(f => f.id);
      await Attachment.deleteMany({ _id: { $in: missingIds } });
    }

    res.status(200).json({
      success: true,
      message: 'Cleanup analysis completed',
      data: {
        orphanedFiles: orphanedFiles.length,
        missingFiles: missingFiles.length,
        orphanedFilesList: orphanedFiles,
        missingFilesList: missingFiles,
        actionsPerformed: {
          removedOrphaned: req.body.removeOrphaned === true,
          removedMissing: req.body.removeMissing === true
        }
      }
    });
  } catch (error) {
    console.error('Error in cleanup:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during cleanup operation' 
    });
  }
};

// Utility function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
