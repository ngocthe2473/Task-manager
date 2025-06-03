const Task = require('../models/Task');
const SubTask = require('../models/SubTask');
const Project = require('../models/Project');
const User = require('../models/User');
const Team = require('../models/Team');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Helper function to check if user is team leader for a task
const isUserTeamLeaderForTask = async (userId, task) => {
  try {
    if (!task.project) return false;
    
    const project = await Project.findById(task.project).populate('team');
    if (!project || !project.team) return false;
    
    return project.team.isLeader(userId);
  } catch (error) {
    console.error('Error checking team leader status:', error);
    return false;
  }
};

// Helper function to check if user is team leader for assignee
const isUserTeamLeaderForUser = async (leaderId, targetUserId) => {
  try {
    const team = await Team.findOne({
      'members.user': leaderId,
      'members.team_role': 'leader'
    });
    
    if (!team) return false;
    
    return team.isMember(targetUserId);
  } catch (error) {
    console.error('Error checking team leader for user:', error);
    return false;
  }
};

// @desc    Get all tasks with filtering and searching
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignee,
      project,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dueDate
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (project) filter.project = project;
    if (dueDate) {
      const date = new Date(dueDate);
      filter.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }    // Role-based filtering
    if (req.user.role === 'member') {
      filter.$or = [
        { assignee: req.user.id },
        { creator: req.user.id }
      ];
    }

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
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task by ID with subtasks
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('creator', 'name email')
      .populate('project', 'name description team');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get subtasks
    const subtasks = await SubTask.find({ parentTask: task._id })
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...task.toObject(),
        subtasks
      }
    });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignee,
      priority = 'medium',
      dueDate,
      estimatedHours,
      tags
    } = req.body;    // Validation
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Check if project exists (if provided)
    if (project) {
      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return res.status(404).json({ message: 'Project not found' });
      }
    }

    // Check if assignee exists
    if (assignee) {
      const assigneeExists = await User.findById(assignee);
      if (!assigneeExists) {
        return res.status(404).json({ message: 'Assignee not found' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      creator: req.user.id,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours,      tags: tags || []
    });

    await task.populate([
      { path: 'assignee', select: 'name email' },
      { path: 'creator', select: 'name email' },
      { path: 'project', select: 'name description' }
    ]);// Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Task',
      entityId: task._id,
      metadata: { 
        title: task.title, 
        project: project ? (await Project.findById(project))?.name : 'No Project' 
      }
    });

    // Create notification for assignee
    if (assignee && assignee !== req.user.id) {
      await Notification.create({
        user: assignee,
        content: `You have been assigned a new task: ${title}`,
        type: 'task_assigned',
        relatedEntity: task._id,
        onModel: 'Task'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }    // Check permissions
    const isTeamLeader = await isUserTeamLeaderForTask(req.user.id, task);
    if (req.user.role !== 'admin' && 
        !isTeamLeader && 
        task.creator.toString() !== req.user.id &&
        task.assignee?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const oldAssignee = task.assignee;
    const oldStatus = task.status;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },      { new: true, runValidators: true }
    ).populate([
      { path: 'assignee', select: 'name email' },
      { path: 'creator', select: 'name email' },
      { path: 'project', select: 'name description' }
    ]);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Task',
      entityId: task._id,
      metadata: { 
        title: task.title,
        changes: Object.keys(req.body)
      }
    });

    // Create notifications for changes
    if (req.body.assignee && req.body.assignee !== oldAssignee?.toString()) {
      await Notification.create({
        user: req.body.assignee,
        content: `You have been assigned to task: ${task.title}`,
        type: 'task_assigned',
        relatedEntity: task._id,
        onModel: 'Task'
      });
    }

    if (req.body.status && req.body.status !== oldStatus) {
      // Notify relevant users about status change
      const notifyUsers = [task.creator, task.assignee].filter(user => 
        user && user.toString() !== req.user.id
      );
      
      for (const userId of notifyUsers) {
        await Notification.create({
          user: userId,
          content: `Task "${task.title}" status changed to ${req.body.status}`,
          type: 'task_assigned',
          relatedEntity: task._id,
          onModel: 'Task'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
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
    }    // Check permissions
    const isTeamLeader = await isUserTeamLeaderForTask(req.user.id, task);
    if (req.user.role !== 'admin' && 
        !isTeamLeader && 
        task.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    // Delete associated subtasks
    await SubTask.deleteMany({ parentTask: task._id });

    // Delete the task
    await Task.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'Task',
      entityId: task._id,
      metadata: { title: task.title }
    });

    res.status(200).json({
      success: true,
      message: 'Task and associated subtasks deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get tasks by project
// @route   GET /api/tasks/project/:projectId
// @access  Private
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assignee } = req.query;

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting project tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
exports.getMyTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter for user's tasks (assigned to user or created by user)
    const filter = {
      $or: [
        { assignee: req.user.id },
        { creator: req.user.id }
      ]
    };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    // Add search functionality
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

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
    console.error('Error getting user tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign task to user
// @route   PUT /api/tasks/:id/assign
// @access  Private
exports.assignTask = async (req, res) => {
  try {
    const { assignee } = req.body;

    if (!assignee) {
      return res.status(400).json({ message: 'Assignee is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if assignee exists
    const assigneeUser = await User.findById(assignee);
    if (!assigneeUser) {
      return res.status(404).json({ message: 'Assignee not found' });
    }    // Check permissions
    const isTeamLeader = await isUserTeamLeaderForTask(req.user.id, task);
    if (req.user.role !== 'admin' && 
        !isTeamLeader && 
        task.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to assign this task' });
    }task.assignee = assignee;
    task.updatedAt = new Date();
    await task.save();

    await task.populate([
      { path: 'assignee', select: 'name email' },
      { path: 'creator', select: 'name email' },
      { path: 'project', select: 'name description' }
    ]);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Task',
      entityId: task._id,
      metadata: { 
        action: 'assign_task',
        assignee: assigneeUser.name,
        title: task.title
      }
    });

    // Create notification
    if (assignee !== req.user.id) {
      await Notification.create({
        user: assignee,
        content: `You have been assigned to task: ${task.title}`,
        type: 'task_assigned',
        relatedEntity: task._id,
        onModel: 'Task'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      data: task
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['todo', 'in_progress', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }    // Check permissions
    const isTeamLeader = await isUserTeamLeaderForTask(req.user.id, task);
    if (req.user.role !== 'admin' && 
        !isTeamLeader && 
        task.creator.toString() !== req.user.id &&
        task.assignee?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task status' });
    }

    const oldStatus = task.status;
    task.status = status;
    task.updatedAt = new Date();
    
    if (status === 'done') {
      task.completedAt = new Date();
    }    await task.save();

    await task.populate([
      { path: 'assignee', select: 'name email' },
      { path: 'creator', select: 'name email' },
      { path: 'project', select: 'name description' }
    ]);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Task',
      entityId: task._id,
      metadata: { 
        action: 'status_change',
        oldStatus,
        newStatus: status,
        title: task.title
      }
    });

    // Notify relevant users
    const notifyUsers = [task.creator, task.assignee].filter(user => 
      user && user.toString() !== req.user.id
    );
    
    for (const userId of notifyUsers) {
      await Notification.create({
        user: userId,
        content: `Task "${task.title}" status changed to ${status}`,
        type: 'task_assigned',
        relatedEntity: task._id,
        onModel: 'Task'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    const { projectId, userId, period = '30' } = req.query;

    // Build filter for date range
    const dateFilter = {
      createdAt: {
        $gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)
      }
    };

    // Build additional filters
    const filter = { ...dateFilter };
    if (projectId) filter.project = projectId;
    if (userId) {
      filter.$or = [
        { assignee: userId },
        { creator: userId }
      ];
    }

    // Role-based filtering
    if (req.user.role === 'member') {
      filter.$or = [
        { assignee: req.user.id },
        { creator: req.user.id }
      ];
    }

    const stats = await Task.aggregate([
      { $match: filter },
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
    };    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting task stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Tìm kiếm task theo tiêu đề hoặc mô tả (ai đăng nhập cũng dùng được)
exports.searchTasks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) return res.json({ data: [] });
    const tasks = await Task.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).select('_id title description status priority dueDate');
    res.json({ data: tasks });
  } catch (error) {
    console.error('Search tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Thống kê task theo user (ai đăng nhập cũng dùng được)
exports.getTaskStats = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { $or: [{ assignee: userId }, { creator: userId }] } : {};
    const total = await Task.countDocuments(filter);
    const completed = await Task.countDocuments({ ...filter, status: 'done' });
    const overdue = await Task.countDocuments({ ...filter, dueDate: { $lt: new Date() }, status: { $ne: 'done' } });
    res.json({ data: { total, completed, overdue } });
  } catch (error) {
    console.error('Task stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search tasks by name/title
// @route   GET /api/tasks/search
// @access  Private
exports.searchTasks = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Find tasks that user can access (assigned to them or created by them)
    const searchRegex = new RegExp(q.trim(), 'i');
    
    const tasks = await Task.find({
      $and: [
        {
          $or: [
            { assignee: req.user.id },
            { createdBy: req.user.id }
          ]
        },
        {
          $or: [
            { title: searchRegex },
            { description: searchRegex }
          ]
        }
      ]
    })
    .populate('assignee', 'name email avatar')
    .populate('project', 'name color')
    .populate('createdBy', 'name email')
    .limit(parseInt(limit))
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error searching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Search users by name/email
// @route   GET /api/tasks/search-users
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Get user's team members only
    const teams = await Team.find({
      'members.user': req.user.id
    }).populate('members.user', 'name email avatar role');

    // Extract all confirmed team members
    const allMembers = new Map();
    teams.forEach(team => {
      team.members.forEach(member => {
        allMembers.set(member.user._id.toString(), {
          _id: member.user._id,
          name: member.user.name,
          email: member.user.email,
          avatar: member.user.avatar,
          role: member.user.role
        });
      });
    });

    const searchRegex = new RegExp(q.trim(), 'i');
    const filteredUsers = Array.from(allMembers.values()).filter(user => 
      searchRegex.test(user.name) || searchRegex.test(user.email)
    ).slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: filteredUsers
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Search projects by name
// @route   GET /api/tasks/search-projects
// @access  Private
exports.searchProjects = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const projects = await Project.find({
      name: searchRegex
    })
    .limit(parseInt(limit))
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get comprehensive statistics for current user
// @route   GET /api/tasks/stats
// @access  Private
exports.getComprehensiveStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's tasks
    const userTasks = await Task.find({
      $or: [
        { assignee: userId },
        { createdBy: userId }
      ]
    }).populate('project', 'name color');

    // Calculate task statistics
    const taskStats = {
      total: userTasks.length,
      todo: userTasks.filter(task => task.status === 'todo').length,
      inProgress: userTasks.filter(task => task.status === 'in-progress').length,
      review: userTasks.filter(task => task.status === 'review').length,
      done: userTasks.filter(task => task.status === 'done').length,
      overdue: userTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
      ).length
    };

    // Calculate priority distribution
    const priorityStats = {
      low: userTasks.filter(task => task.priority === 'low').length,
      medium: userTasks.filter(task => task.priority === 'medium').length,
      high: userTasks.filter(task => task.priority === 'high').length,
      urgent: userTasks.filter(task => task.priority === 'urgent').length
    };

    // Calculate project statistics
    const projectStats = {};
    userTasks.forEach(task => {
      if (task.project) {
        const projectId = task.project._id.toString();
        if (!projectStats[projectId]) {
          projectStats[projectId] = {
            name: task.project.name,
            color: task.project.color,
            total: 0,
            completed: 0,
            inProgress: 0
          };
        }
        projectStats[projectId].total++;
        if (task.status === 'done') {
          projectStats[projectId].completed++;
        } else if (task.status === 'in-progress') {
          projectStats[projectId].inProgress++;
        }
      }
    });

    // Calculate completion rate
    const completionRate = taskStats.total > 0 ? 
      Math.round((taskStats.done / taskStats.total) * 100) : 0;

    // Get recent tasks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTasks = await Task.find({
      $or: [
        { assignee: userId },
        { createdBy: userId }
      ],
      updatedAt: { $gte: sevenDaysAgo }
    })
    .populate('assignee', 'name email avatar')
    .populate('project', 'name color')
    .sort({ updatedAt: -1 })
    .limit(10);

    // Get upcoming tasks (due in next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingTasks = await Task.find({
      $or: [
        { assignee: userId },
        { createdBy: userId }
      ],
      dueDate: { 
        $gte: new Date(),
        $lte: nextWeek
      },
      status: { $ne: 'done' }
    })
    .populate('assignee', 'name email avatar')
    .populate('project', 'name color')
    .sort({ dueDate: 1 })
    .limit(10);

    res.status(200).json({
      success: true,
      data: {
        taskStats,
        priorityStats,
        projectStats: Object.values(projectStats),
        completionRate,
        recentTasks,
        upcomingTasks
      }
    });
  } catch (error) {
    console.error('Error getting comprehensive stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get team productivity analytics
// @route   GET /api/tasks/team-analytics
// @access  Private
exports.getTeamAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find teams where user is a member
    const teams = await Team.find({
      'members.user': userId
    }).populate('members.user', 'name email avatar');

    const analytics = [];

    for (const team of teams) {
      const teamMemberIds = team.members.map(member => member.user._id);
      
      // Get tasks for this team
      const teamTasks = await Task.find({
        $or: [
          { assignee: { $in: teamMemberIds } },
          { createdBy: { $in: teamMemberIds } }
        ]
      }).populate('assignee', 'name email avatar')
        .populate('createdBy', 'name email avatar');

      // Calculate team statistics
      const teamStats = {
        teamId: team._id,
        teamName: team.name,
        memberCount: team.members.length,
        totalTasks: teamTasks.length,
        completedTasks: teamTasks.filter(task => task.status === 'done').length,
        inProgressTasks: teamTasks.filter(task => task.status === 'in-progress').length,
        overdueTasks: teamTasks.filter(task => 
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
        ).length
      };

      // Calculate individual member performance
      const memberStats = team.members.map(member => {
        const memberTasks = teamTasks.filter(task => 
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
      });

      analytics.push({
        ...teamStats,
        completionRate: teamStats.totalTasks > 0 ? 
          Math.round((teamStats.completedTasks / teamStats.totalTasks) * 100) : 0,
        members: memberStats
      });
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting team analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get task timeline/activity for current user
// @route   GET /api/tasks/timeline
// @access  Private
exports.getTaskTimeline = async (req, res) => {
  try {
    const { limit = 20, days = 30 } = req.query;
    const userId = req.user.id;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get task activities
    const activities = await ActivityLog.find({
      user: userId,
      createdAt: { $gte: startDate }
    })
    .populate('task', 'title status priority')
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    // Group activities by date
    const groupedActivities = {};
    activities.forEach(activity => {
      const date = activity.createdAt.toISOString().split('T')[0];
      if (!groupedActivities[date]) {
        groupedActivities[date] = [];
      }
      groupedActivities[date].push(activity);
    });

    res.status(200).json({
      success: true,
      data: {
        activities: groupedActivities,
        totalActivities: activities.length
      }
    });
  } catch (error) {
    console.error('Error getting timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Advanced search for tasks (multi-filter, sort, pagination)
// @route   GET /api/tasks/advanced-search
// @access  Private
exports.advancedSearchTasks = async (req, res) => {
  try {
    const {
      q = '',
      status,
      priority,
      assignee,
      project,
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
        { title: regex },
        { description: regex }
      ];
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (project) filter.project = project;
    if (createdBy) filter.createdBy = createdBy;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignee', 'name email avatar')
        .populate('project', 'name color')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter)
    ]);
    res.json({ success: true, data: tasks, total });
  } catch (error) {
    console.error('Advanced search tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Advanced statistics for tasks (by status, project, user, time)
// @route   GET /api/tasks/advanced-stats
// @access  Private
exports.advancedTaskStats = async (req, res) => {
  try {
    const { fromDate, toDate, project, assignee } = req.query;
    const filter = {};
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    if (project) filter.project = project;
    if (assignee) filter.assignee = assignee;
    const tasks = await Task.find(filter);
    const byStatus = {};
    const byPriority = {};
    const byProject = {};
    const byAssignee = {};
    tasks.forEach(task => {
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      if (task.project) {
        byProject[task.project] = (byProject[task.project] || 0) + 1;
      }
      if (task.assignee) {
        byAssignee[task.assignee] = (byAssignee[task.assignee] || 0) + 1;
      }
    });
    res.json({ success: true, stats: { byStatus, byPriority, byProject, byAssignee, total: tasks.length } });
  } catch (error) {
    console.error('Advanced task stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Autocomplete for task title
// @route   GET /api/tasks/autocomplete
// @access  Private
exports.autocompleteTaskTitle = async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;
    if (!q) return res.json({ data: [] });
    const regex = new RegExp(q, 'i');
    const tasks = await Task.find({ title: regex }).select('title').limit(parseInt(limit));
    res.json({ data: tasks });
  } catch (error) {
    console.error('Autocomplete task title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Activity log for tasks (filter by user, action, time)
// @route   GET /api/tasks/activity-log
// @access  Private
exports.taskActivityLog = async (req, res) => {
  try {
    const { user, action, fromDate, toDate, limit = 50 } = req.query;
    const filter = {};
    if (user) filter.user = user;
    if (action) filter.action = action;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json({ data: logs });
  } catch (error) {
    console.error('Task activity log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export tasks to CSV (filtered)
// @route   GET /api/tasks/export
// @access  Private
exports.exportTasksCSV = async (req, res) => {
  try {
    const { status, project, assignee } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (project) filter.project = project;
    if (assignee) filter.assignee = assignee;
    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate('project', 'name');
    let csv = 'Title,Description,Status,Priority,Assignee,Project,DueDate\n';
    tasks.forEach(t => {
      csv += `"${t.title}","${t.description}",${t.status},${t.priority},${t.assignee?.name || ''},${t.project?.name || ''},${t.dueDate ? t.dueDate.toISOString().split('T')[0] : ''}\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('tasks.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export tasks CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Dashboard summary (all-in-one)
// @route   GET /api/tasks/dashboard-summary
// @access  Private
exports.dashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    // Tổng số task, số task theo trạng thái, số project, số team, số task quá hạn, số task hoàn thành tuần này
    const [tasks, projects, teams] = await Promise.all([
      Task.find({ $or: [{ assignee: userId }, { createdBy: userId }] }),
      Project.find({}),
      Team.find({ 'members.user': userId })
    ]);
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    const summary = {
      totalTasks: tasks.length,
      byStatus: {},
      overdue: tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'done').length,
      completedThisWeek: tasks.filter(t => t.status === 'done' && t.updatedAt > weekAgo).length,
      totalProjects: projects.length,
      totalTeams: teams.length
    };
    tasks.forEach(t => {
      summary.byStatus[t.status] = (summary.byStatus[t.status] || 0) + 1;
    });
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};