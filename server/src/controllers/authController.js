const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateTokenAndSetCookie = require('../utils/generateToken');
const { isConfigured, getImageKit } = require('../config/imagekit');
const { sanitizeInput } = require('../utils/sanitize');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { name, email, password, username, bio } = req.body;

    if (!name || !email || !password || !username || !username.trim()) {
      return res.status(400).json({ message: 'Please provide name, username, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists with email
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate required username format and uniqueness
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({
        message: 'Username must be between 3 and 30 characters and contain only letters, numbers, and underscores',
      });
    }

    const usernameExists = await User.findOne({ username: cleanUsername });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Validate and sanitize bio if provided
    let cleanBio = '';
    if (bio !== undefined && bio !== null && bio.trim()) {
      cleanBio = sanitizeInput(bio);
      if (cleanBio.length > 150) {
        return res.status(400).json({ message: 'Bio cannot exceed 150 characters' });
      }
    }

    // Handle avatar upload if file is attached
    let avatarUrl = null;
    if (req.file) {
      if (isConfigured()) {
        try {
          const imagekit = getImageKit();
          const fileExtension = req.file.mimetype.split('/')[1] || 'jpg';
          const fileName = `avatar_signup_${Date.now()}.${fileExtension}`;

          const uploadResult = await imagekit.upload({
            file: req.file.buffer.toString('base64'),
            fileName,
            folder: '/chat_avatars',
          });

          if (uploadResult && uploadResult.url) {
            avatarUrl = uploadResult.url;
          }
        } catch (uploadErr) {
          console.error('Signup avatar upload warning:', uploadErr.message);
        }
      }
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Build user payload
    const userPayload = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    };

    if (cleanUsername) userPayload.username = cleanUsername;
    if (cleanBio) userPayload.bio = cleanBio;
    if (avatarUrl) userPayload.avatarUrl = avatarUrl;

    // Create user in database
    const user = await User.create(userPayload);

    if (user) {
      // Issue JWT in httpOnly cookie
      const token = generateTokenAndSetCookie(res, user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        token, // fallback token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Signup Error:', error.message);
    res.status(500).json({ message: error.message || 'Server error during signup' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      // Issue JWT in httpOnly cookie
      const token = generateTokenAndSetCookie(res, user._id);

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error.message);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

/**
 * @desc    Get current user profile / verify session
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error('GetMe Error:', error.message);
    res.status(500).json({ message: 'Server error fetching user session' });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
};
