const Task = require('../models/Task');
const SubTask = require('../models/SubTask');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get all tasks with filtering and searching
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignee,
      project,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dueDate
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (project) filter.project = project;
    if (dueDate) {
      const date = new Date(dueDate);
      filter.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-based filtering
    if (req.user.role === 'member') {
      filter.$or = [
        { assignee: req.user.id },
        { creator: req.user.id }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email username')
      .populate('creator', 'name email username')
      .populate('project', 'name description')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      data: tasks
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task by ID with subtasks
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email username')
      .populate('creator', 'name email username')
      .populate('project', 'name description team');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get subtasks
    const subtasks = await SubTask.find({ parentTask: task._id })
      .populate('assignee', 'name email username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...task.toObject(),
        subtasks
      }
    });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignee,
      priority = 'medium',
      dueDate,
      estimatedHours,
      tags
    } = req.body;    // Validation
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Check if project exists (if provided)
    if (project) {
      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return res.status(404).json({ message: 'Project not found' });
      }
    }

    // Check if assignee exists
    if (assignee) {
      const assigneeExists = await User.findById(assignee);
      if (!assigneeExists) {
        return res.status(404).json({ message: 'Assignee not found' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      creator: req.user.id,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours,
      tags: tags || []
    });

    await task.populate([
      { path: 'assignee', select: 'name email username' },
      { path: 'creator', select: 'name email username' },
      { path: 'project', select: 'name description' }
    ]);    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Task',
      entityId: task._id,
      metadata: { 
        title: task.title, 
        project: project ? (await Project.findById(project))?.name : 'No Project' 
      }
    });

    // Create notification for assignee
    if (assignee && assignee !== req.user.id) {
      await Notification.create({
        user: assignee,
        content: `You have been assigned a new task: ${title}`,
        type: 'task_assigned',
        relatedEntity: task._id,
        onModel: 'Task'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        task.creator.toString() !== req.user.id &&
        task.assignee?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const oldAssignee = task.assignee;
    const oldStatus = task.status;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      { path: 'assignee', select: 'name email username' },
      { path: 'creator', select: 'name email username' },
      { path: 'project', select: 'name description' }
    ]);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Task',
      entityId: task._id,
      metadata: { 
        title: task.title,
        changes: Object.keys(req.body)
      }
    });

    // Create notifications for changes
    if (req.body.assignee && req.body.assignee !== oldAssignee?.toString()) {
      await Notification.create({
        user: req.body.assignee,
        content: `You have been assigned to task: ${task.title}`,
        type: 'task_assigned',
        relatedEntity: task._id,
        onModel: 'Task'
      });
    }

    if (req.body.status && req.body.status !== oldStatus) {
      // Notify relevant users about status change
      const notifyUsers = [task.creator, task.assignee].filter(user => 
        user && user.toString() !== req.user.id
      );
      
      for (const userId of notifyUsers) {
        await Notification.create({
          user: userId,
          content: `Task "${task.title}" status changed to ${req.body.status}`,
          type: 'task_assigned',
          relatedEntity: task._id,
          onModel: 'Task'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        task.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    // Delete associated subtasks
    await SubTask.deleteMany({ parentTask: task._id });

    // Delete the task
    await Task.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'Task',
      entityId: task._id,
      metadata: { title: task.title }
    });

    res.status(200).json({
      success: true,
      message: 'Task and associated subtasks deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get tasks by project
// @route   GET /api/tasks/project/:projectId
// @access  Private
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assignee } = req.query;

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email username')
      .populate('creator', 'name email username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting project tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
exports.getMyTasks = async (req, res) => {
  try {
    const { status, priority } = req.query;

    const filter = {
      $or: [
        { assignee: req.user.id },
        { creator: req.user.id }
      ]
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email username')
      .populate('creator', 'name email username')
      .populate('project', 'name description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting my tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign task to user
// @route   PUT /api/tasks/:id/assign
// @access  Private
exports.assignTask = async (req, res) => {
  try {
    const { assignee } = req.body;

    if (!assignee) {
      return res.status(400).json({ message: 'Assignee is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if assignee exists
    const assigneeUser = await User.findById(assignee);
    if (!assigneeUser) {
      return res.status(404).json({ message: 'Assignee not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        task.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to assign this task' });
    }

    task.assignee = assignee;
    task.updatedAt = new Date();
    await task.save();

    await task.populate([
      { path: 'assignee', select: 'name email username' },
      { path: 'creator', select: 'name email username' },
      { path: 'project', select: 'name description' }
    ]);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Task',
      entityId: task._id,
      metadata: { 
        action: 'assign_task',
        assignee: assigneeUser.name,
        title: task.title
      }
    });

    // Create notification
    if (assignee !== req.user.id) {
      await Notification.create({
        user: assignee,
        content: `You have been assigned to task: ${task.title}`,
        type: 'task_assigned',
        relatedEntity: task._id,
        onModel: 'Task'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      data: task
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['todo', 'in_progress', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        task.creator.toString() !== req.user.id &&
        task.assignee?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task status' });
    }

    const oldStatus = task.status;
    task.status = status;
    task.updatedAt = new Date();
    
    if (status === 'done') {
      task.completedAt = new Date();
    }

    await task.save();

    await task.populate([
      { path: 'assignee', select: 'name email username' },
      { path: 'creator', select: 'name email username' },
      { path: 'project', select: 'name description' }
    ]);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Task',
      entityId: task._id,
      metadata: { 
        action: 'status_change',
        oldStatus,
        newStatus: status,
        title: task.title
      }
    });

    // Notify relevant users
    const notifyUsers = [task.creator, task.assignee].filter(user => 
      user && user.toString() !== req.user.id
    );
    
    for (const userId of notifyUsers) {
      await Notification.create({
        user: userId,
        content: `Task "${task.title}" status changed to ${status}`,
        type: 'task_assigned',
        relatedEntity: task._id,
        onModel: 'Task'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    const { projectId, userId, period = '30' } = req.query;

    // Build filter for date range
    const dateFilter = {
      createdAt: {
        $gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)
      }
    };

    // Build additional filters
    const filter = { ...dateFilter };
    if (projectId) filter.project = projectId;
    if (userId) {
      filter.$or = [
        { assignee: userId },
        { creator: userId }
      ];
    }

    // Role-based filtering
    if (req.user.role === 'member') {
      filter.$or = [
        { assignee: req.user.id },
        { creator: req.user.id }
      ];
    }

    const stats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          todoTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          highPriorityTasks: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'done'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalTasks: 0,
      todoTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      highPriorityTasks: 0,
      overdueTasks: 0
    };    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting task stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Tạo task mới
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      status, 
      priority, 
      dueDate, 
      startTime, 
      endTime, 
      assignee, 
      project 
    } = req.body;
    
    // Xác nhận title
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Tạo task mới
    const newTask = new Task({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      startTime,
      endTime,
      assignee: assignee || null,
      creator: req.user.id,
      project: project || null
    });
    
    const savedTask = await newTask.save();
    
    // Populate assignee & creator
    await savedTask.populate('assignee', 'name avatar');
    await savedTask.populate('creator', 'name');
    
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cập nhật task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Cập nhật các trường
    const updatedData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      updatedData, 
      { new: true }
    ).populate('assignee', 'name avatar')
      .populate('creator', 'name');
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Xóa task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};