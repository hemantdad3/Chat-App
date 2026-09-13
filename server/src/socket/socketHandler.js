const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * Socket.io Handler
 * Manages authenticated connections, conversation rooms, and real-time message relays.
 * 
 * @param {import('socket.io').Server} io
 */
const initSocket = (io) => {
  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token = null;

      // 1. Try reading token from cookie header
      if (socket.handshake.headers.cookie) {
        const parsedCookies = cookie.parse(socket.handshake.headers.cookie);
        token = parsedCookies.jwt;
      }

      // 2. Fallback to auth payload
      if (!token && socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication failed:', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.name} - ${socket.user._id})`);

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room: ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left room: ${conversationId}`);
    });

    // Send a message in real-time
    socket.on('send_message', async (data, ack) => {
      try {
        const { conversationId, content } = data;

        if (!conversationId || !content || !content.trim()) {
          if (typeof ack === 'function') {
            return ack({ error: 'Conversation ID and non-empty content required' });
          }
          return;
        }

        // Verify membership in conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          members: socket.user._id,
        });

        if (!conversation) {
          if (typeof ack === 'function') {
            return ack({ error: 'Conversation not found or unauthorized' });
          }
          return;
        }

        // Save message to MongoDB
        const message = await Message.create({
          conversationId,
          sender: socket.user._id,
          content: content.trim(),
        });

        // Update conversation lastMessage
        conversation.lastMessage = message._id;
        await conversation.save();

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name email'
        );

        // Broadcast to all sockets in conversation room (including sender or acknowledge sender)
        io.to(conversationId).emit('receive_message', populatedMessage);

        if (typeof ack === 'function') {
          ack({ status: 'ok', message: populatedMessage });
        }
      } catch (err) {
        console.error('Socket send_message error:', err.message);
        if (typeof ack === 'function') {
          ack({ error: 'Server error processing message' });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${socket.user.name})`);
    });
  });
};

module.exports = initSocket;
