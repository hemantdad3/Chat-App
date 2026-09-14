const express = require('express');
const { signup, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatarMiddleware } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public auth routes
router.post('/signup', uploadAvatarMiddleware, signup);
router.post('/login', login);
router.post('/logout', logout);

// Protected session check route
router.get('/me', protect, getMe);

module.exports = router;
