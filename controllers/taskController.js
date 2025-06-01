const Task = require('../models/Task');
const mongoose = require('mongoose');
const { createTaskNotification } = require('./notificationController');

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
    
    // Create notifications
    try {
      // Notify assignee if different from creator
      if (assignee && assignee !== req.user.id) {
        await createTaskNotification(assignee, 'task_assigned', savedTask._id, {
          taskTitle: title
        });
      }
      
      // Notify creator that task was created
      await createTaskNotification(req.user.id, 'task_created', savedTask._id, {
        taskTitle: title
      });    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the task creation if notifications fail
    }
    
    // Emit real-time task creation via WebSocket
    try {
      if (global.io) {
        global.io.emit('task_created', savedTask);
      }
    } catch (socketError) {
      console.error('Error emitting task creation:', socketError);
    }
    
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
    
    // Store original values for comparison
    const originalAssignee = task.assignee?.toString();
    const originalStatus = task.status;
    
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
      // Create notifications for task updates
    try {
      // If assignee changed, notify new assignee
      if (req.body.assignee && req.body.assignee !== originalAssignee) {
        await createTaskNotification(req.body.assignee, 'task_assigned', updatedTask._id, {
          taskTitle: updatedTask.title
        });
      }
      
      // If task completed, notify creator and assignee
      if (req.body.status === 'completed' && originalStatus !== 'completed') {
        if (updatedTask.assignee && updatedTask.assignee._id.toString() !== req.user.id) {
          await createTaskNotification(updatedTask.assignee._id, 'task_completed', updatedTask._id, {
            taskTitle: updatedTask.title
          });
        }
        if (updatedTask.creator._id.toString() !== req.user.id) {
          await createTaskNotification(updatedTask.creator._id, 'task_completed', updatedTask._id, {
            taskTitle: updatedTask.title
          });
        }
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the update if notifications fail
    }
    
    // Emit real-time update via WebSocket
    try {
      if (global.io) {
        // Broadcast to all connected users (you can make this more targeted if needed)
        global.io.emit('task_updated', updatedTask);
      }
    } catch (socketError) {
      console.error('Error emitting task update:', socketError);
    }
    
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