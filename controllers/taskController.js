const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'username email')
      .sort('-createdAt');
      
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a task
// @route   POST /api/projects/:projectId/tasks
// @access  Private/Manager
exports.createTask = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is team manager or admin
    const team = await Team.findById(project.team);
    if (req.user.role !== 'admin' && team.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, assigneeId, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      project: req.params.projectId,
      assignee: assigneeId,
      priority,
      dueDate
    });

    // Create notification if task is assigned
    if (assigneeId) {
      await Notification.create({
        user: assigneeId,
        content: `You have been assigned a new task: ${title}`,
        type: 'task_assigned',
        relatedEntity: task._id,
        onModel: 'Task'
      });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Task',
      entityId: task._id
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is task assignee or manager/admin
    const project = await Project.findById(task.project);
    const team = await Team.findById(project.team);
    
    const isAssignee = task.assignee && task.assignee.toString() === req.user.id;
    const isManagerOrAdmin = req.user.role === 'admin' || team.manager.toString() === req.user.id;
    
    if (!isAssignee && !isManagerOrAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.status = status;
    await task.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Task',
      entityId: task._id,
      metadata: { field: 'status', newValue: status }
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};