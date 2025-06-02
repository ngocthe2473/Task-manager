const SubTask = require('../models/SubTask');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// @desc    Get all subtasks for a task
// @route   GET /api/tasks/:taskId/subtasks
// @access  Private
exports.getSubTasks = async (req, res) => {
  try {
    const { status, assignee, priority } = req.query;
    
    // Build filter object
    const filter = { parentTask: req.params.taskId };
    
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (priority) filter.priority = priority;

    const subtasks = await SubTask.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('parentTask', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: subtasks.length,
      data: subtasks
    });
  } catch (error) {
    console.error('Error getting subtasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get subtask by ID
// @route   GET /api/subtasks/:id
// @access  Private
exports.getSubTaskById = async (req, res) => {
  try {
    const subtask = await SubTask.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('parentTask', 'title project')
      .populate({
        path: 'parentTask',
        populate: {
          path: 'project',
          select: 'name'
        }
      });

    if (!subtask) {
      return res.status(404).json({ message: 'SubTask not found' });
    }

    res.status(200).json({
      success: true,
      data: subtask
    });
  } catch (error) {
    console.error('Error getting subtask:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new subtask
// @route   POST /api/tasks/:taskId/subtasks
// @access  Private
exports.createSubTask = async (req, res) => {
  try {
    const { title, description, assignee, priority, dueDate } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Check if parent task exists
    const parentTask = await Task.findById(req.params.taskId);
    if (!parentTask) {
      return res.status(404).json({ message: 'Parent task not found' });
    }

    // Check if assignee exists (if provided)
    if (assignee) {
      const assigneeUser = await User.findById(assignee);
      if (!assigneeUser) {
        return res.status(404).json({ message: 'Assignee not found' });
      }
    }

    const subtask = await SubTask.create({
      title,
      description,
      parentTask: req.params.taskId,
      assignee,
      priority: priority || 'medium',
      dueDate,
      creator: req.user.id
    });

    const populatedSubTask = await SubTask.findById(subtask._id)
      .populate('assignee', 'name email avatar')
      .populate('parentTask', 'title')
      .populate('creator', 'name');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'SubTask',
      entityId: subtask._id,
      metadata: {
        parentTask: req.params.taskId,
        title: title
      }
    });

    // Send notification to assignee if different from creator
    if (assignee && assignee !== req.user.id) {
      await Notification.create({
        user: assignee,
        content: `You have been assigned a new subtask: ${title}`,
        type: 'task_assigned',
        relatedEntity: subtask._id,
        onModel: 'SubTask'
      });
    }

    res.status(201).json({
      success: true,
      data: populatedSubTask
    });
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update subtask
// @route   PUT /api/subtasks/:id
// @access  Private
exports.updateSubTask = async (req, res) => {
  try {
    const subtask = await SubTask.findById(req.params.id);

    if (!subtask) {
      return res.status(404).json({ message: 'SubTask not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        subtask.assignee?.toString() !== req.user.id && 
        subtask.creator?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this subtask' });
    }

    const oldStatus = subtask.status;
    const oldAssignee = subtask.assignee;

    // Update subtask
    const updatedSubTask = await SubTask.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('assignee', 'name email avatar')
      .populate('parentTask', 'title')
      .populate('creator', 'name');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'SubTask',
      entityId: subtask._id,
      metadata: {
        changes: req.body,
        oldStatus,
        newStatus: updatedSubTask.status
      }
    });

    // Send notifications for important changes
    if (req.body.status && req.body.status !== oldStatus) {
      // Notify assignee about status change
      if (updatedSubTask.assignee && updatedSubTask.assignee._id.toString() !== req.user.id) {
        await Notification.create({
          user: updatedSubTask.assignee._id,
          content: `SubTask "${updatedSubTask.title}" status changed to ${req.body.status}`,
          type: 'task_assigned',
          relatedEntity: updatedSubTask._id,
          onModel: 'SubTask'
        });
      }
    }

    // Notify new assignee if assignee changed
    if (req.body.assignee && req.body.assignee !== oldAssignee?.toString()) {
      await Notification.create({
        user: req.body.assignee,
        content: `You have been assigned to subtask: ${updatedSubTask.title}`,
        type: 'task_assigned',
        relatedEntity: updatedSubTask._id,
        onModel: 'SubTask'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSubTask
    });
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete subtask
// @route   DELETE /api/subtasks/:id
// @access  Private
exports.deleteSubTask = async (req, res) => {
  try {
    const subtask = await SubTask.findById(req.params.id);

    if (!subtask) {
      return res.status(404).json({ message: 'SubTask not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        subtask.creator?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this subtask' });
    }

    await SubTask.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'SubTask',
      entityId: req.params.id,
      metadata: {
        title: subtask.title,
        parentTask: subtask.parentTask
      }
    });

    res.status(200).json({
      success: true,
      message: 'SubTask deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my subtasks
// @route   GET /api/subtasks/my
// @access  Private
exports.getMySubTasks = async (req, res) => {
  try {
    const { status, priority, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;
    
    const filter = { assignee: req.user.id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const subtasks = await SubTask.find(filter)
      .populate('parentTask', 'title project')
      .populate({
        path: 'parentTask',
        populate: {
          path: 'project',
          select: 'name'
        }
      })
      .sort(sort);

    res.status(200).json({
      success: true,
      count: subtasks.length,
      data: subtasks
    });
  } catch (error) {
    console.error('Error getting my subtasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update subtask status
// @route   PATCH /api/subtasks/:id/status
// @access  Private
exports.updateSubTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['todo', 'in_progress', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const subtask = await SubTask.findById(req.params.id);
    
    if (!subtask) {
      return res.status(404).json({ message: 'SubTask not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        subtask.assignee?.toString() !== req.user.id && 
        subtask.creator?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this subtask' });
    }

    const oldStatus = subtask.status;
    subtask.status = status;
    subtask.updatedAt = Date.now();
    
    if (status === 'done') {
      subtask.completedAt = new Date();
    }
    
    await subtask.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'SubTask',
      entityId: subtask._id,
      metadata: {
        statusChange: { from: oldStatus, to: status }
      }
    });

    const populatedSubTask = await SubTask.findById(subtask._id)
      .populate('assignee', 'name email avatar')
      .populate('parentTask', 'title');

    res.status(200).json({
      success: true,
      data: populatedSubTask
    });  } catch (error) {    console.error('Error updating subtask status:', error);    res.status(500).json({ message: 'Server error' });
  }
};
