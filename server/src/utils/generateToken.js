const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token and attaches it as an httpOnly cookie to the response.
 * Also returns the token string for client-side bearer header fallback.
 * 
 * @param {object} res - Express response object
 * @param {string} userId - User's MongoDB _id
 * @returns {string} Signed JWT token
 */
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Cookie options
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('jwt', token, {
    httpOnly: true, // Prevents client-side scripts from reading the cookie
    secure: isProduction, // Transmitted only over HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin production deploys
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
