const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Cấu hình thư mục lưu trữ tệp
const UPLOAD_DIR = path.join(__dirname, '../uploads');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// @desc    Upload attachment to task
// @route   POST /api/tasks/:taskId/attachments
// @access  Private
exports.uploadTaskAttachment = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const file = req.files.file;
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Lưu tệp
    await file.mv(filePath);

    // Tạo attachment trong database
    const attachment = await Attachment.create({
      filename: fileName,
      originalName: file.name,
      mimetype: file.mimetype,
      size: file.size,
      path: filePath,
      url: `/api/attachments/${fileName}`,
      task: task._id,
      uploadedBy: req.user.id
    });

    // Thêm attachment vào task
    task.attachments.push(attachment._id);
    await task.save();

    res.status(201).json(attachment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload attachment to comment
// @route   POST /api/comments/:commentId/attachments
// @access  Private
exports.uploadCommentAttachment = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const file = req.files.file;
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Lưu tệp
    await file.mv(filePath);

    // Tạo attachment trong database
    const attachment = await Attachment.create({
      filename: fileName,
      originalName: file.name,
      mimetype: file.mimetype,
      size: file.size,
      path: filePath,
      url: `/api/attachments/${fileName}`,
      comment: comment._id,
      uploadedBy: req.user.id
    });

    // Thêm attachment vào comment
    comment.attachments.push(attachment._id);
    await comment.save();

    res.status(201).json(attachment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get attachment by filename
// @route   GET /api/attachments/:filename
// @access  Private
exports.getAttachment = async (req, res) => {
  try {
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete attachment
// @route   DELETE /api/attachments/:id
// @access  Private
exports.deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    
    // Kiểm tra quyền xóa
    if (attachment.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Xóa tệp
    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }
    
    // Xóa tham chiếu từ task hoặc comment
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
    
    // Xóa từ database
    await attachment.remove();
    
    res.json({ message: 'Attachment removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
