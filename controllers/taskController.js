const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    Lấy tất cả tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignee', 'name avatar')
      .populate('creator', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Lấy task theo ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name avatar')
      .populate('creator', 'name');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error getting task by ID:', error);
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