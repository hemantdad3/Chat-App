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
      .populate('members', 'name email username avatarUrl bio isOnline lastSeen')
      .populate('admins', 'name email username avatarUrl bio')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name email username avatarUrl bio',
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
 * @desc    Create or retrieve existing direct 1-on-1 or new group conversation
 * @route   POST /api/conversations
 * @access  Protected
 */
const createOrGetConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { recipientId, isGroup, name, memberIds } = req.body;

    // --- Direct 1-on-1 chat logic ---
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
        .populate('members', 'name email username avatarUrl bio isOnline lastSeen')
        .populate({
          path: 'lastMessage',
          populate: { path: 'sender', select: 'name email username avatarUrl bio' },
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
        'name email username avatarUrl bio isOnline lastSeen'
      );

      return res.status(201).json(conversation);
    }

    // --- Multi-user Group chat logic ---
    if (isGroup) {
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Group name is required' });
      }
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length < 1) {
        return res.status(400).json({ message: 'Group must contain at least 1 other member' });
      }

      // Ensure creator is included in members
      const allMembers = Array.from(
        new Set([currentUserId.toString(), ...memberIds.map((id) => id.toString())])
      );

      const newGroup = await Conversation.create({
        isGroup: true,
        name: name.trim(),
        members: allMembers,
        admins: [currentUserId], // Creator is default admin
      });

      const populatedGroup = await Conversation.findById(newGroup._id)
        .populate('members', 'name email username avatarUrl bio isOnline lastSeen')
        .populate('admins', 'name email username avatarUrl bio');

      // If socket server is available, emit event to notify members
      const io = req.app.get('io');
      if (io) {
        allMembers.forEach((memberId) => {
          io.to(`user_${memberId}`).emit('new_group_created', populatedGroup);
        });
      }

      return res.status(201).json(populatedGroup);
    }
  } catch (error) {
    console.error('createOrGetConversation error:', error.message);
    res.status(500).json({ message: 'Failed to create or retrieve conversation' });
  }
};

/**
 * @desc    Update group conversation (rename, add member, remove member)
 * @route   PATCH /api/conversations/:id
 * @access  Protected (Admin only)
 */
const updateGroup = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const currentUserId = req.user._id;
    const { name, addMemberId, removeMemberId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'Cannot modify a direct 1-on-1 conversation as a group' });
    }

    // Admin authorization check: only group admins can add/remove members or rename
    const isAdmin = conversation.admins.some(
      (adminId) => adminId.toString() === currentUserId.toString()
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only group admins can modify group settings or members' });
    }

    // 1. Rename Group
    if (name && name.trim()) {
      conversation.name = name.trim();
    }

    // 2. Add Member
    if (addMemberId) {
      const userToAdd = await User.findById(addMemberId);
      if (!userToAdd) {
        return res.status(404).json({ message: 'User to add was not found' });
      }

      const alreadyMember = conversation.members.some(
        (mId) => mId.toString() === addMemberId.toString()
      );

      if (!alreadyMember) {
        conversation.members.push(addMemberId);
      }
    }

    // 3. Remove Member
    if (removeMemberId) {
      // Prevent removing the only member
      if (conversation.members.length <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last member of a group' });
      }

      conversation.members = conversation.members.filter(
        (mId) => mId.toString() !== removeMemberId.toString()
      );

      // If removed member was an admin, remove from admins list
      conversation.admins = conversation.admins.filter(
        (aId) => aId.toString() !== removeMemberId.toString()
      );

      // If no admins remain, assign the current admin (or first member) as admin
      if (conversation.admins.length === 0 && conversation.members.length > 0) {
        conversation.admins.push(conversation.members[0]);
      }
    }

    await conversation.save();

    const updatedConversation = await Conversation.findById(conversationId)
      .populate('members', 'name email username avatarUrl bio isOnline lastSeen')
      .populate('admins', 'name email username avatarUrl bio')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name email username avatarUrl bio' },
      });

    // Broadcast update to conversation room via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('group_updated', updatedConversation);
    }

    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error('updateGroup error:', error.message);
    res.status(500).json({ message: 'Failed to update group conversation' });
  }
};

module.exports = {
  getConversations,
  createOrGetConversation,
  updateGroup,
};
