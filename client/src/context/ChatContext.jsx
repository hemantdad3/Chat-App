import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import chatService from '../services/chatService';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Helper to reorder conversation to the top
  const bumpConversationToTop = (convList, conversationId, lastMsg = null) => {
    const index = convList.findIndex((c) => c._id === conversationId);
    if (index === -1) return convList;

    const targetConv = {
      ...convList[index],
      lastMessage: lastMsg || convList[index].lastMessage,
      updatedAt: lastMsg?.createdAt || new Date().toISOString(),
    };

    const remaining = convList.filter((_, i) => i !== index);
    return [targetConv, ...remaining];
  };

  // Fetch all conversations for user
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const data = await chatService.getConversations();
      // Ensure sorted by updatedAt descending
      const sorted = [...data].sort(
        (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
      );
      setConversations(sorted);
    } catch (err) {
      console.error('Failed to fetch conversations:', err.message);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  // Load conversations on mount or user change
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Select a conversation, clear its unread count, and load messages
  const selectConversation = useCallback(
    async (conv) => {
      if (!conv) {
        setActiveConversation(null);
        setMessages([]);
        return;
      }

      setActiveConversation(conv);
      setLoadingMessages(true);

      // Clear unread count for this conversation
      setUnreadCounts((prev) => ({
        ...prev,
        [conv._id]: 0,
      }));

      // Join socket room
      if (socket && conv._id) {
        socket.emit('join_conversation', conv._id);
      }

      try {
        const history = await chatService.getMessages(conv._id);
        setMessages(history);
      } catch (err) {
        console.error('Failed to load messages:', err.message);
      } finally {
        setLoadingMessages(false);
      }
    },
    [socket]
  );

  // Start direct conversation with a selected user
  const startDirectChat = async (recipientId) => {
    try {
      const conv = await chatService.createDirectConversation(recipientId);

      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conv._id);
        if (exists) {
          return bumpConversationToTop(prev, conv._id);
        }
        return [conv, ...prev];
      });

      await selectConversation(conv);
      return conv;
    } catch (err) {
      console.error('Failed to start chat:', err.message);
      throw err;
    }
  };

  // Create a multi-user group conversation
  const createGroup = async (name, memberIds) => {
    try {
      const newGroup = await chatService.createGroup(name, memberIds);

      setConversations((prev) => [newGroup, ...prev]);
      await selectConversation(newGroup);
      return newGroup;
    } catch (err) {
      console.error('Failed to create group:', err.message);
      throw err;
    }
  };

  // Update group details (rename, add/remove member)
  const updateGroup = async (conversationId, updateData) => {
    try {
      const updated = await chatService.updateGroup(conversationId, updateData);

      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? updated : c))
      );

      if (activeConversation?._id === conversationId) {
        setActiveConversation(updated);
      }

      return updated;
    } catch (err) {
      console.error('Failed to update group:', err.message);
      throw err;
    }
  };

  // Send a message with optimistic update, socket emit & dynamic sorting
  const sendMessage = async (content) => {
    if (!activeConversation || !content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      conversationId: activeConversation._id,
      sender: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        email: user.email,
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);

    // Bump active conversation to top of list
    setConversations((prev) =>
      bumpConversationToTop(prev, activeConversation._id, optimisticMessage)
    );

    // If socket is connected, emit send_message
    if (socket && socket.connected) {
      socket.emit(
        'send_message',
        { conversationId: activeConversation._id, content: content.trim() },
        (response) => {
          if (response?.status === 'ok' && response.message) {
            setMessages((prev) =>
              prev.map((m) => (m._id === tempId ? response.message : m))
            );
            setConversations((prev) =>
              prev.map((c) =>
                c._id === activeConversation._id
                  ? { ...c, lastMessage: response.message }
                  : c
              )
            );
          }
        }
      );
    } else {
      // Fallback to REST endpoint
      try {
        const savedMessage = await chatService.sendMessage(
          activeConversation._id,
          content.trim()
        );
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? savedMessage : m))
        );
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? { ...c, lastMessage: savedMessage }
              : c
          )
        );
      } catch (err) {
        console.error('Failed to send message via REST fallback:', err.message);
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
      }
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming messages
    const handleReceiveMessage = (newMessage) => {
      setActiveConversation((currentActive) => {
        // If message is for the currently open conversation
        if (currentActive && currentActive._id === newMessage.conversationId) {
          setMessages((prev) => {
            const exists = prev.some(
              (m) =>
                m._id === newMessage._id ||
                (m.isOptimistic && m.content === newMessage.content && m.sender._id === newMessage.sender._id)
            );
            if (exists) {
              return prev.map((m) =>
                m.isOptimistic && m.content === newMessage.content ? newMessage : m
              );
            }
            return [...prev, newMessage];
          });
        } else {
          // If message is for a different conversation, increment unread count!
          setUnreadCounts((prev) => ({
            ...prev,
            [newMessage.conversationId]: (prev[newMessage.conversationId] || 0) + 1,
          }));
        }
        return currentActive;
      });

      // Dynamically bump the conversation to top of list
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === newMessage.conversationId);
        if (exists) {
          return bumpConversationToTop(prev, newMessage.conversationId, newMessage);
        } else {
          fetchConversations();
          return prev;
        }
      });
    };

    // Real-time group updates
    const handleGroupUpdated = (updatedGroup) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === updatedGroup._id ? updatedGroup : c))
      );
      setActiveConversation((currentActive) => {
        if (currentActive && currentActive._id === updatedGroup._id) {
          return updatedGroup;
        }
        return currentActive;
      });
    };

    // Real-time profile updates (avatar, username, bio)
    const handleUserProfileUpdated = (updatedUser) => {
      setConversations((prev) =>
        prev.map((conv) => {
          let hasChange = false;
          const newMembers = conv.members?.map((m) => {
            if (m._id?.toString() === updatedUser.userId?.toString()) {
              hasChange = true;
              return { ...m, ...updatedUser, _id: updatedUser.userId };
            }
            return m;
          });

          const newAdmins = conv.admins?.map((a) => {
            if (a._id?.toString() === updatedUser.userId?.toString()) {
              hasChange = true;
              return { ...a, ...updatedUser, _id: updatedUser.userId };
            }
            return a;
          });

          let newLastMessage = conv.lastMessage;
          if (newLastMessage?.sender?._id?.toString() === updatedUser.userId?.toString()) {
            newLastMessage = {
              ...newLastMessage,
              sender: { ...newLastMessage.sender, ...updatedUser, _id: updatedUser.userId },
            };
            hasChange = true;
          }

          if (hasChange) {
            return {
              ...conv,
              members: newMembers,
              admins: newAdmins,
              lastMessage: newLastMessage,
            };
          }
          return conv;
        })
      );

      setActiveConversation((currentActive) => {
        if (!currentActive) return currentActive;
        const isMember = currentActive.members?.some(
          (m) => m._id?.toString() === updatedUser.userId?.toString()
        );
        if (!isMember) return currentActive;

        const newMembers = currentActive.members?.map((m) => {
          if (m._id?.toString() === updatedUser.userId?.toString()) {
            return { ...m, ...updatedUser, _id: updatedUser.userId };
          }
          return m;
        });

        const newAdmins = currentActive.admins?.map((a) => {
          if (a._id?.toString() === updatedUser.userId?.toString()) {
            return { ...a, ...updatedUser, _id: updatedUser.userId };
          }
          return a;
        });

        return { ...currentActive, members: newMembers, admins: newAdmins };
      });

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.sender?._id?.toString() === updatedUser.userId?.toString()) {
            return {
              ...msg,
              sender: { ...msg.sender, ...updatedUser, _id: updatedUser.userId },
            };
          }
          return msg;
        })
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('group_updated', handleGroupUpdated);
    socket.on('user_profile_updated', handleUserProfileUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('group_updated', handleGroupUpdated);
      socket.off('user_profile_updated', handleUserProfileUpdated);
    };
  }, [socket, fetchConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        unreadCounts,
        loadingConversations,
        loadingMessages,
        selectConversation,
        startDirectChat,
        createGroup,
        updateGroup,
        sendMessage,
        fetchConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
