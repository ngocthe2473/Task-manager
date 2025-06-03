const express = require('express');
const router = express.Router();
const { 
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile
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

module.exports = router;