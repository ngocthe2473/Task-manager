const { body, validationResult, param, query } = require('express-validator');

// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'member'])
    .withMessage('Role must be admin, manager, or member'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'member'])
    .withMessage('Role must be admin, manager, or member'),
  handleValidationErrors
];

// Task validation rules
const validateTaskCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be at most 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be at most 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('Assignee must be a valid user ID'),
  body('project')
    .optional()
    .isMongoId()
    .withMessage('Project must be a valid project ID'),
  handleValidationErrors
];

const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be at most 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('Assignee must be a valid user ID'),
  handleValidationErrors
];

// Project validation rules
const validateProjectCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name is required and must be at most 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
  body('team')
    .isMongoId()
    .withMessage('Team is required and must be a valid team ID'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
    .withMessage('Status must be planning, active, on_hold, completed, or cancelled'),
  handleValidationErrors
];

const validateProjectUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be at most 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
  body('team')
    .optional()
    .isMongoId()
    .withMessage('Team must be a valid team ID'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
    .withMessage('Status must be planning, active, on_hold, completed, or cancelled'),
  handleValidationErrors
];

// Team validation rules
const validateTeamCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Team name is required and must be at most 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
  handleValidationErrors
];

const validateTeamUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Team name must be at most 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
  body('manager')
    .optional()
    .isMongoId()
    .withMessage('Manager must be a valid user ID'),
  handleValidationErrors
];

// Comment validation rules
const validateCommentCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content is required and must be at most 1000 characters'),
  body('taskId')
    .optional()
    .isMongoId()
    .withMessage('Task ID must be a valid MongoDB ObjectId'),
  body('projectId')
    .optional()
    .isMongoId()
    .withMessage('Project ID must be a valid MongoDB ObjectId'),
  body('parentComment')
    .optional()
    .isMongoId()
    .withMessage('Parent comment must be a valid MongoDB ObjectId'),
  handleValidationErrors
];

// SubTask validation rules
const validateSubTaskCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('SubTask title is required and must be at most 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
  body('task')
    .isMongoId()
    .withMessage('Task is required and must be a valid task ID'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('Assignee must be a valid user ID'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
  handleValidationErrors
];

// Parameter validation
const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort field must be specified'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('type')
    .optional()
    .isIn(['tasks', 'projects', 'users', 'teams', 'all'])
    .withMessage('Search type must be tasks, projects, users, teams, or all'),
  handleValidationErrors
];

// Time log validation
const validateTimeLogCreation = [
  body('task')
    .isMongoId()
    .withMessage('Task is required and must be a valid task ID'),
  body('startTime')
    .isISO8601()
    .withMessage('Start time is required and must be a valid date'),
  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid date'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
  body('duration')
    .optional()
    .isNumeric()
    .withMessage('Duration must be a number'),
  handleValidationErrors
];

module.exports = {
  // User validations
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  
  // Task validations
  validateTaskCreation,
  validateTaskUpdate,
  
  // Project validations
  validateProjectCreation,
  validateProjectUpdate,
  
  // Team validations
  validateTeamCreation,
  validateTeamUpdate,
  
  // Comment validations
  validateCommentCreation,
  
  // SubTask validations
  validateSubTaskCreation,
  
  // General validations
  validateMongoId,
  validatePagination,
  validateSearch,
  validateTimeLogCreation,
  
  // Error handler
  handleValidationErrors
};
