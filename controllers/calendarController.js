const Task = require('../models/Task');
const SubTask = require('../models/SubTask');
const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');

// @desc    Get calendar view of tasks and subtasks
// @route   GET /api/calendar
// @access  Private
exports.getCalendarView = async (req, res) => {
  try {
    console.log('Calendar API called by user:', req.user.id, req.user.email);
    console.log('Query params:', req.query);
    
    const {
      start,
      end,
      view = 'month', // month, week, day
      type = 'all', // all, tasks, subtasks
      status,
      priority,
      assignee,
      project,
      team
    } = req.query;

    // Validate and set date range
    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from start

    // Build base filters
    const taskFilter = {
      $and: [
        {
          $or: [
            { dueDate: { $gte: startDate, $lte: endDate } },
            { startDate: { $gte: startDate, $lte: endDate } },
            {
              $and: [
                { startDate: { $lte: startDate } },
                { dueDate: { $gte: endDate } }
              ]
            }
          ]
        }
      ]
    };

    const subtaskFilter = {
      $and: [
        {
          $or: [
            { dueDate: { $gte: startDate, $lte: endDate } },
            { startDate: { $gte: startDate, $lte: endDate } },
            {
              $and: [
                { startDate: { $lte: startDate } },
                { dueDate: { $gte: endDate } }
              ]
            }
          ]
        }
      ]
    };

    // Apply additional filters
    if (status) {
      taskFilter.status = status;
      subtaskFilter.status = status;
    }
    if (priority) {
      taskFilter.priority = priority;
      subtaskFilter.priority = priority;
    }
    if (assignee) {
      taskFilter.assignee = assignee;
      subtaskFilter.assignee = assignee;
    }
    if (project) {
      taskFilter.project = project;
    }    // Role-based filtering
    if (req.user.role === 'member' || req.user.role === 'user') {
      // Members and users can only see their own tasks and tasks from their team
      if (req.user.team) {
        const teamProjects = await Project.find({ team: req.user.team }).select('_id');
        const projectIds = teamProjects.map(p => p._id);
        
        taskFilter.$and.push({
          $or: [
            { assignee: req.user.id },
            { createdBy: req.user.id },
            { project: { $in: projectIds } }
          ]
        });
        
        subtaskFilter.$and.push({
          $or: [
            { assignee: req.user.id },
            { createdBy: req.user.id }
          ]
        });
      } else {
        taskFilter.$and.push({
          $or: [
            { assignee: req.user.id },
            { createdBy: req.user.id }
          ]
        });
        
        subtaskFilter.$and.push({
          $or: [
            { assignee: req.user.id },
            { createdBy: req.user.id }
          ]
        });
      }
    } else if (req.user.role === 'admin' && team) {
      // Admins can filter by specific team if provided
      const teamProjects = await Project.find({ team }).select('_id');
      const projectIds = teamProjects.map(p => p._id);
      taskFilter.project = { $in: projectIds };
    }

    let tasks = [];
    let subtasks = [];    // Fetch tasks if requested
    if (type === 'all' || type === 'tasks') {
      console.log('Task filter:', JSON.stringify(taskFilter, null, 2));
      tasks = await Task.find(taskFilter)
        .populate('assignee', 'name email avatar')
        .populate('project', 'name color')
        .populate('creator', 'name email')
        .sort({ dueDate: 1 });
      console.log('Found tasks:', tasks.length);
    }

    // Fetch subtasks if requested
    if (type === 'all' || type === 'subtasks') {
      subtasks = await SubTask.find(subtaskFilter)
        .populate('assignee', 'name email avatar')
        .populate('task', 'title project')
        .sort({ dueDate: 1 });
    }

    // Format events for calendar
    const events = [];

    // Format tasks as calendar events
    tasks.forEach(task => {
      events.push({
        id: task._id,
        type: 'task',
        title: task.title,
        description: task.description,
        start: task.startDate || task.createdAt,
        end: task.dueDate,
        allDay: !task.dueDate || task.dueDate.getHours() === 0,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        project: task.project,
        color: getStatusColor(task.status),
        backgroundColor: getPriorityColor(task.priority),
        borderColor: task.project?.color || '#007bff',
        extendedProps: {
          taskId: task._id,
          projectName: task.project?.name,
          assigneeName: task.assignee?.name,
          isOverdue: task.dueDate && task.dueDate < new Date() && task.status !== 'done'
        }
      });
    });

    // Format subtasks as calendar events
    subtasks.forEach(subtask => {
      events.push({
        id: subtask._id,
        type: 'subtask',
        title: `[Subtask] ${subtask.title}`,
        description: subtask.description,
        start: subtask.startDate || subtask.createdAt,
        end: subtask.dueDate,
        allDay: !subtask.dueDate || subtask.dueDate.getHours() === 0,
        status: subtask.status,
        priority: subtask.priority,
        assignee: subtask.assignee,
        parentTask: subtask.task,
        color: getStatusColor(subtask.status),
        backgroundColor: getPriorityColor(subtask.priority),
        borderColor: '#6c757d',
        extendedProps: {
          subtaskId: subtask._id,
          parentTaskTitle: subtask.task?.title,
          assigneeName: subtask.assignee?.name,
          isOverdue: subtask.dueDate && subtask.dueDate < new Date() && subtask.status !== 'done'
        }
      });
    });

    // Get summary statistics
    const stats = {
      totalEvents: events.length,
      tasks: tasks.length,
      subtasks: subtasks.length,
      overdue: events.filter(e => e.extendedProps.isOverdue).length,
      urgent: events.filter(e => e.priority === 'high').length,
      completed: events.filter(e => e.status === 'done').length
    };    console.log('Final response:', {
      eventsCount: events.length,
      stats,
      dateRange: {
        start: startDate,
        end: endDate,
        view
      }
    });

    res.status(200).json({
      success: true,
      data: {
        events,
        stats,
        dateRange: {
          start: startDate,
          end: endDate,
          view
        }
      }
    });

  } catch (error) {
    console.error('Error getting calendar view:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting calendar view'
    });
  }
};

// @desc    Get calendar statistics for a date range
// @route   GET /api/calendar/stats
// @access  Private
exports.getCalendarStats = async (req, res) => {
  try {
    const {
      start,
      end,
      groupBy = 'day' // day, week, month
    } = req.query;

    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Build aggregation pipeline based on groupBy
    let dateFormat;
    switch (groupBy) {
      case 'week':
        dateFormat = '%Y-%U'; // Year-Week
        break;
      case 'month':
        dateFormat = '%Y-%m'; // Year-Month
        break;
      default:
        dateFormat = '%Y-%m-%d'; // Year-Month-Day
    }

    const taskStats = await Task.aggregate([
      {
        $match: {
          dueDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$dueDate' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          total: { $sum: '$count' },
          todo: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'todo'] }, '$count', 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'in_progress'] }, '$count', 0] }
          },
          done: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'done'] }, '$count', 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const subtaskStats = await SubTask.aggregate([
      {
        $match: {
          dueDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$dueDate' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          total: { $sum: '$count' },
          todo: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'todo'] }, '$count', 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'in_progress'] }, '$count', 0] }
          },
          done: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'done'] }, '$count', 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        taskStats,
        subtaskStats,
        groupBy,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });

  } catch (error) {
    console.error('Error getting calendar stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting calendar statistics'
    });
  }
};

// @desc    Get upcoming deadlines
// @route   GET /api/calendar/deadlines
// @access  Private
exports.getUpcomingDeadlines = async (req, res) => {
  try {
    const { days = 7, limit = 20 } = req.query;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const filter = {
      dueDate: { $gte: new Date(), $lte: endDate },
      status: { $ne: 'done' }
    };

    // Role-based filtering
    if (req.user.role === 'member') {
      filter.$or = [
        { assignee: req.user.id },
        { createdBy: req.user.id }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('project', 'name color')
      .sort({ dueDate: 1 })
      .limit(parseInt(limit));

    const subtasks = await SubTask.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('task', 'title project')
      .sort({ dueDate: 1 })
      .limit(parseInt(limit));

    // Combine and sort by due date
    const allDeadlines = [
      ...tasks.map(task => ({
        ...task.toObject(),
        type: 'task',
        daysUntilDue: Math.ceil((task.dueDate - new Date()) / (1000 * 60 * 60 * 24))
      })),
      ...subtasks.map(subtask => ({
        ...subtask.toObject(),
        type: 'subtask',
        daysUntilDue: Math.ceil((subtask.dueDate - new Date()) / (1000 * 60 * 60 * 24))
      }))
    ].sort((a, b) => a.dueDate - b.dueDate);

    res.status(200).json({
      success: true,
      count: allDeadlines.length,
      data: allDeadlines.slice(0, parseInt(limit))
    });

  } catch (error) {
    console.error('Error getting upcoming deadlines:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting upcoming deadlines'
    });
  }
};

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    todo: '#6c757d',
    in_progress: '#007bff',
    done: '#28a745',
    cancelled: '#dc3545'
  };
  return colors[status] || '#6c757d';
};

const getPriorityColor = (priority) => {
  const colors = {
    low: '#17a2b8',
    medium: '#ffc107',
    high: '#dc3545'
  };
  return colors[priority] || '#17a2b8';
};
