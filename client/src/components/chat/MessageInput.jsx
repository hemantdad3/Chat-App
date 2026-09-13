import React, { useState } from 'react';
import { Send } from 'lucide-react';

/**
 * MessageInput Component
 * Text input with send button and Enter-key listener
 */
const MessageInput = ({ onSendMessage, disabled }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;

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
      className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center gap-2.5"
    >
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={!content.trim() || disabled}
        className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center shrink-0"
        title="Send Message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default MessageInput;
