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
        !team.isMember(req.user.id)) {
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
// @access  Private (Admin/Leader)
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }    // Check permissions
    if (req.user.role !== 'admin' && !team.isLeader(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this team' });
    }    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, description: req.body.description },
      { new: true, runValidators: true }
    ).populate('members.user', 'name email avatar role');

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
// @access  Private (Admin/Leader)
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
    if (req.user.role === 'member') {      return res.status(403).json({ message: 'Not authorized to add members' });
    }

    if (req.user.role === 'admin' && team.manager.toString() !== req.user.id) {
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
    if (req.user.role === 'member') {      return res.status(403).json({ message: 'Not authorized to remove members' });
    }

    if (req.user.role === 'admin' && team.manager.toString() !== req.user.id) {
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

// @desc    Get teams for current user
// @route   GET /api/teams/my
// @access  Private
exports.getMyTeam = async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.user.id })
      .populate('members.user', 'name email avatar role')
      .sort({ createdAt: -1 });

    // Add member count and project count for each team
    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        const projectCount = await Project.countDocuments({ team: team._id });
        return {
          ...team.toObject(),
          projectCount,
          memberCount: team.members.length
        };
      })
    );

    res.json({
      success: true,
      count: teamsWithStats.length,
      data: teamsWithStats
    });
  } catch (error) {
    console.error('Error fetching user teams:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching teams' 
    });
  }
};

// @desc    Get team members for dropdown (confirmed members only)
// @route   GET /api/teams/my-members
// @access  Private
exports.getMyTeamMembers = async (req, res) => {
  try {
    // Find all teams where the current user is a member
    const teams = await Team.find({
      'members.user': req.user.id
    }).populate('members.user', 'name email avatar role');

    // Extract all confirmed team members (excluding the current user)
    const allMembers = new Map();
    
    teams.forEach(team => {
      team.members.forEach(member => {
        if (member.user._id.toString() !== req.user.id) {
          allMembers.set(member.user._id.toString(), {
            _id: member.user._id,
            name: member.user.name,
            email: member.user.email,
            avatar: member.user.avatar,
            role: member.user.role
          });
        }
      });
    });

    // Convert Map to Array
    const members = Array.from(allMembers.values());

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Check if current user is a team leader
// @route   GET /api/teams/check-leader  
// @access  Private
exports.checkUserIsTeamLeader = async (req, res) => {
  try {
    // Find all teams where the current user is a leader
    const teams = await Team.find({
      'members': {
        $elemMatch: {
          user: req.user.id,
          team_role: 'leader'
        }
      }
    });

    const isLeader = teams.length > 0;

    res.status(200).json({
      success: true,
      isLeader: isLeader
    });
  } catch (error) {
    console.error('Error checking team leader status:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Tìm kiếm team theo tên (ai đăng nhập cũng dùng được)
exports.searchTeams = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) return res.json({ data: [] });
    const teams = await Team.find({
      name: { $regex: q, $options: 'i' }
    }).select('_id name members');
    res.json({ data: teams });
  } catch (error) {
    console.error('Search teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Advanced search for teams (multi-filter, sort, pagination)
// @route   GET /api/teams/advanced-search
// @access  Private
exports.advancedSearchTeams = async (req, res) => {
  try {
    const {
      q = '',
      member,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = req.query;
    const filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.name = regex;
    }
    if (member) filter['members.user'] = member;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const [teams, total] = await Promise.all([
      Team.find(filter)
        .populate('members.user', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Team.countDocuments(filter)
    ]);
    res.json({ success: true, data: teams, total });
  } catch (error) {
    console.error('Advanced search teams error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Advanced analytics for teams
// @route   GET /api/teams/advanced-analytics
// @access  Private
exports.advancedTeamAnalytics = async (req, res) => {
  try {
    const teams = await Team.find({});
    const bySize = {};
    teams.forEach(team => {
      const size = team.members.length;
      bySize[size] = (bySize[size] || 0) + 1;
    });
    res.json({ success: true, stats: { bySize, total: teams.length } });
  } catch (error) {
    console.error('Advanced team analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Autocomplete for team name
// @route   GET /api/teams/autocomplete
// @access  Private
exports.autocompleteTeam = async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;
    if (!q) return res.json({ data: [] });
    const regex = new RegExp(q, 'i');
    const teams = await Team.find({ name: regex }).select('name').limit(parseInt(limit));
    res.json({ data: teams });
  } catch (error) {
    console.error('Autocomplete team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export teams to CSV (filtered)
// @route   GET /api/teams/export
// @access  Private
exports.exportTeamsCSV = async (req, res) => {
  try {
    const { member } = req.query;
    const filter = {};
    if (member) filter['members.user'] = member;
    const teams = await Team.find(filter).populate('members.user', 'name email');
    let csv = 'Name,Description,Size,Members\n';
    teams.forEach(t => {
      csv += `"${t.name}","${t.description}",${t.members.length},"${t.members.map(m => m.user.name).join('; ')}"\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('teams.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export teams CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};