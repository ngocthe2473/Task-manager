const asyncHandler = require('express-async-handler');
const SubTask = require('../models/SubTask');
const Task = require('../models/Task');

// @desc    Get all subtasks for a task
// @route   GET /api/tasks/:taskId/subtasks
// @access  Private
const getSubTasks = asyncHandler(async (req, res) => {
  const subtasks = await SubTask.find({ parentTask: req.params.taskId })
    .populate('assignee', 'name email')
    .sort({ createdAt: -1 });
  
  res.json(subtasks);
});

// @desc    Create new subtask
// @route   POST /api/tasks/:taskId/subtasks
// @access  Private
const createSubTask = asyncHandler(async (req, res) => {
  const { title, description, assignee, priority, dueDate } = req.body;
  
  // Kiểm tra task cha có tồn tại
  const parentTask = await Task.findById(req.params.taskId);
  if (!parentTask) {
    res.status(404);
    throw new Error('Task không tồn tại');
  }

  const subtask = await SubTask.create({
    title,
    description,
    parentTask: req.params.taskId,
    assignee,
    priority,
    dueDate,
  });

  const populatedSubTask = await SubTask.findById(subtask._id)
    .populate('assignee', 'name email');

  res.status(201).json(populatedSubTask);
});

// @desc    Update subtask
// @route   PUT /api/subtasks/:id
// @access  Private
const updateSubTask = asyncHandler(async (req, res) => {
  const subtask = await SubTask.findById(req.params.id);

  if (!subtask) {
    res.status(404);
    throw new Error('SubTask không tồn tại');
  }

  const updatedSubTask = await SubTask.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('assignee', 'name email');

  res.json(updatedSubTask);
});

// @desc    Delete subtask
// @route   DELETE /api/subtasks/:id
// @access  Private
const deleteSubTask = asyncHandler(async (req, res) => {
  const subtask = await SubTask.findById(req.params.id);

  if (!subtask) {
    res.status(404);
    throw new Error('SubTask không tồn tại');
  }

  await SubTask.findByIdAndDelete(req.params.id);
  res.json({ message: 'SubTask đã được xóa' });
});

// @desc    Get subtask by ID
// @route   GET /api/subtasks/:id
// @access  Private
const getSubTaskById = asyncHandler(async (req, res) => {
  const subtask = await SubTask.findById(req.params.id)
    .populate('assignee', 'name email')
    .populate('parentTask', 'title');

  if (!subtask) {
    res.status(404);
    throw new Error('SubTask không tồn tại');
  }

  res.json(subtask);
});

module.exports = {
  getSubTasks,
  createSubTask,
  updateSubTask,
  deleteSubTask,
  getSubTaskById,
};
