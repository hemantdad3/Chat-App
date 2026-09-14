import React from 'react';
import { Users } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import OnlineStatusDot from './OnlineStatusDot';
import Avatar from '../common/Avatar';

/**
 * Format timestamp for list item
 */
const formatListTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

/**
 * ConversationListItem Component
 * Displays conversation card with sage presence dot, sage unread badge, and warm palette
 */
const ConversationListItem = ({ conversation, currentUserId, isActive, onSelect }) => {
  const { isUserOnline } = useSocket();
  const { unreadCounts } = useChat();

  const unreadCount = unreadCounts[conversation._id] || 0;

  // Determine display name and other participant for 1-on-1
  let displayName = conversation.name;
  let otherParticipant = null;

  if (!conversation.isGroup) {
    otherParticipant = conversation.members?.find(
      (m) => m._id?.toString() !== currentUserId?.toString()
    );
    displayName = otherParticipant?.name || 'Direct Chat';
  }

  const isOnline = !conversation.isGroup && otherParticipant
    ? isUserOnline(otherParticipant._id)
    : false;

  const lastMsg = conversation.lastMessage;
  const lastMsgContent = lastMsg?.content || 'No messages yet';
  const lastMsgTime = formatListTime(lastMsg?.createdAt || conversation.updatedAt);

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${
        isActive
          ? 'bg-sand border-sand-dark shadow-xs'
          : unreadCount > 0
          ? 'bg-cream-dark border-sand-dark hover:bg-sand/60'
          : 'bg-cream hover:bg-sand/50 border-transparent hover:border-sand-dark'
      }`}
    >
      {/* Avatar with Online indicator badge */}
      <div className="relative shrink-0">
        {conversation.isGroup ? (
          <div className="w-10 h-10 rounded-xl bg-sand-dark/60 border border-sand-dark text-ink font-semibold flex items-center justify-center text-sm">
            <Users className="w-5 h-5 text-ink-muted" />
          </div>
        ) : (
          <Avatar
            src={otherParticipant?.avatarUrl}
            name={displayName}
            isOnline={isOnline}
            size="md"
          />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h3
            className={`text-xs sm:text-sm truncate ${
              unreadCount > 0 ? 'font-bold text-ink' : 'font-medium text-ink'
            }`}
          >
            {displayName}
          </h3>
          {lastMsgTime && (
            <span
              className={`text-[10px] shrink-0 ${
                unreadCount > 0 ? 'text-sage font-semibold' : 'text-ink-muted'
              }`}
            >
              {lastMsgTime}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-xs truncate ${
              unreadCount > 0 ? 'text-ink font-medium' : 'text-ink-muted'
            }`}
          >
            {lastMsgContent}
          </p>

          {/* Unread Counter Badge (accent color sage #4A6C4A) */}
          {unreadCount > 0 && (
            <span className="shrink-0 px-2 py-0.5 bg-sage text-white font-bold text-[10px] rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;
