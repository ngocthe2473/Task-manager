const express = require('express');
const { protect, admin } = require('../middlewares/auth');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;