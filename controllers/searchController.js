const Task = require('../models/Task');
const SubTask = require('../models/SubTask');
const Project = require('../models/Project');
const Team = require('../models/Team');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Attachment = require('../models/Attachment');

// @desc    Global search across all entities
// @route   GET /api/search
// @access  Private
exports.globalSearch = async (req, res) => {
  try {
    const {
      q: query,
      type = 'all', // all, tasks, subtasks, projects, teams, users, comments, attachments
      limit = 10,
      page = 1
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = { $regex: query, $options: 'i' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const results = {};
    let totalResults = 0;

    // Build role-based filters
    const roleFilter = {};
    if (req.user.role === 'member' && req.user.team) {
      roleFilter.team = req.user.team;
    }

    // Search Tasks
    if (type === 'all' || type === 'tasks') {
      const taskFilter = {
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      };

      // Apply role-based filtering for tasks
      if (req.user.role === 'member') {
        taskFilter.$and = [{
          $or: [
            { assignee: req.user.id },
            { createdBy: req.user.id }
          ]
        }];
      }

      const tasks = await Task.find(taskFilter)
        .populate('assignee', 'name email avatar')
        .populate('project', 'name team')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const taskCount = await Task.countDocuments(taskFilter);
      results.tasks = { data: tasks, count: taskCount };
      totalResults += taskCount;
    }

    // Search SubTasks
    if (type === 'all' || type === 'subtasks') {
      const subtaskFilter = {
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      };

      if (req.user.role === 'member') {
        subtaskFilter.$and = [{
          $or: [
            { assignee: req.user.id },
            { createdBy: req.user.id }
          ]
        }];
      }

      const subtasks = await SubTask.find(subtaskFilter)
        .populate('assignee', 'name email avatar')
        .populate('task', 'title project')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const subtaskCount = await SubTask.countDocuments(subtaskFilter);
      results.subtasks = { data: subtasks, count: subtaskCount };
      totalResults += subtaskCount;
    }

    // Search Projects
    if (type === 'all' || type === 'projects') {
      const projectFilter = {
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      };

      if (req.user.role === 'member' && req.user.team) {
        projectFilter.team = req.user.team;
      }

      const projects = await Project.find(projectFilter)
        .populate('team', 'name manager')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const projectCount = await Project.countDocuments(projectFilter);
      results.projects = { data: projects, count: projectCount };
      totalResults += projectCount;
    }

    // Search Teams (Admin and Manager only)
    if ((type === 'all' || type === 'teams') && req.user.role !== 'member') {
      const teamFilter = {
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      };

      const teams = await Team.find(teamFilter)
        .populate('manager', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const teamCount = await Team.countDocuments(teamFilter);
      results.teams = { data: teams, count: teamCount };
      totalResults += teamCount;
    }

    // Search Users (Admin and Manager only)
    if ((type === 'all' || type === 'users') && req.user.role !== 'member') {
      const userFilter = {
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      };

      const users = await User.find(userFilter)
        .select('-password')
        .populate('team', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const userCount = await User.countDocuments(userFilter);
      results.users = { data: users, count: userCount };
      totalResults += userCount;
    }

    // Search Comments
    if (type === 'all' || type === 'comments') {
      const commentFilter = {
        content: searchRegex
      };

      const comments = await Comment.find(commentFilter)
        .populate('author', 'name email avatar')
        .populate('task', 'title project')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const commentCount = await Comment.countDocuments(commentFilter);
      results.comments = { data: comments, count: commentCount };
      totalResults += commentCount;
    }

    // Search Attachments
    if (type === 'all' || type === 'attachments') {
      const attachmentFilter = {
        originalName: searchRegex
      };

      const attachments = await Attachment.find(attachmentFilter)
        .populate('uploadedBy', 'name email')
        .populate('task', 'title')
        .populate('comment', 'content')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const attachmentCount = await Attachment.countDocuments(attachmentFilter);
      results.attachments = { data: attachments, count: attachmentCount };
      totalResults += attachmentCount;
    }

    res.status(200).json({
      success: true,
      query,
      totalResults,
      type,
      page: parseInt(page),
      limit: parseInt(limit),
      data: results
    });

  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search operation'
    });
  }
};

// @desc    Advanced search with filters
// @route   POST /api/search/advanced
// @access  Private
exports.advancedSearch = async (req, res) => {
  try {
    const {
      query,
      filters = {},
      sort = { createdAt: -1 },
      limit = 20,
      page = 1
    } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = { $regex: query, $options: 'i' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Build advanced filter
    const buildFilter = (baseFilter) => {
      const filter = { ...baseFilter };

      if (filters.status && filters.status.length > 0) {
        filter.status = { $in: filters.status };
      }
      if (filters.priority && filters.priority.length > 0) {
        filter.priority = { $in: filters.priority };
      }
      if (filters.assignee && filters.assignee.length > 0) {
        filter.assignee = { $in: filters.assignee };
      }
      if (filters.project && filters.project.length > 0) {
        filter.project = { $in: filters.project };
      }
      if (filters.team && filters.team.length > 0) {
        filter.team = { $in: filters.team };
      }
      if (filters.dateRange) {
        const { start, end, field = 'createdAt' } = filters.dateRange;
        if (start || end) {
          filter[field] = {};
          if (start) filter[field].$gte = new Date(start);
          if (end) filter[field].$lte = new Date(end);
        }
      }

      return filter;
    };

    const results = {};

    // Search Tasks with advanced filters
    if (!filters.entityType || filters.entityType.includes('tasks')) {
      const taskFilter = buildFilter({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      });

      const tasks = await Task.find(taskFilter)
        .populate('assignee', 'name email avatar')
        .populate('project', 'name team')
        .populate('createdBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      const taskCount = await Task.countDocuments(taskFilter);
      results.tasks = { data: tasks, count: taskCount };
    }

    // Search SubTasks with advanced filters
    if (!filters.entityType || filters.entityType.includes('subtasks')) {
      const subtaskFilter = buildFilter({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      });

      const subtasks = await SubTask.find(subtaskFilter)
        .populate('assignee', 'name email avatar')
        .populate('task', 'title project')
        .populate('createdBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      const subtaskCount = await SubTask.countDocuments(subtaskFilter);
      results.subtasks = { data: subtasks, count: subtaskCount };
    }

    // Search Projects with advanced filters
    if (!filters.entityType || filters.entityType.includes('projects')) {
      const projectFilter = buildFilter({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      });

      const projects = await Project.find(projectFilter)
        .populate('team', 'name manager')
        .populate('createdBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      const projectCount = await Project.countDocuments(projectFilter);
      results.projects = { data: projects, count: projectCount };
    }

    const totalResults = Object.values(results).reduce((sum, result) => sum + result.count, 0);

    res.status(200).json({
      success: true,
      query,
      filters,
      totalResults,
      page: parseInt(page),
      limit: parseInt(limit),
      data: results
    });

  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during advanced search'
    });
  }
};

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Private
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const searchRegex = { $regex: `^${query}`, $options: 'i' };
    const limitNum = parseInt(limit);

    const suggestions = [];

    // Get task title suggestions
    const taskTitles = await Task.find({ title: searchRegex })
      .select('title')
      .limit(limitNum);
    
    taskTitles.forEach(task => {
      suggestions.push({
        text: task.title,
        type: 'task',
        id: task._id
      });
    });

    // Get project name suggestions
    const projectNames = await Project.find({ name: searchRegex })
      .select('name')
      .limit(limitNum);

    projectNames.forEach(project => {
      suggestions.push({
        text: project.name,
        type: 'project',
        id: project._id
      });
    });

    // Get user name suggestions (for non-members)
    if (req.user.role !== 'member') {
      const userNames = await User.find({ name: searchRegex })
        .select('name email')
        .limit(limitNum);

      userNames.forEach(user => {
        suggestions.push({
          text: user.name,
          type: 'user',
          id: user._id,
          email: user.email
        });
      });
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text && s.type === suggestion.type)
      )
      .slice(0, limitNum * 3);

    res.status(200).json({
      success: true,
      query,
      data: uniqueSuggestions
    });

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting search suggestions'
    });
  }
};

// @desc    Save search query (for analytics/history)
// @route   POST /api/search/save
// @access  Private
exports.saveSearchQuery = async (req, res) => {
  try {
    const { query, results, type } = req.body;

    // This could be expanded to save search history to database
    // For now, just acknowledge the request
    
    res.status(200).json({
      success: true,
      message: 'Search query saved'
    });

  } catch (error) {
    console.error('Error saving search query:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving search query'
    });
  }
};
