const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Protects routes by validating JWT from either httpOnly cookies or Authorization header.
 * Attaches the authenticated user (without password hash) to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check httpOnly cookie first
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2. Fallback to Authorization Bearer token header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed or expired' });
  }
};

module.exports = { protect };
