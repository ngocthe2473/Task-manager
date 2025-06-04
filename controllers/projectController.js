const Project = require('../models/Project');
const Team = require('../models/Team');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// Helper function to check if user is team leader for a project
const isUserTeamLeaderForProject = async (userId, projectId) => {
  try {
    const project = await Project.findById(projectId).populate('team');
    if (!project || !project.team) return false;
    
    return project.team.isLeader(userId);
  } catch (error) {
    console.error('Error checking team leader status for project:', error);
    return false;
  }
};

// Helper function to check if user is team leader in any team
const isUserTeamLeader = async (userId) => {
  try {
    const team = await Team.findOne({
      'members.user': userId,
      'members.team_role': 'leader'
    });
    
    return !!team;
  } catch (error) {
    console.error('Error checking team leader status:', error);
    return false;
  }
};

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

    // Hiển thị project do user tạo hoặc là thành viên team liên quan
    const userId = req.user.id;
    const userTeams = await Team.find({ 'members.user': userId }).distinct('_id');
    filter.$or = [
      { createdBy: userId },
      { team: { $in: userTeams } }
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(filter)
      .populate({
        path: 'team',
        select: 'name members'
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
    }    // Check permissions
    let teamDoc = await Team.findById(team);
    if (!teamDoc) {
      return res.status(404).json({ message: 'Team not found. Please ensure the team exists.' });
    }

    // Check if user is admin or team leader for this team
    if (req.user.role !== 'admin' && !teamDoc.isLeader(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized. Only team leaders can create projects for their team.' });
    }

    // Check for duplicate project name in the same team
    const existingProject = await Project.findOne({ name: name.trim(), team: teamDoc._id });
    if (existingProject) {
      return res.status(409).json({ message: 'A project with this name already exists in the team.' });
    }

    const project = await Project.create({
      name: name.trim(),
      description,
      team: teamDoc._id,
      startDate,
      endDate,
      status: status || 'planning',
      createdBy: req.user.id
    });

    // Team schema không có trường 'manager', chỉ populate 'name members'
    const populatedProject = await Project.findById(project._id)
      .populate({
        path: 'team',
        select: 'name members'
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
    }    // Check permissions
    const isTeamLeader = await isUserTeamLeaderForProject(req.user.id, req.params.id);
    if (req.user.role !== 'admin' && !isTeamLeader) {
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
    }    // Check permissions
    const isTeamLeader = await isUserTeamLeaderForProject(req.user.id, req.params.id);
    if (req.user.role !== 'admin' && !isTeamLeader) {
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
    const { teamId } = req.query;
    const filter = teamId ? { team: teamId } : {};
    const total = await Project.countDocuments(filter);
    const completed = await Project.countDocuments({ ...filter, status: 'completed' });
    res.json({ data: { total, completed } });
  } catch (error) {
    console.error('Project stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my projects
// @route   GET /api/projects/my
// @access  Private
exports.getMyProjects = async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // First, find all teams where the user is a member
    const userTeams = await Team.find({
      'members.user': req.user._id
    }).select('_id');

    if (userTeams.length === 0) {
      // If user is not a member of any team, return empty array
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const teamIds = userTeams.map(team => team._id);

    const filter = {
      team: { $in: teamIds }
    };
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(filter)
      .populate({
        path: 'team',
        select: 'name description members'
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

// Tìm kiếm project theo tên (ai đăng nhập cũng dùng được)
exports.searchProjects = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) return res.json({ data: [] });
    const projects = await Project.find({
      name: { $regex: q, $options: 'i' }
    }).select('_id name description status');
    res.json({ data: projects });
  } catch (error) {
    console.error('Search projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project analytics and statistics
// @route   GET /api/projects/analytics
// @access  Private
exports.getProjectAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find teams where user is a member
    const teams = await Team.find({
      'members.user': userId
    });
    
    const teamIds = teams.map(team => team._id);
    
    // Get projects for user's teams
    const projects = await Project.find({
      team: { $in: teamIds }
    }).populate('team', 'name').populate('createdBy', 'name email');

    const analytics = [];

    for (const project of projects) {
      // Get tasks for this project
      const projectTasks = await Task.find({
        project: project._id
      }).populate('assignee', 'name email avatar');

      // Calculate project statistics
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(task => task.status === 'done').length;
      const inProgressTasks = projectTasks.filter(task => task.status === 'in-progress').length;
      const todoTasks = projectTasks.filter(task => task.status === 'todo').length;
      const reviewTasks = projectTasks.filter(task => task.status === 'review').length;
      
      const overdueTasks = projectTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
      ).length;

      // Calculate priority distribution
      const priorityStats = {
        low: projectTasks.filter(task => task.priority === 'low').length,
        medium: projectTasks.filter(task => task.priority === 'medium').length,
        high: projectTasks.filter(task => task.priority === 'high').length,
        urgent: projectTasks.filter(task => task.priority === 'urgent').length
      };

      // Calculate completion rate
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Get team members working on this project
      const teamMembers = await Team.findById(project.team).populate('members.user', 'name email avatar');
      const memberStats = teamMembers ? teamMembers.members.map(member => {
        const memberTasks = projectTasks.filter(task => 
          task.assignee && task.assignee._id.toString() === member.user._id.toString()
        );
        
        return {
          userId: member.user._id,
          name: member.user.name,
          email: member.user.email,
          avatar: member.user.avatar,
          role: member.team_role,
          assignedTasks: memberTasks.length,
          completedTasks: memberTasks.filter(task => task.status === 'done').length,
          completionRate: memberTasks.length > 0 ? 
            Math.round((memberTasks.filter(task => task.status === 'done').length / memberTasks.length) * 100) : 0
        };
      }) : [];

      analytics.push({
        projectId: project._id,
        projectName: project.name,
        description: project.description,
        status: project.status,
        teamName: project.team?.name,
        createdBy: project.createdBy?.name,
        createdAt: project.createdAt,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        reviewTasks,
        overdueTasks,
        completionRate,
        priorityStats,
        memberStats,
        progress: project.progress || 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        projects: analytics,
        summary: {
          totalProjects: analytics.length,
          activeProjects: analytics.filter(p => p.status === 'active').length,
          completedProjects: analytics.filter(p => p.status === 'completed').length,
          averageCompletion: analytics.length > 0 ? 
            Math.round(analytics.reduce((sum, p) => sum + p.completionRate, 0) / analytics.length) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting project analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Search projects with detailed results
// @route   GET /api/projects/detailed-search
// @access  Private
exports.detailedSearchProjects = async (req, res) => {
  try {
    const { q, limit = 10, status, team } = req.query;
    const userId = req.user.id;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search criteria
    let searchCriteria = {};
    
    // Text search
    const searchRegex = new RegExp(q.trim(), 'i');
    searchCriteria.$or = [
      { name: searchRegex },
      { description: searchRegex }
    ];

    // Status filter
    if (status) {
      searchCriteria.status = status;
    }

    // Team filter
    if (team) {
      searchCriteria.team = team;
    }

    // Find user's teams for access control
    const userTeams = await Team.find({
      'members.user': userId
    });
    const teamIds = userTeams.map(team => team._id);
    
    // Only show projects from user's teams
    searchCriteria.team = { $in: teamIds };

    const projects = await Project.find(searchCriteria)
      .populate('team', 'name description')
      .populate('createdBy', 'name email avatar')
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 });

    // Add task statistics for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'done').length;
        
        return {
          ...project.toObject(),
          taskStats: {
            total: totalTasks,
            completed: completedTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: projectsWithStats
    });
  } catch (error) {
    console.error('Error in detailed search projects:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Advanced search for projects (multi-filter, sort, pagination)
// @route   GET /api/projects/advanced-search
// @access  Private
exports.advancedSearchProjects = async (req, res) => {
  try {
    const {
      q = '',
      status,
      team,
      createdBy,
      fromDate,
      toDate,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;
    const filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { name: regex },
        { description: regex }
      ];
    }
    if (status) filter.status = status;
    if (team) filter.team = team;
    if (createdBy) filter.createdBy = createdBy;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('team', 'name')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(filter)
    ]);
    res.json({ success: true, data: projects, total });
  } catch (error) {
    console.error('Advanced search projects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Advanced analytics for projects
// @route   GET /api/projects/advanced-analytics
// @access  Private
exports.advancedProjectAnalytics = async (req, res) => {
  try {
    const { fromDate, toDate, team } = req.query;
    const filter = {};
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    if (team) filter.team = team;
    const projects = await Project.find(filter);
    const byStatus = {};
    const byTeam = {};
    projects.forEach(project => {
      byStatus[project.status] = (byStatus[project.status] || 0) + 1;
      if (project.team) {
        byTeam[project.team] = (byTeam[project.team] || 0) + 1;
      }
    });
    res.json({ success: true, stats: { byStatus, byTeam, total: projects.length } });
  } catch (error) {
    console.error('Advanced project analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Autocomplete for project name
// @route   GET /api/projects/autocomplete
// @access  Private
exports.autocompleteProjectName = async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;
    if (!q) return res.json({ data: [] });
    const regex = new RegExp(q, 'i');
    const projects = await Project.find({ name: regex }).select('name').limit(parseInt(limit));
    res.json({ data: projects });
  } catch (error) {
    console.error('Autocomplete project name error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export projects to CSV (filtered)
// @route   GET /api/projects/export
// @access  Private
exports.exportProjectsCSV = async (req, res) => {
  try {
    const { status, team } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (team) filter.team = team;
    const projects = await Project.find(filter)
      .populate('team', 'name')
      .populate('createdBy', 'name email');
    let csv = 'Name,Description,Status,Team,CreatedBy,CreatedAt\n';
    projects.forEach(p => {
      csv += `"${p.name}","${p.description}",${p.status},${p.team?.name || ''},${p.createdBy?.name || ''},${p.createdAt ? p.createdAt.toISOString().split('T')[0] : ''}\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('projects.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export projects CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Dashboard summary for projects
// @route   GET /api/projects/dashboard-summary
// @access  Private
exports.projectDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    // Tổng số project, số project theo trạng thái, số team, số project tạo trong tuần
    const [projects, teams] = await Promise.all([
      Project.find({ $or: [{ createdBy: userId }, { team: { $in: await Team.find({ 'members.user': userId }).distinct('_id') } }] }),
      Team.find({ 'members.user': userId })
    ]);
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    const summary = {
      totalProjects: projects.length,
      byStatus: {},
      createdThisWeek: projects.filter(p => p.createdAt > weekAgo).length,
      totalTeams: teams.length
    };
    projects.forEach(p => {
      summary.byStatus[p.status] = (summary.byStatus[p.status] || 0) + 1;
    });
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Project dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get tasks for a specific project
// @route   GET /api/projects/:id/tasks
// @access  Private
exports.getProjectTasks = async (req, res) => {  try {
    const { id: projectId } = req.params;
    const { 
      status,
      priority,
      assignee,
      assignedToMe,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50 
    } = req.query;

    // Check if user has access to this project
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions: admin, team leader, or team member
    const isAdmin = req.user.role === 'admin';
    const isTeamLeader = await isUserTeamLeaderForProject(req.user.id, projectId);
    
    // Check if user is a member of the project's team
    let isTeamMember = false;
    if (project.team) {
      const team = await Team.findById(project.team);
      if (team) {
        isTeamMember = team.isMember(req.user.id);
      }
    }

    if (!isAdmin && !isTeamLeader && !isTeamMember) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    // Build filter for tasks
    const filter = { project: projectId };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }    if (assignee) {
      filter.assignee = assignee;
    }
      // If assignedToMe is true, only show tasks assigned to current user
    if (assignedToMe === 'true') {
      filter.assignee = req.user.id;
      console.log('Filtering tasks for user:', req.user.id);
    }
    
    console.log('Task filter:', filter);
    console.log('Query params:', req.query);if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // All team members can see all tasks of projects they have access to
    // No additional filtering needed - if they can access the project, they can see all tasks

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate('creator', 'name email')
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
    console.error('Error getting project tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};