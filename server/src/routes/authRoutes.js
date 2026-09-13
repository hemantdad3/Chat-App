const express = require('express');
const { signup, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Protected session check route
router.get('/me', protect, getMe);

module.exports = router;
