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
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch all conversations for user
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const data = await chatService.getConversations();
      setConversations(data);
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

  // Select a conversation and load its messages
  const selectConversation = useCallback(
    async (conv) => {
      if (!conv) {
        setActiveConversation(null);
        setMessages([]);
        return;
      }

      setActiveConversation(conv);
      setLoadingMessages(true);

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

      // Update conversations list if not already in list
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conv._id);
        if (exists) {
          return prev.map((c) => (c._id === conv._id ? conv : c));
        }
        return [conv, ...prev];
      });

      // Select newly created/opened conversation
      await selectConversation(conv);
      return conv;
    } catch (err) {
      console.error('Failed to start chat:', err.message);
      throw err;
    }
  };

  // Send a message with optimistic update & socket emit
  const sendMessage = async (content) => {
    if (!activeConversation || !content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      conversationId: activeConversation._id,
      sender: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);

    // Update conversation lastMessage in sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c._id === activeConversation._id
          ? { ...c, lastMessage: optimisticMessage, updatedAt: new Date().toISOString() }
          : c
      )
    );

    // If socket is connected, emit send_message
    if (socket && socket.connected) {
      socket.emit(
        'send_message',
        { conversationId: activeConversation._id, content: content.trim() },
        (response) => {
          if (response?.status === 'ok' && response.message) {
            // Reconcile optimistic message with server persisted message
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
      // Fallback to REST endpoint if socket temporarily disconnected
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
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
      }
    }
  };

  // Listen for real-time incoming messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      // If message belongs to currently active conversation, append it
      setActiveConversation((currentActive) => {
        if (currentActive && currentActive._id === newMessage.conversationId) {
          setMessages((prev) => {
            // Prevent duplicate message if already added optimistically
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
        }
        return currentActive;
      });

      // Update lastMessage preview in conversations list
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === newMessage.conversationId);
        if (exists) {
          return prev.map((c) =>
            c._id === newMessage.conversationId
              ? { ...c, lastMessage: newMessage, updatedAt: newMessage.createdAt }
              : c
          );
        } else {
          // If a new conversation was started by another user, refresh conversations list
          fetchConversations();
          return prev;
        }
      });
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, fetchConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        loadingConversations,
        loadingMessages,
        selectConversation,
        startDirectChat,
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
