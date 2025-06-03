const User = require('../models/User');
const Team = require('../models/Team');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get all users with advanced filtering and pagination (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      team = '',
      isActive = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};
      // Search by name, email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by team
    if (team) {
      query.team = mongoose.Types.ObjectId(team);
    }

    // Filter by active status
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get team information for each user
    const usersWithTeams = await Promise.all(users.map(async (user) => {
      const teams = await Team.find({
        'members.user': user._id
      }).select('name members');

      const userTeams = teams.map(team => {
        const memberData = team.members.find(
          member => member.user.toString() === user._id.toString()
        );
        return {
          _id: team._id,
          name: team.name,
          role: memberData ? memberData.team_role : null
        };
      });

      return {
        ...user.toObject(),
        teams: userTeams
      };
    }));

    const total = await User.countDocuments(query);

    // Calculate statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const managerCount = await User.countDocuments({ role: 'manager' });
    const memberCount = await User.countDocuments({ role: 'member' });

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      statistics: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roleDistribution: {
          admin: adminCount,
          manager: managerCount,
          member: memberCount
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID with detailed information
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }    // Get user info
    const user = await User.findById(userId).select('-password');
    
    // Get user's teams
    const teams = await Team.find({
      'members.user': userId
    }).select('name description members');

    const userTeams = teams.map(team => {
      const memberData = team.members.find(
        member => member.user.toString() === userId
      );
      return {
        _id: team._id,
        name: team.name,
        description: team.description,
        role: memberData ? memberData.team_role : null
      };
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const userStats = await Promise.all([
      Task.countDocuments({ assignee: userId }),
      Task.countDocuments({ assignee: userId, status: 'completed' }),
      Project.countDocuments({ 
        $or: [
          { manager: userId },
          { 'team.members': userId }
        ]
      }),
      Task.find({ assignee: userId, status: { $in: ['pending', 'in-progress'] } })
        .populate('project', 'name')
        .select('title priority deadline status project')
        .limit(5)
        .sort({ deadline: 1 })
    ]);

    const [totalTasks, completedTasks, projectCount, upcomingTasks] = userStats;    res.json({
      success: true,
      user: {
        ...user.toObject(),
        teams: userTeams
      },
      statistics: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        },
        projects: projectCount,
        upcomingTasks
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    // Only admin can create users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }    const { name, email, password, role = 'member', team, isActive = true } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({
      email
    });

    if (userExists) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    // Validate team if provided
    if (team) {
      const teamExists = await Team.findById(team);
      if (!teamExists) {
        return res.status(400).json({ message: 'Invalid team ID' });
      }
    }

    // Create user
    const user = await User.create({      name,
      email,
      password,
      role,
      team,
      isActive,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    // Add user to team if specified
    if (team) {
      await Team.findByIdAndUpdate(team, {
        $push: { members: { user: user._id, role: role === 'manager' ? 'manager' : 'member' } }
      });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'User',
      entityId: user._id,
      metadata: { createdBy: 'admin', userRole: role }
    });

    // Send notification to new user
    await Notification.create({
      user: user._id,
      title: 'Welcome to Task Manager',
      message: `Your account has been created with ${role} privileges.`,
      type: 'info'
    });

    const newUser = await User.findById(user._id)
      .populate('team', 'name')
      .select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user (Admin or user themselves)
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;    const { name, email, role, team, isActive, avatar } = req.body;

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isOwnProfile = req.user.id === userId;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Non-admin users can only update their own basic info
    const allowedFields = isAdmin 
      ? { name, email, role, team, isActive, avatar }
      : { name, email, avatar };

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        email
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Email already exists'
        });
      }
    }

    // If team is being changed, validate it exists
    if (team && team !== null) {
      const teamExists = await Team.findById(team);
      if (!teamExists) {
        return res.status(400).json({ message: 'Invalid team ID' });
      }
    }

    const oldUser = await User.findById(userId);
    if (!oldUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      allowedFields,
      { new: true, runValidators: true }
    ).populate('team', 'name').select('-password');

    // Handle team membership changes (admin only)
    if (isAdmin && team !== undefined) {
      // Remove from old team
      if (oldUser.team && oldUser.team.toString() !== team) {
        await Team.findByIdAndUpdate(oldUser.team, {
          $pull: { members: { user: userId } }
        });
      }

      // Add to new team
      if (team && oldUser.team?.toString() !== team) {
        await Team.findByIdAndUpdate(team, {
          $push: { members: { user: userId, role: role === 'manager' ? 'manager' : 'member' } }
        });
      }
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'User',
      entityId: userId,
      metadata: {
        updatedBy: isAdmin ? 'admin' : 'self',
        updatedFields: Object.keys(allowedFields).filter(key => allowedFields[key] !== undefined)
      }
    });

    // Send notification for important changes (admin actions)
    if (isAdmin && req.user.id !== userId) {
      const changes = [];
      if (role && role !== oldUser.role) changes.push(`role changed to ${role}`);
      if (team !== oldUser.team?.toString()) changes.push('team assignment updated');
      if (isActive !== undefined && isActive !== oldUser.isActive) {
        changes.push(isActive ? 'account activated' : 'account deactivated');
      }

      if (changes.length > 0) {
        await Notification.create({
          user: userId,
          title: 'Account Updated',
          message: `Your account has been updated: ${changes.join(', ')}.`,
          type: 'info'
        });
      }
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete/Deactivate user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const userId = req.params.id;
    const { permanent = false } = req.query;

    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has active tasks or is managing projects
    const [activeTasks, managingProjects] = await Promise.all([
      Task.countDocuments({ assignee: userId, status: { $in: ['pending', 'in-progress'] } }),
      Project.countDocuments({ manager: userId })
    ]);

    if (activeTasks > 0 || managingProjects > 0) {
      return res.status(400).json({
        message: `Cannot delete user. User has ${activeTasks} active tasks and is managing ${managingProjects} projects. Please reassign these first.`,
        details: { activeTasks, managingProjects }
      });
    }

    if (permanent === 'true') {
      // Permanent deletion
      await User.findByIdAndDelete(userId);

      // Remove from team if assigned
      if (user.team) {
        await Team.findByIdAndUpdate(user.team, {
          $pull: { members: { user: userId } }
        });
      }

      // Log activity
      await ActivityLog.create({
        user: req.user.id,
        action: 'delete',
        entityType: 'User',
        entityId: userId,
        metadata: { deletionType: 'permanent', deletedUser: user.email }
      });

      res.json({
        success: true,
        message: 'User permanently deleted'
      });
    } else {
      // Soft delete (deactivate)
      user.isActive = false;
      await user.save();

      // Log activity
      await ActivityLog.create({
        user: req.user.id,
        action: 'update',
        entityType: 'User',
        entityId: userId,
        metadata: { action: 'deactivation' }
      });

      // Send notification
      await Notification.create({
        user: userId,
        title: 'Account Deactivated',
        message: 'Your account has been deactivated by an administrator.',
        type: 'warning'
      });

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    }

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Activate/Reactivate user (Admin only)
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
exports.activateUser = async (req, res) => {
  try {
    // Only admin can activate users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'User',
      entityId: user._id,
      metadata: { action: 'activation' }
    });

    // Send notification
    await Notification.create({
      user: user._id,
      title: 'Account Activated',
      message: 'Your account has been reactivated. You can now log in and access the system.',
      type: 'success'
    });

    res.json({
      success: true,
      message: 'User activated successfully',
      user
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.changeUserRole = async (req, res) => {
  try {
    // Only admin can change user roles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { role } = req.body;
    const userId = req.params.id;

    if (!role || !['admin', 'manager', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, manager, or member.' });
    }

    // Prevent admin from demoting themselves
    if (req.user.id === userId && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot change your own admin role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).populate('team', 'name').select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update team role if user is in a team
    if (user.team) {
      await Team.findOneAndUpdate(
        { _id: user.team._id, 'members.user': userId },
        { $set: { 'members.$.role': role === 'manager' ? 'manager' : 'member' } }
      );
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'User',
      entityId: userId,
      metadata: { action: 'role_change', newRole: role }
    });

    // Send notification
    await Notification.create({
      user: userId,
      title: 'Role Updated',
      message: `Your role has been changed to ${role}.`,
      type: 'info'
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      user
    });

  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get teams where user is a member
    const teams = await Team.find({
      'members.user': user._id
    }).select('name members');

    // Get user's role in each team
    const userTeams = teams.map(team => {
      const memberData = team.members.find(
        member => member.user.toString() === user._id.toString()
      );
      return {
        _id: team._id,
        name: team.name,
        role: memberData ? memberData.team_role : null
      };
    });

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        teams: userTeams
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const teamId = req.params.id;

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (team.members.some(member => member.user.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    // Add member with default role 'member'
    team.members.push({
      user: userId,
      team_role: 'member'
    });

    await team.save();

    // Populate team data
    await team.populate('members.user', 'name email avatar');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'Team',
      entityId: team._id,
      metadata: {
        action: 'add_member',
        memberId: userId
      }
    });

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    // Create team with the current user as leader
    const team = await Team.create({
      name,
      description,
      members: [{
        user: req.user.id,
        team_role: 'leader'
      }]
    });

    // Ghi lại hoạt động
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      entityType: 'Team',
      entityId: team._id,
      metadata: {
        teamName: name,
        creator: req.user.id,
        role: 'leader'
      }
    });

    // Populate the team data before sending response
    await team.populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};