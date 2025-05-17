const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getComments,
  addComment
} = require('../controllers/commentController');
const router = express.Router();

router.route('/')
  .get(protect, getComments)
  .post(protect, addComment);

module.exports = router;