const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // ❌ bỏ '|| abc123'

      // Lấy thông tin người dùng từ token
      req.user = await User.findById(decoded.id).select('-password');

      return next();
    } catch (error) {
      console.error('JWT error:', error.message); // log lỗi rõ ràng hơn
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  }

  // Nếu không có token
  return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
};

// Middleware cho quyền Admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(401).json({ message: 'Chỉ admin mới được phép truy cập' });
  }
};

// Middleware for role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource` 
      });
    }

    next();
  };
};

// Middleware for team role-based authorization
const authorizeTeamRole = (teamIdParam, ...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    // Admin can do anything
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      // Get teamId from request parameters or body
      const teamId = req.params[teamIdParam] || req.body[teamIdParam] || req.body.team;
      
      if (!teamId) {
        return res.status(400).json({
          success: false,
          message: 'Team ID is required'
        });
      }

      // Find team and check user's role
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      // Check if user is a member of the team
      const memberData = team.members.find(
        member => member.user.toString() === req.user.id.toString()
      );

      if (!memberData) {
        return res.status(403).json({
          success: false,
          message: 'User is not a member of this team'
        });
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(memberData.team_role)) {
        return res.status(403).json({
          success: false,
          message: `Team role '${memberData.team_role}' is not authorized for this action`
        });
      }

      // Add team data to request object for convenient access
      req.team = team;
      req.teamRole = memberData.team_role;
      
      next();
    } catch (error) {
      console.error('Team authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking team permissions'
      });
    }
  };
};

module.exports = { protect, admin, authorize, authorizeTeamRole };
