const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    // Chỉ lấy các root tasks (không phải subtasks)
    const tasks = await Task.find({ parentTask: null })
      .populate('assignee', 'name avatar')
      .populate('project', 'name')
      .sort('-createdAt');
      
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name avatar')
      .populate('project', 'name')
      .populate('attachments');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Lấy subtasks nếu có
    const subtasks = await Task.find({ parentTask: task._id })
      .populate('assignee', 'name avatar')
      .sort('createdAt');
    
    // Chuyển đổi Mongoose document sang plain object để có thể thêm trường
    const taskObj = task.toObject();
    taskObj.subtasks = subtasks;
    
    res.json(taskObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, status, priority, dueDate, parentTask } = req.body;
    
    // Kiểm tra project tồn tại không
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Nếu là subtask, kiểm tra parent task tồn tại không
    if (parentTask) {
      const parentTaskExists = await Task.findById(parentTask);
      if (!parentTaskExists) {
        return res.status(404).json({ message: 'Parent task not found' });
      }
    }
    
    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      status,
      priority,
      dueDate,
      parentTask: parentTask || null
    });
    
    // Populate thông tin cần thiết
    await task.populate('assignee', 'name avatar');
    await task.populate('project', 'name');
    
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, dueDate } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Cập nhật task fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;
    
    await task.save();
    
    // Populate thông tin
    await task.populate('assignee', 'name avatar');
    await task.populate('project', 'name');
    
    res.json(task);
  } catch (error) {
    console.error(error);
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
    
    // Xóa tất cả subtasks nếu có
    await Task.deleteMany({ parentTask: task._id });
    
    await task.remove();
    
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get subtasks for a task
// @route   GET /api/tasks/:id/subtasks
// @access  Private
exports.getSubtasks = async (req, res) => {
  try {
    const subtasks = await Task.find({ parentTask: req.params.id })
      .populate('assignee', 'name avatar')
      .sort('createdAt');
      
    res.json(subtasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};