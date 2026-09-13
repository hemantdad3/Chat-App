const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateTokenAndSetCookie = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    if (user) {
      // Issue JWT in httpOnly cookie
      const token = generateTokenAndSetCookie(res, user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
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
