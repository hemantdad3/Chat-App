import api from './api';

const chatService = {
  /**
   * Search users for direct messaging or group selection
   * @param {string} search
   */
  getUsers: async (search = '') => {
    const response = await api.get('/users', {
      params: search ? { search } : {},
    });
    return response.data;
  },

  /**
   * Retrieve all conversations for logged-in user
   */
  getConversations: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  /**
   * Create or retrieve a direct 1-on-1 conversation
   * @param {string} recipientId
   */
  createDirectConversation: async (recipientId) => {
    const response = await api.post('/conversations', {
      recipientId,
      isGroup: false,
    });
    return response.data;
  },

  /**
   * Create a new multi-user group chat
   * @param {string} name
   * @param {string[]} memberIds
   */
  createGroup: async (name, memberIds) => {
    const response = await api.post('/conversations', {
      name,
      memberIds,
      isGroup: true,
    });
    return response.data;
  },

  /**
   * Update group properties (rename, add/remove member) - Admin only
   * @param {string} conversationId
   * @param {{ name?: string, addMemberId?: string, removeMemberId?: string }} updateData
   */
  updateGroup: async (conversationId, updateData) => {
    const response = await api.patch(`/conversations/${conversationId}`, updateData);
    return response.data;
  },

  /**
   * Fetch chronological message history for a conversation
   * @param {string} conversationId
   */
  getMessages: async (conversationId) => {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  /**
   * Send a message via REST fallback
   * @param {string} conversationId
   * @param {string} content
   */
  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data;
  },
};

export default chatService;
