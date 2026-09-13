const Conversation = require('../models/Conversation');
const User = require('../models/User');

/**
 * @desc    Get all conversations for the authenticated user
 * @route   GET /api/conversations
 * @access  Protected
 */
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      members: currentUserId,
    })
      .populate('members', 'name email isOnline lastSeen')
      .populate('admins', 'name email')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name email',
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('getConversations error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve conversations' });
  }
};

/**
 * @desc    Create or retrieve existing direct 1-on-1 conversation
 * @route   POST /api/conversations
 * @access  Protected
 */
const createOrGetConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { recipientId, isGroup, name, memberIds } = req.body;

    // Direct 1-on-1 chat logic
    if (!isGroup) {
      if (!recipientId) {
        return res.status(400).json({ message: 'recipientId is required for direct conversation' });
      }

      if (recipientId.toString() === currentUserId.toString()) {
        return res.status(400).json({ message: 'Cannot start a direct conversation with yourself' });
      }

      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient user not found' });
      }

      // Check for existing 1-on-1 conversation between these two users
      let conversation = await Conversation.findOne({
        isGroup: false,
        members: { $all: [currentUserId, recipientId], $size: 2 },
      })
        .populate('members', 'name email isOnline lastSeen')
        .populate({
          path: 'lastMessage',
          populate: { path: 'sender', select: 'name email' },
        });

      if (conversation) {
        return res.status(200).json(conversation);
      }

      // Create new direct conversation
      const newConversation = await Conversation.create({
        isGroup: false,
        name: null,
        members: [currentUserId, recipientId],
        admins: [],
      });

      conversation = await Conversation.findById(newConversation._id).populate(
        'members',
        'name email isOnline lastSeen'
      );

      return res.status(201).json(conversation);
    }

    // Group chat logic (prepared for Phase 5)
    if (isGroup) {
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Group name is required' });
      }
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length < 1) {
        return res.status(400).json({ message: 'Group must contain at least 1 other member' });
      }

      const allMembers = Array.from(new Set([currentUserId.toString(), ...memberIds]));

      const newGroup = await Conversation.create({
        isGroup: true,
        name: name.trim(),
        members: allMembers,
        admins: [currentUserId],
      });

      const populatedGroup = await Conversation.findById(newGroup._id)
        .populate('members', 'name email isOnline lastSeen')
        .populate('admins', 'name email');

      return res.status(201).json(populatedGroup);
    }
  } catch (error) {
    console.error('createOrGetConversation error:', error.message);
    res.status(500).json({ message: 'Failed to create or retrieve conversation' });
  }
};

module.exports = {
  getConversations,
  createOrGetConversation,
};
