const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Team = require('../models/Team');

const getReportStats = async (req, res) => {
  try {
    const [taskCount, projectCount, userCount, teamCount] = await Promise.all([
      Task.countDocuments(),
      Project.countDocuments(),
      User.countDocuments(),
      Team.countDocuments()
    ]);
    
    const completedTasks = await Task.countDocuments({ status: 'done' });
    const inprogressTasks = await Task.countDocuments({ status: 'inprogress' });
    const todoTasks = await Task.countDocuments({ status: 'todo' });
    
    res.json({
      success: true,
      data: {
        totalTasks: taskCount,
        completedTasks,
        inprogressTasks,
        todoTasks,
        totalProjects: projectCount,
        totalUsers: userCount,
        totalTeams: teamCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

module.exports = {
  getReportStats
};
