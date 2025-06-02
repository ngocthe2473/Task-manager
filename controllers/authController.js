const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../config/auth');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {    const { username, email, password, name } = req.body;

    // Validation
    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Default role is 'user' unless explicitly set to 'admin' by another admin
    const role = 'user';

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email ? 'Email already exists' : 'Username already exists'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      name,
      password, // Will be hashed by pre-save middleware
      role,
      isActive: true
    });

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'create',
      entityType: 'User',
      entityId: user._id,
      metadata: { userAgent: req.get('User-Agent'), ip: req.ip }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Log login activity
    await ActivityLog.create({
      user: user._id,
      action: 'login',
      entityType: 'User',
      entityId: user._id,
      metadata: { 
        userAgent: req.get('User-Agent'), 
        ip: req.ip,
        loginTime: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        team: user.team,
        isActive: user.isActive
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Log logout activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'logout',
      entityType: 'User',
      entityId: req.user.id,
      metadata: { 
        logoutTime: new Date(),
        userAgent: req.get('User-Agent'), 
        ip: req.ip
      }
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('team', 'name description')
      .select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, username } = req.body;

    // Check if email/username is already taken by another user
    if (email || username) {
      const existingUser = await User.findOne({
        _id: { $ne: req.user.id },
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

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, username },
      { new: true, runValidators: true }
    ).select('-password');

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'User',
      entityId: req.user.id,
      metadata: { updatedFields: Object.keys(req.body) }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      entityType: 'User',
      entityId: req.user.id,
      metadata: { action: 'password_change' }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};