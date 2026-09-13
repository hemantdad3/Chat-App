const User = require('../models/User');

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

    // If search term provided, match against name or email
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
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

module.exports = { getUsers };
