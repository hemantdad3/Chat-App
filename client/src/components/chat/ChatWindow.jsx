import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import OnlineStatusDot from './OnlineStatusDot';
import GroupInfoModal from '../modals/GroupInfoModal';
import UserProfileModal from '../modals/UserProfileModal';
import Avatar from '../common/Avatar';
import { MessageSquare, ArrowLeft, Loader2, Users, Info } from 'lucide-react';

/**
 * ChatWindow Component
 * Displays active conversation with warm editorial palette
 */
const ChatWindow = ({ onBack }) => {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const {
    activeConversation,
    messages,
    loadingMessages,
    sendMessage,
  } = useChat();

  const [typingUsers, setTypingUsers] = useState([]);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new message or typing indicator update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Listen for real-time typing events from socket
  useEffect(() => {
    if (!socket || !activeConversation) return;

    setTypingUsers([]);

    const handleTyping = ({ conversationId, user: typingUser }) => {
      if (conversationId === activeConversation._id && typingUser._id !== user._id) {
        setTypingUsers((prev) => {
          const exists = prev.some((u) => u._id === typingUser._id);
          if (exists) return prev;
          return [...prev, typingUser];
        });
      }
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      if (conversationId === activeConversation._id) {
        setTypingUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    };

    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      setTypingUsers([]);
    };
  }, [socket, activeConversation, user]);

  // Empty state when no conversation selected
  if (!activeConversation) {
    return (
      <div className="flex-1 h-full hidden md:flex flex-col items-center justify-center bg-cream text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-sand border border-sand-dark flex items-center justify-center text-terracotta mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-ink mb-1">Your Messages</h2>
        <p className="text-xs text-ink-muted max-w-sm">
          Select a conversation from the sidebar or click "New Chat" / "Group" to begin messaging in real-time.
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

  const isOnline = !activeConversation.isGroup && otherParticipant
    ? isUserOnline(otherParticipant._id)
    : false;

  return (
    <div className="flex-1 h-full flex flex-col bg-cream overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 sm:px-6 border-b border-sand-dark bg-cream-dark flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          {/* Back button on mobile */}
          <button
            onClick={onBack}
            className="md:hidden p-2 text-ink-muted hover:text-ink rounded-lg hover:bg-sand"
            title="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="relative">
            {activeConversation.isGroup ? (
              <div className="w-10 h-10 rounded-xl bg-sand border border-sand-dark flex items-center justify-center font-semibold text-sm text-ink">
                <Users className="w-5 h-5 text-ink-muted" />
              </div>
            ) : (
              <Avatar
                src={otherParticipant?.avatarUrl}
                name={displayName}
                size="md"
                onClick={() => setViewingUser(otherParticipant)}
                className="cursor-pointer hover:opacity-90 transition-opacity"
              />
            )}
          </div>

          <div
            onClick={() => !activeConversation.isGroup && otherParticipant && setViewingUser(otherParticipant)}
            className={!activeConversation.isGroup ? 'cursor-pointer group' : ''}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-ink tracking-tight group-hover:text-terracotta transition-colors">
                {displayName}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-ink-muted">
              {activeConversation.isGroup ? (
                <span>{activeConversation.members?.length || 0} members</span>
              ) : (
                <>
                  {otherParticipant?.username && (
                    <span>@{otherParticipant.username} •</span>
                  )}
                  <OnlineStatusDot isOnline={isOnline} showText={true} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Group Info / Settings button */}
        {activeConversation.isGroup && (
          <button
            onClick={() => setIsGroupInfoOpen(true)}
            className="p-2 text-ink-muted hover:text-terracotta hover:bg-sand rounded-xl transition-colors cursor-pointer"
            title="Group Info & Members"
          >
            <Info className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 bg-cream">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-ink-muted gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
            <span className="text-xs">Loading message history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-ink-muted">
            <div className="p-3 bg-sand rounded-2xl border border-sand-dark mb-2 inline-block">
              <MessageSquare className="w-6 h-6 text-terracotta" />
            </div>
            <p className="text-sm font-medium text-ink">No messages here yet</p>
            <p className="text-xs text-ink-muted">Send a message below to begin chatting!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.sender?._id?.toString() === user?._id?.toString()}
              isGroup={activeConversation.isGroup}
              onViewProfile={(sender) => setViewingUser(sender)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input */}
      <MessageInput
        conversationId={activeConversation._id}
        onSendMessage={sendMessage}
        disabled={loadingMessages}
      />

      {/* Group Info & Member Management Modal */}
      {activeConversation.isGroup && (
        <GroupInfoModal
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          conversation={activeConversation}
        />
      )}

      {/* User Profile Popover / Modal */}
      <UserProfileModal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        targetUser={viewingUser}
      />
    </div>
  );
};

export default ChatWindow;
