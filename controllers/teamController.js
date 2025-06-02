const Team = require('../models/Team');
const User = require('../models/User');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// @desc    Get all teams with filtering
// @route   GET /api/teams
// @access  Private
exports.getTeams = async (req, res) => {
  try {
    const { 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 10 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }    // Role-based filtering
    if (req.user.role === 'user') {
      // Regular users can only see teams they are members of
      filter['members.user'] = req.user.id;
    }
    // Admins can see all teams

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const teams = await Team.find(filter)
      .populate('members.user', 'name email avatar role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Add member count and project count for each team
    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        const projectCount = await Project.countDocuments({ team: team._id });
        return {
          ...team.toObject(),
          memberCount: team.members.length,
          projectCount
        };
      })
    );

    const total = await Team.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: teamsWithStats.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: teamsWithStats
    });
  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get team by ID with detailed info
// @route   GET /api/teams/:id
// @access  Private
exports.getTeamById = async (req, res) => {
  try {    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name email avatar role isActive');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }    // Check permissions
    if (req.user.role === 'user' && 
        !team.members.some(member => member.user._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this team' });
    }

    if (req.user.role === 'manager' && team.manager._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this team' });
    }

    // Get team projects
    const projects = await Project.find({ team: req.params.id })
      .select('name status startDate endDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...team.toObject(),
        projects,
        memberCount: team.members.length,
        projectCount: projects.length
      }
    });
  } catch (error) {
    console.error('Error getting team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (User/Admin)
exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    // Create the team with the current user as leader
    const team = await Team.create({
      name,
      description,
      members: [{
        user: req.user.id,
        team_role: 'leader'
      }]
    });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Team',
      entityId: team._id,
      metadata: {
        teamName: name,
        creatorRole: 'leader'
      }
    });

    // Populate the team members
    await team.populate('members.user', 'name email avatar role');

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin/Manager)
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check permissions
    if (req.user.role === 'member') {
      return res.status(403).json({ message: 'Not authorized to update teams' });
    }

    if (req.user.role === 'manager' && team.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this team' });
    }

    // If changing manager, validate the new manager
    if (req.body.manager && req.body.manager !== team.manager.toString()) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can change team manager' });
      }

      const newManager = await User.findById(req.body.manager);
      if (!newManager || !['admin', 'manager'].includes(newManager.role)) {
        return res.status(400).json({ message: 'Invalid manager' });
      }

      // Check if new manager already manages a team
      const existingTeam = await Team.findOne({ 
        manager: req.body.manager, 
        _id: { $ne: req.params.id } 
      });
      if (existingTeam) {
        return res.status(400).json({ message: 'Manager already manages another team' });
      }

      // Update old manager's team reference
      await User.findByIdAndUpdate(team.manager, { $unset: { team: 1 } });
      
      // Update new manager's team reference
      await User.findByIdAndUpdate(req.body.manager, { team: req.params.id });

      // Add new manager to members if not already there
      if (!team.members.includes(req.body.manager)) {
        team.members.push(req.body.manager);
      }
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Team',
      entityId: team._id,
      metadata: {
        changes: req.body
      }
    });

    res.status(200).json({
      success: true,
      data: updatedTeam
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin only)
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete teams' });
    }

    // Check if team has projects
    const projectCount = await Project.countDocuments({ team: req.params.id });
    if (projectCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete team with existing projects. Please reassign or delete projects first.' 
      });
    }

    // Remove team reference from all members
    await User.updateMany(
      { team: req.params.id },
      { $unset: { team: 1 } }
    );

    await Team.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'Team',
      entityId: req.params.id,
      metadata: {
        name: team.name,
        memberCount: team.members.length
      }
    });

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private (Admin/Manager)
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check permissions
    if (req.user.role === 'member') {
      return res.status(403).json({ message: 'Not authorized to add members' });
    }

    if (req.user.role === 'manager' && team.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add members to this team' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already in a team
    if (user.team) {
      return res.status(400).json({ message: 'User is already in a team' });
    }

    // Check if user is already a member
    if (team.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    // Add member to team
    team.members.push(userId);
    await team.save();

    // Update user's team reference
    await User.findByIdAndUpdate(userId, { team: req.params.id });

    const updatedTeam = await Team.findById(req.params.id)
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Team',
      entityId: team._id,
      metadata: {
        action: 'add_member',
        addedUser: userId,
        userName: user.name
      }
    });

    // Notify the new member
    await Notification.create({
      user: userId,
      content: `You have been added to team "${team.name}"`,
      type: 'task_assigned',
      relatedEntity: team._id,
      onModel: 'Team'
    });

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (Admin/Manager)
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check permissions
    if (req.user.role === 'member') {
      return res.status(403).json({ message: 'Not authorized to remove members' });
    }

    if (req.user.role === 'manager' && team.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to remove members from this team' });
    }

    // Cannot remove the manager
    if (team.manager.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove team manager. Change manager first.' });
    }

    // Check if user is a member
    if (!team.members.includes(userId)) {
      return res.status(400).json({ message: 'User is not a member of this team' });
    }

    const user = await User.findById(userId);

    // Remove member from team
    team.members = team.members.filter(member => member.toString() !== userId);
    await team.save();

    // Remove team reference from user
    await User.findByIdAndUpdate(userId, { $unset: { team: 1 } });

    const updatedTeam = await Team.findById(req.params.id)
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Team',
      entityId: team._id,
      metadata: {
        action: 'remove_member',
        removedUser: userId,
        userName: user?.name
      }
    });

    // Notify the removed member
    if (user) {
      await Notification.create({
        user: userId,
        content: `You have been removed from team "${team.name}"`,
        type: 'task_assigned',
        relatedEntity: team._id,
        onModel: 'Team'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my team
// @route   GET /api/teams/my
// @access  Private
exports.getMyTeam = async (req, res) => {
  try {
    if (!req.user.team) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'User is not assigned to any team'
      });
    }

    const team = await Team.findById(req.user.team)
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role isActive');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Get team projects
    const projects = await Project.find({ team: team._id })
      .select('name status startDate endDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...team.toObject(),
        projects,
        memberCount: team.members.length,
        projectCount: projects.length
      }
    });
  } catch (error) {
    console.error('Error getting my team:', error);    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add member to team
// @route   PUT /api/teams/:id/members
// @access  Private/Manager
exports.addTeamMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Authorization is now handled by authorizeTeamRole middleware
    // Only team leaders or admins can add members

    const { userId, teamRole = 'member' } = req.body;
    
    // Validate role
    if (!['leader', 'member'].includes(teamRole)) {
      return res.status(400).json({ message: 'Invalid team role. Must be leader or member' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already in team
    if (team.isMember(userId)) {
      return res.status(400).json({ message: 'User already in team' });
    }

    // Add member with specified role
    team.addMember(userId, teamRole);
    await team.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Team',
      entityId: team._id,
      metadata: { action: 'add_member', memberId: userId }
    });

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members
// @access  Private (Admin/Manager)
exports.removeTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Authorization is now handled by authorizeTeamRole middleware
    // Only team leaders or admins can remove members

    // Check if user is member of the team
    const memberIndex = team.members.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'User is not a member of this team' });
    }

    // Cannot remove the last leader of the team
    const isLeader = team.members[memberIndex].team_role === 'leader';
    const leaderCount = team.members.filter(m => m.team_role === 'leader').length;
    
    if (isLeader && leaderCount <= 1) {
      return res.status(400).json({ 
        message: 'Cannot remove the last leader. Transfer leadership to another member first.' 
      });
    }

    // Remove member from team
    team.members.splice(memberIndex, 1);
    await team.save();

    // Update user's team reference
    await User.findByIdAndUpdate(userId, { $unset: { team: 1 } });

    // Populate the updated team
    await team.populate([
      { path: 'manager', select: 'name email' },
      { path: 'members.user', select: 'name email' }
    ]);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Team',
      entityId: team._id,
      metadata: { action: 'remove_member', memberId: userId }
    });

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get team statistics
// @route   GET /api/teams/:id/stats
// @access  Private
exports.getTeamStats = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id)
      .populate('manager', 'name email')
      .populate('members.user', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user has access to team stats
    const isManager = team.manager._id.toString() === req.user.id;
    const isMember = team.members.some(member => member.user._id.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isManager && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get team statistics
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      activeTasks,
      completedTasks,
      overdueTasks
    ] = await Promise.all([
      Project.countDocuments({ team: id }),
      Project.countDocuments({ team: id, status: 'active' }),
      Project.countDocuments({ team: id, status: 'completed' }),
      Task.countDocuments({ 
        assignee: { $in: team.members.map(m => m.user._id) }
      }),
      Task.countDocuments({ 
        assignee: { $in: team.members.map(m => m.user._id) },
        status: { $in: ['pending', 'in-progress'] }
      }),
      Task.countDocuments({ 
        assignee: { $in: team.members.map(m => m.user._id) },
        status: 'completed'
      }),
      Task.countDocuments({ 
        assignee: { $in: team.members.map(m => m.user._id) },
        status: { $in: ['pending', 'in-progress'] },
        deadline: { $lt: new Date() }
      })
    ]);

    // Get member statistics
    const memberStats = await Promise.all(
      team.members.map(async (member) => {
        const [memberTasks, memberCompleted] = await Promise.all([
          Task.countDocuments({ assignee: member.user._id }),
          Task.countDocuments({ assignee: member.user._id, status: 'completed' })
        ]);

        return {
          user: member.user,
          role: member.role,
          tasks: {
            total: memberTasks,
            completed: memberCompleted,
            completionRate: memberTasks > 0 ? Math.round((memberCompleted / memberTasks) * 100) : 0
          }
        };
      })
    );

    res.json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        manager: team.manager,
        memberCount: team.members.length
      },
      statistics: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
        },
        tasks: {
          total: totalTasks,
          active: activeTasks,
          completed: completedTasks,
          overdue: overdueTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        },
        members: memberStats
      }
    });

  } catch (error) {
    console.error('Get team stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change team member role
// @route   PUT /api/teams/:id/members/:userId/role
// @access  Private (Team Leader or Admin)
exports.changeTeamRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['leader', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Valid role (leader or member) is required' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is member of the team
    const memberIndex = team.members.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'User is not a member of this team' });
    }

    // Change the role
    team.changeRole(userId, role);
    await team.save();

    // Populate the updated team
    await team.populate('members.user', 'name email avatar');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Team',
      entityId: team._id,
      metadata: { 
        action: 'change_role', 
        memberId: userId,
        newRole: role 
      }
    });

    res.json(team);
  } catch (error) {
    console.error('Error changing team member role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};