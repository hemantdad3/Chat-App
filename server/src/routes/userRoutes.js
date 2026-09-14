const express = require('express');
const {
  getUsers,
  getUserById,
  updateProfile,
  uploadAvatar,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatarMiddleware } = require('../middleware/uploadMiddleware');

const router = express.Router();

// GET /api/users - Search and list users
router.get('/', protect, getUsers);

// PATCH /api/users/me - Update current user username and/or bio
router.patch('/me', protect, updateProfile);

// POST /api/users/avatar - Upload avatar to ImageKit
router.post('/avatar', protect, uploadAvatarMiddleware, uploadAvatar);

// GET /api/users/:id - Get user profile details
router.get('/:id', protect, getUserById);

module.exports = router;
