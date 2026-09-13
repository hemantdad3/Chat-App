import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { MessageSquare, ArrowLeft, Loader2, Users } from 'lucide-react';

/**
 * ChatWindow Component
 * Right pane displaying active conversation header, message feed, and input
 */
const ChatWindow = ({ onBack }) => {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    loadingMessages,
    sendMessage,
  } = useChat();

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Empty state when no conversation selected
  if (!activeConversation) {
    return (
      <div className="flex-1 h-full hidden md:flex flex-col items-center justify-center bg-slate-900/40 text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Your Direct Messages</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Select a conversation from the sidebar or click "New Chat" to connect with registered users in real-time.
        </p>
      </div>
    );
  }

  // Determine recipient details for 1-on-1 chat
  let displayName = activeConversation.name;
  let otherParticipant = null;

  if (!activeConversation.isGroup) {
    otherParticipant = activeConversation.members?.find(
      (m) => m._id?.toString() !== user?._id?.toString()
    );
    displayName = otherParticipant?.name || 'Direct Chat';
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-900/30 overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 sm:px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          {/* Back button on mobile */}
          <button
            onClick={onBack}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-semibold text-sm text-indigo-300">
            {activeConversation.isGroup ? (
              <Users className="w-5 h-5 text-indigo-400" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {displayName}
            </h2>
            <div className="text-[11px] text-slate-400">
              {activeConversation.isGroup
                ? `${activeConversation.members?.length || 0} members`
                : otherParticipant?.email || '1-on-1 conversation'}
            </div>
          </div>
        </div>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-xs">Loading message history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 mb-2">
              <MessageSquare className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">No messages here yet</p>
            <p className="text-xs text-slate-500">Send a message below to begin chatting!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.sender?._id?.toString() === user?._id?.toString()}
              isGroup={activeConversation.isGroup}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={sendMessage}
        disabled={loadingMessages}
      />
    </div>
  );
};

export default ChatWindow;
