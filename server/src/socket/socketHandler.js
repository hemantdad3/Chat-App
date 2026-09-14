const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { sanitizeInput } = require('../utils/sanitize');

// In-memory tracking of active user connections: Map<userId, Set<socketId>>
const onlineUsers = new Map();

/**
 * Socket.io Handler
 * Manages authenticated connections, online presence, typing indicators, and message relays.
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

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.name} - ${userId})`);

    // --- Presence Management: Online Status ---
    const userSockets = onlineUsers.get(userId) || new Set();
    const isFirstSocket = userSockets.size === 0;
    userSockets.add(socket.id);
    onlineUsers.set(userId, userSockets);

    if (isFirstSocket) {
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        // Broadcast presence change to all clients
        io.emit('user_status_change', {
          userId,
          isOnline: true,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error('Error updating user online status:', err.message);
      }
    }

    // Send initial array of online user IDs to the connected client
    socket.emit('online_users', Array.from(onlineUsers.keys()));

    // --- Room Management ---
    socket.on('join_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room: ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left room: ${conversationId}`);
    });

    // --- Typing Indicators ---
    socket.on('typing', ({ conversationId }) => {
      if (!conversationId) return;
      // Broadcast typing indicator to other room members
      socket.to(conversationId).emit('typing', {
        conversationId,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          username: socket.user.username,
          avatarUrl: socket.user.avatarUrl,
        },
      });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      if (!conversationId) return;
      // Broadcast stop_typing to other room members
      socket.to(conversationId).emit('stop_typing', {
        conversationId,
        userId: socket.user._id,
      });
    });

    // --- Messaging ---
    socket.on('send_message', async (data, ack) => {
      try {
        const { conversationId, content } = data;

        if (!conversationId || !content || !content.trim()) {
          if (typeof ack === 'function') {
            return ack({ error: 'Conversation ID and non-empty content required' });
          }
          return;
        }

        const cleanContent = sanitizeInput(content);
        if (!cleanContent) {
          if (typeof ack === 'function') {
            return ack({ error: 'Message content cannot be empty' });
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
          content: cleanContent,
        });

        // Update conversation lastMessage and bump updatedAt
        conversation.lastMessage = message._id;
        conversation.updatedAt = new Date();
        await conversation.save();

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name email username avatarUrl bio'
        );

        // Broadcast to all sockets in conversation room
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

    // --- Disconnect & Offline Status ---
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${socket.user.name})`);

      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          const lastSeen = new Date();

          try {
            await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
            // Broadcast offline status change to all clients
            io.emit('user_status_change', {
              userId,
              isOnline: false,
              lastSeen,
            });
          } catch (err) {
            console.error('Error updating user offline status:', err.message);
          }
        }
      }
    });
  });
};

module.exports = initSocket;
