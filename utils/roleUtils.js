const Team = require('../models/Team');
const Project = require('../models/Project');

/**
 * Check if a user is a team leader for a given project
 * @param {string} userId - The user ID to check
 * @param {string} projectId - The project ID to check against
 * @returns {Promise<boolean>} - True if user is team leader for the project
 */
const isTeamLeaderForProject = async (userId, projectId) => {
  try {
    const project = await Project.findById(projectId).populate('team');
    if (!project || !project.team) {
      return false;
    }
    
    return project.team.isLeader(userId);
  } catch (error) {
    console.error('Error checking team leader status:', error);
    return false;
  }
};

/**
 * Check if a user is a team leader for any project that contains the given task
 * @param {string} userId - The user ID to check
 * @param {Object} task - The task object (should be populated with project)
 * @returns {Promise<boolean>} - True if user is team leader for the task's project
 */
const isTeamLeaderForTask = async (userId, task) => {
  try {
    if (!task.project) {
      return false;
    }
    
    const projectId = typeof task.project === 'object' ? task.project._id : task.project;
    return await isTeamLeaderForProject(userId, projectId);
  } catch (error) {
    console.error('Error checking team leader status for task:', error);
    return false;
  }
};

/**
 * Get all projects where the user is a team leader
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of project IDs where user is team leader
 */
const getProjectsWhereUserIsLeader = async (userId) => {
  try {
    const teams = await Team.find({
      'members.user': userId,
      'members.team_role': 'leader'
    });
    
    const teamIds = teams
      .filter(team => team.isLeader(userId))
      .map(team => team._id);
    
    if (teamIds.length === 0) {
      return [];
    }
    
    const projects = await Project.find({ team: { $in: teamIds } });
    return projects.map(project => project._id);
  } catch (error) {
    console.error('Error getting projects for team leader:', error);
    return [];
  }
};

module.exports = {
  isTeamLeaderForProject,
  isTeamLeaderForTask,
  getProjectsWhereUserIsLeader
};
