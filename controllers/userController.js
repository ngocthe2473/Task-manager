const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'User',
      entityId: user._id
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'User',
      entityId: user._id
    });

    res.json({ message: 'User removed' });
  } catch (error) {
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