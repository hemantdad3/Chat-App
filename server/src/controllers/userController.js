const User = require('../models/User');
const { isConfigured, getImageKit } = require('../config/imagekit');
const { sanitizeInput } = require('../utils/sanitize');

/**
 * @desc    Search and list users for starting conversations
 * @route   GET /api/users
 * @access  Protected
 */
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user._id;

    // Build filter excluding the logged-in user
    const query = {
      _id: { $ne: currentUserId },
    };

    // If search term provided, match across name or username
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: new RegExp(term, 'i') },
        { username: new RegExp(term, 'i') },
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ name: 1 })
      .limit(50);

    res.status(200).json(users);
  } catch (error) {
    console.error('getUsers error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Protected
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('getUserById error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve user profile' });
  }
};

/**
 * @desc    Update current user profile (username, bio)
 * @route   PATCH /api/users/me
 * @access  Protected
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Validate and update username
    if (username !== undefined) {
      const cleanUsername = username.trim().toLowerCase();

      // Username length and character validation
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
        return res.status(400).json({
          message: 'Username must be between 3 and 30 characters and contain only letters, numbers, and underscores',
        });
      }

      // Check uniqueness if changing username
      if (cleanUsername !== user.username) {
        const existing = await User.findOne({
          username: cleanUsername,
          _id: { $ne: userId },
        });

        if (existing) {
          return res.status(400).json({ message: 'Username is already taken' });
        }

        user.username = cleanUsername;
      }
    }

    // 2. Validate and update bio
    if (bio !== undefined) {
      const cleanBio = sanitizeInput(bio);
      if (cleanBio.length > 150) {
        return res.status(400).json({ message: 'Bio cannot exceed 150 characters' });
      }
      user.bio = cleanBio;
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-passwordHash');

    // Notify connected clients via Socket.io if active
    const io = req.app.get('io');
    if (io) {
      io.emit('user_profile_updated', {
        userId: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
      });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('updateProfile error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
};

/**
 * @desc    Upload avatar image to ImageKit and update avatarUrl
 * @route   POST /api/users/avatar
 * @access  Protected
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please provide an image file (JPG only, under 2MB)' });
    }

    const isJpegMime = req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/pjpeg';
    const hasJpgExt = /\.(jpe?g)$/i.test(req.file.originalname);
    if (!isJpegMime || !hasJpgExt) {
      return res.status(400).json({ message: 'Invalid file type. Only JPG/JPEG images are allowed.' });
    }

    if (!isConfigured()) {
      return res.status(500).json({
        message: 'ImageKit credentials are not configured on the server. Please check your server environment settings.',
      });
    }

    const imagekit = getImageKit();
    const userId = req.user._id;
    const fileExtension = req.file.mimetype.split('/')[1] || 'jpg';
    const fileName = `avatar_${userId}_${Date.now()}.${fileExtension}`;

    // Upload to ImageKit via buffer encoded in base64
    const uploadResult = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName,
      folder: '/chat_avatars',
    });

    if (!uploadResult || !uploadResult.url) {
      return res.status(500).json({ message: 'Failed to upload image to ImageKit' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatarUrl = uploadResult.url;
    await user.save();

    const updatedUser = await User.findById(userId).select('-passwordHash');

    // Broadcast profile update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('user_profile_updated', {
        userId: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
      });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('uploadAvatar error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to upload avatar' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  uploadAvatar,
};
