const express = require('express');
const {
  getConversations,
  createOrGetConversation,
} = require('../controllers/conversationController');
const {
  getMessages,
  sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All conversation routes require authentication
router.use(protect);

router.route('/')
  .get(getConversations)
  .post(createOrGetConversation);

router.route('/:id/messages')
  .get(getMessages)
  .post(sendMessage);

module.exports = router;
