const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({})
    .populate('team', 'name')
    .sort({ createdAt: -1 });
  
  res.json(projects);
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('team', 'name members');

  if (!project) {
    res.status(404);
    throw new Error('Project không tồn tại');
  }

  res.json(project);
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { name, description, team, startDate, endDate } = req.body;

  const project = await Project.create({
    name,
    description,
    team,
    startDate,
    endDate,
  });

  const populatedProject = await Project.findById(project._id)
    .populate('team', 'name');

  res.status(201).json(populatedProject);
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project không tồn tại');
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('team', 'name');

  res.json(updatedProject);
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project không tồn tại');
  }

  // Xóa tất cả tasks thuộc project này
  await Task.deleteMany({ project: req.params.id });

  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project và tất cả task liên quan đã được xóa' });
});

// @desc    Get project statistics
// @route   GET /api/projects/:id/stats
// @access  Private
const getProjectStats = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project không tồn tại');
  }

  const totalTasks = await Task.countDocuments({ project: projectId });
  const todoTasks = await Task.countDocuments({ project: projectId, status: 'todo' });
  const inProgressTasks = await Task.countDocuments({ project: projectId, status: 'in_progress' });
  const doneTasks = await Task.countDocuments({ project: projectId, status: 'done' });

  const overdueTasks = await Task.countDocuments({
    project: projectId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' }
  });

  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  res.json({
    project: project.name,
    totalTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    overdueTasks,
    progress,
  });
});

// @desc    Get tasks by project
// @route   GET /api/projects/:id/tasks
// @access  Private
const getProjectTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ project: req.params.id })
    .populate('assignee', 'name email')
    .sort({ createdAt: -1 });
  
  res.json(tasks);
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getProjectTasks,
};