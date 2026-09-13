const mongoose = require('mongoose');

/**
 * Conversation Schema
 * Represents both direct (1-on-1) and multi-user group conversations.
 */
const conversationSchema = new mongoose.Schema(
  {
    isGroup: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: null, // Group name, null for direct 1-on-1 conversations
      trim: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by participant
conversationSchema.index({ members: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
