const Team = require('../models/Team');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('manager', 'username email')
      .populate('members', 'username email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a team
// @route   POST /api/teams
// @access  Private/Admin
exports.createTeam = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    // Check if manager exists
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'manager') {
      return res.status(400).json({ message: 'Invalid manager ID' });
    }

    const team = await Team.create({
      name,
      description,
      manager: managerId,
      members: [managerId]
    });

    // Add team to manager's profile
    await User.findByIdAndUpdate(managerId, { team: team._id });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Team',
      entityId: team._id
    });

    res.status(201).json(team);
  } catch (error) {
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

    // Check if user is team manager
    if (team.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already in team
    if (team.members.includes(userId)) {
      return res.status(400).json({ message: 'User already in team' });
    }

    team.members.push(userId);
    await team.save();

    // Update user's team reference
    user.team = team._id;
    await user.save();

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