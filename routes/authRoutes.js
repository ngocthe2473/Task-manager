const express = require('express');
const { register, login } = require('../controllers/authController');
const { validateUserRegistration, validateUserLogin } = require('../middlewares/validation');
const { authRateLimit } = require('../middlewares/rateLimiting');
const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authRateLimit);

router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

module.exports = router;