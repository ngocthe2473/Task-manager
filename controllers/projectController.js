const Project = require('../models/Project');
const Team = require('../models/Team');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let query = {};
    
    // For non-admin users, show only their team's projects
    if (req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      query.team = user.team;
    }

    const projects = await Project.find(query)
      .populate('team', 'name')
      .sort('-createdAt');
      
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Manager
exports.createProject = async (req, res) => {
  try {
    const { name, description, teamId, startDate, endDate } = req.body;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team manager or admin
    if (req.user.role !== 'admin' && team.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const project = await Project.create({
      name,
      description,
      team: teamId,
      startDate,
      endDate
    });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Project',
      entityId: project._id
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Private/Manager
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is team manager or admin
    const team = await Team.findById(project.team);
    if (req.user.role !== 'admin' && team.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.status = status;
    await project.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Project',
      entityId: project._id,
      metadata: { field: 'status', newValue: status }
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};