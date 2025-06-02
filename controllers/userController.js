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
    // Only admin can access all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

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
    
    // Search by name, email, or username
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
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
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .populate('team', 'name')
      .select('-password')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    }

    const user = await User.findById(userId)
      .populate('team', 'name description')
      .select('-password');
    
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

    const [totalTasks, completedTasks, projectCount, upcomingTasks] = userStats;

    res.json({
      success: true,
      user,
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
    }

    const { name, email, username, password, role = 'member', team, isActive = true } = req.body;

    // Validation
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({
        message: userExists.email === email ? 'Email already exists' : 'Username already exists'
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
    const user = await User.create({
      name,
      email,
      username,
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
    const userId = req.params.id;
    const { name, email, username, role, team, isActive, avatar } = req.body;

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isOwnProfile = req.user.id === userId;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Non-admin users can only update their own basic info
    const allowedFields = isAdmin 
      ? { name, email, username, role, team, isActive, avatar }
      : { name, email, username, avatar };

    // Check if email/username is already taken by another user
    if (email || username) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : [])
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === email ? 'Email already exists' : 'Username already exists'
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

exports.addTeamMember = async (req, res) => {
  // ... existing code ...
  team.members.push({ user: userId, role: 'member' }); // Thêm vai trò mặc định
  // ... existing code ...
};

exports.createTeam = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    // Kiểm tra nếu manager tồn tại
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(400).json({ message: 'Invalid manager ID' });
    }

    const team = await Team.create({
      name,
      description,
      manager: managerId,
      members: [managerId]
    });

    // Thêm team vào hồ sơ của manager
    await User.findByIdAndUpdate(managerId, { team: team._id });

    // Ghi lại hoạt động
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