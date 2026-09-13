import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

/**
 * MessageInput Component
 * Text input with terracotta send button and debounced typing indicator
 * 
 * @param {{ conversationId: string, onSendMessage: (content: string) => void, disabled?: boolean }} props
 */
const MessageInput = ({ conversationId, onSendMessage, disabled }) => {
  const [content, setContent] = useState('');
  const { socket } = useSocket();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Clear typing timeout and emit stop_typing on unmount or conversation change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && socket && conversationId) {
        socket.emit('stop_typing', { conversationId });
        isTypingRef.current = false;
      }
    };
  }, [conversationId, socket]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setContent(value);

    if (!socket || !conversationId) return;

    // Emit 'typing' on initial keystroke
    if (!isTypingRef.current && value.trim().length > 0) {
      isTypingRef.current = true;
      socket.emit('typing', { conversationId });
    }

    // Reset debounce inactivity timer (2 seconds)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && socket && conversationId) {
        socket.emit('stop_typing', { conversationId });
        isTypingRef.current = false;
      }
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    // Cancel typing indicator upon send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current && socket && conversationId) {
      socket.emit('stop_typing', { conversationId });
      isTypingRef.current = false;
    }

    onSendMessage(content.trim());
    setContent('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 sm:p-4 border-t border-sand-dark bg-cream-dark flex items-center gap-2.5"
    >
      <input
        type="text"
        value={content}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 bg-cream border border-sand-dark text-ink placeholder-ink-faint text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-terracotta transition-colors disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={!content.trim() || disabled}
        className="p-3 bg-terracotta hover:bg-terracotta-hover disabled:bg-sand-dark disabled:text-ink-muted text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center shrink-0"
        title="Send Message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default MessageInput;
