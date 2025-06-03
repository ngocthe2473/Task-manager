const express = require('express');
const router = express.Router();
const { 
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  searchUsers,
  advancedSearchUsers,
  advancedUserAnalytics,
  autocompleteUser,
  exportUsersCSV
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const { 
  validateUserUpdate, 
  validateMongoId, 
  validatePagination 
} = require('../middlewares/validation');

// Protected Routes
router.route('/profile')
  .get(authenticate, getUserProfile)
  .put(authenticate, validateUserUpdate, updateUserProfile);

// Admin Routes
router.route('/')
  .get(authenticate, authorize(['admin']), validatePagination, getUsers);

router.route('/:id')
  .get(authenticate, validateMongoId, getUser)
  .put(authenticate, authorize(['admin']), validateMongoId, validateUserUpdate, updateUser)
  .delete(authenticate, authorize(['admin']), validateMongoId, deleteUser);

// Route search user by email/name cho mọi user đăng nhập
router.get('/search', authenticate, searchUsers);

// Advanced APIs
router.get('/advanced-search', authenticate, authorize(['admin']), advancedSearchUsers);
router.get('/advanced-analytics', authenticate, authorize(['admin']), advancedUserAnalytics);
router.get('/autocomplete', authenticate, autocompleteUser);
router.get('/export', authenticate, authorize(['admin']), exportUsersCSV);

module.exports = router;