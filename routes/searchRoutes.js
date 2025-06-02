const express = require('express');
const {
  globalSearch,
  advancedSearch,
  getSearchSuggestions
} = require('../controllers/searchController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// @route   GET /api/search
// @desc    Perform global search across all entities
// @access  Private
router.get('/', globalSearch);

// @route   POST /api/search/advanced
// @desc    Perform advanced search with complex filters
// @access  Private
router.post('/advanced', advancedSearch);

// @route   GET /api/search/suggestions
// @desc    Get search suggestions for autocomplete
// @access  Private
router.get('/suggestions', getSearchSuggestions);

module.exports = router;
