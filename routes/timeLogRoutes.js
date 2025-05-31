const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getTimeLogs,
  addTimeLog
} = require('../controllers/timeLogController');
const router = express.Router();

router.route('/')
  .get(protect, getTimeLogs)
  .post(protect, addTimeLog);

module.exports = router;