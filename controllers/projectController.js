const Project = require('../models/Project');
const Team = require('../models/Team');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// @desc    Get all projects with filtering
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const { 
      status,
      team,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (team) filter.team = team;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-based filtering
    if (req.user.role === 'member') {
      // Members can only see projects from their team
      if (req.user.team) {
        filter.team = req.user.team;
      } else {
        // If user has no team, they can't see any projects
        filter.team = null;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(filter)
      .populate({
        path: 'team',
        select: 'name members manager',
        populate: {
          path: 'manager',
          select: 'name email'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: projects
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project by ID with tasks and progress
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'team',
        select: 'name members manager',
        populate: [
          {
            path: 'manager',
            select: 'name email avatar'
          },
          {
            path: 'members',
            select: 'name email avatar'
          }
        ]
      });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    if (req.user.role === 'member' &&
        project.team &&
        !project.team.members.some(member => member._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    // Get project tasks and calculate progress
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignee', 'name email avatar')
      .sort({ createdAt: -1 });

    const taskStats = {
      total: tasks.length,
      todo: tasks.filter(task => task.status === 'todo').length,
      inProgress: tasks.filter(task => task.status === 'in_progress').length,
      completed: tasks.filter(task => task.status === 'done').length,
      overdue: tasks.filter(task =>
        task.dueDate &&
        task.dueDate < new Date() &&
        task.status !== 'done'
      ).length
    };

    const progress = taskStats.total > 0 
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        tasks,
        taskStats,
        progress
      }
    });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin/Manager)
exports.createProject = async (req, res) => {
  try {
    const { name, description, team, startDate, endDate, status } = req.body;

    // Validate required fields
    if (!name || !team) {
      return res.status(400).json({ message: 'Name and team are required' });
    }

    // Check permissions
    // User role is already validated by authMiddleware, let's ensure only admin or specific manager can create
    // For this scenario, we assume an admin can create for any team,
    // and a user (who would be a project creator) can create a project and by extension a team where they are leader.

    let teamDoc = await Team.findById(team);
    if (!teamDoc) {
      // If team doesn't exist, and user is not admin, they might be creating a new team with this project
      // This part of logic might need adjustment based on how teams are managed (e.g., can users create teams?)
      // For now, let's assume the team must exist or be created in a separate step if not by an admin.
      // However, the request implies the project creator becomes leader, suggesting a team might be implicitly formed or assigned.
      
      // Simplified: if a team ID is provided, it must exist.
      // If team management allows users to create teams implicitly with projects, this needs more logic.
      return res.status(404).json({ message: 'Team not found. Please ensure the team exists.' });
    }    // Add project creator as a leader to the team if not already a member, or update their role to leader
    if (!teamDoc.isMember(req.user.id)) {
      teamDoc.addMember(req.user.id, 'leader');
    } else if (!teamDoc.isLeader(req.user.id)) {
      teamDoc.changeRole(req.user.id, 'leader');
    }
    await teamDoc.save();

    const project = await Project.create({
      name,
      description,
      team: teamDoc._id, // Ensure we use the ID of the (potentially updated) teamDoc
      startDate,
      endDate,
      status: status || 'planning',
      createdBy: req.user.id
    });

    const populatedProject = await Project.findById(project._id)
      .populate({
        path: 'team',
        select: 'name members manager',
        populate: {
          path: 'manager',
          select: 'name email'
        }
      });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Project',
      entityId: project._id,
      metadata: {
        name: name,
        team: team
      }
    });

    // Notify team members
    const teamMembers = teamDoc.members.filter(memberId =>
      memberId.toString() !== req.user.id
    );
    
    if (teamMembers.length > 0) {
      const notifications = teamMembers.map(memberId => ({
        user: memberId,
        content: `New project "${name}" has been created for your team`,
        type: 'project_update',
        relatedEntity: project._id,
        onModel: 'Project'
      }));
      
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin/Manager)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('team');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    if (req.user.role === 'member') {
      return res.status(403).json({ message: 'Not authorized to update projects' });
    }

    if (req.user.role === 'manager' &&
        project.team &&
        project.team.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const oldStatus = project.status;
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate({
      path: 'team',
      select: 'name members manager',
      populate: {
        path: 'manager',
        select: 'name email'
      }
    });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Project',
      entityId: project._id,
      metadata: {
        changes: req.body,
        oldStatus,
        newStatus: updatedProject.status
      }
    });

    // Notify team if status changed
    if (req.body.status && req.body.status !== oldStatus && project.team) {
      const teamMembers = project.team.members.filter(memberId =>
        memberId.toString() !== req.user.id
      );
      
      if (teamMembers.length > 0) {
        const notifications = teamMembers.map(memberId => ({
          user: memberId,
          content: `Project "${project.name}" status changed to ${req.body.status}`,
          type: 'project_update',
          relatedEntity: project._id,
          onModel: 'Project'
        }));
        
        await Notification.insertMany(notifications);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin/Manager)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('team');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    if (req.user.role === 'member') {
      return res.status(403).json({ message: 'Not authorized to delete projects' });
    }

    if (req.user.role === 'manager' &&
        project.team &&
        project.team.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Check if project has tasks
    const taskCount = await Task.countDocuments({ project: req.params.id });
    if (taskCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete project with existing tasks. Please remove or reassign tasks first.'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'Project',
      entityId: req.params.id,
      metadata: {
        name: project.name,
        team: project.team?._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/:id/stats
// @access  Private
exports.getProjectStats = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const stats = await Task.aggregate([
      { $match: { project: project._id } },
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
    };

    // Calculate progress percentage
    result.progress = result.totalTasks > 0 
      ? Math.round((result.completedTasks / result.totalTasks) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting project stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my projects
// @route   GET /api/projects/my
// @access  Private
exports.getMyProjects = async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (status) filter.status = status;

    // Filter based on user's team
    if (req.user.team) {
      filter.team = req.user.team;
    } else {
      // If user has no team, return empty array
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(filter)
      .populate({
        path: 'team',
        select: 'name manager'
      })
      .sort(sort);

    // Add task statistics for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
              }
            }
          }
        ]);

        const stats = taskStats[0] || { total: 0, completed: 0 };
        const progress = stats.total > 0 
          ? Math.round((stats.completed / stats.total) * 100)
          : 0;

        return {
          ...project.toObject(),
          taskStats: stats,
          progress
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithStats.length,
      data: projectsWithStats
    });
  } catch (error) {
    console.error('Error getting my projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};