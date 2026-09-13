import React from 'react';
import { Users } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import OnlineStatusDot from './OnlineStatusDot';

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
 * Displays conversation card with presence dot, unread badge counter, and latest message preview
 */
const ConversationListItem = ({ conversation, currentUserId, isActive, onSelect }) => {
  const { isUserOnline } = useSocket();
  const { unreadCounts } = useChat();

  // Unread badge count
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
          ? 'bg-indigo-950/60 border-indigo-500/40 shadow-sm'
          : unreadCount > 0
          ? 'bg-slate-900/90 border-slate-700/80 hover:bg-slate-900'
          : 'bg-slate-900/40 hover:bg-slate-900/80 border-transparent hover:border-slate-800'
      }`}
    >
      {/* Avatar with Online indicator badge */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-semibold text-indigo-300">
          {conversation.isGroup ? (
            <Users className="w-5 h-5 text-indigo-400" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>

        {/* Online status dot badge */}
        {!conversation.isGroup && (
          <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-slate-950 rounded-full">
            <OnlineStatusDot isOnline={isOnline} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h3
            className={`text-xs sm:text-sm truncate flex items-center gap-1.5 ${
              unreadCount > 0 ? 'font-bold text-white' : 'font-medium text-slate-200'
            }`}
          >
            {displayName}
          </h3>
          {lastMsgTime && (
            <span
              className={`text-[10px] shrink-0 ${
                unreadCount > 0 ? 'text-indigo-400 font-semibold' : 'text-slate-500'
              }`}
            >
              {lastMsgTime}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-xs truncate ${
              unreadCount > 0 ? 'text-slate-200 font-medium' : 'text-slate-400'
            }`}
          >
            {lastMsgContent}
          </p>

          {/* Unread Counter Badge */}
          {unreadCount > 0 && (
            <span className="shrink-0 px-2 py-0.5 bg-indigo-600 text-white font-bold text-[10px] rounded-full shadow-sm shadow-indigo-600/40 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;
