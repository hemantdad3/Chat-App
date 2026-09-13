const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { sanitizeInput } = require('../utils/sanitize');

/**
 * @desc    Get message history for a conversation
 * @route   GET /api/conversations/:id/messages
 * @access  Protected
 */
const getMessages = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const currentUserId = req.user._id;

    // Verify user is a member of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: currentUserId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found or access denied' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('getMessages error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve messages' });
  }
};

/**
 * @desc    Send a new message to a conversation (REST fallback / helper)
 * @route   POST /api/conversations/:id/messages
 * @access  Protected
 */
const sendMessage = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const cleanContent = sanitizeInput(content);
    if (!cleanContent) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    // Verify user is a member
    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: currentUserId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found or access denied' });
    }

    // Create and persist message
    const message = await Message.create({
      conversationId,
      sender: currentUserId,
      content: cleanContent,
    });

    // Update conversation lastMessage reference and touch updatedAt
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name email'
    );

    // Broadcast over Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('receive_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('sendMessage error:', error.message);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
