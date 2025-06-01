const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .post(protect, createNotification)
  .delete(protect, clearAllNotifications);

router.route('/read-all')
  .put(protect, markAllAsRead);

router.route('/:id')
  .delete(protect, deleteNotification);

router.route('/:id/read')
  .put(protect, markAsRead);

module.exports = router;