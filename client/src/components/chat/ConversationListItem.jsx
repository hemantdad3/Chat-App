import React from 'react';
import { Users, User as UserIcon } from 'lucide-react';

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
 * Sidebar card representing a single conversation
 */
const ConversationListItem = ({ conversation, currentUserId, isActive, onSelect }) => {
  // Determine display name and other participant for 1-on-1
  let displayName = conversation.name;
  let otherParticipant = null;

  if (!conversation.isGroup) {
    otherParticipant = conversation.members?.find(
      (m) => m._id?.toString() !== currentUserId?.toString()
    );
    displayName = otherParticipant?.name || 'Direct Chat';
  }

  const lastMsg = conversation.lastMessage;
  const lastMsgContent = lastMsg?.content || 'No messages yet';
  const lastMsgTime = formatListTime(lastMsg?.createdAt || conversation.updatedAt);

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${
        isActive
          ? 'bg-indigo-950/60 border-indigo-500/40 shadow-sm'
          : 'bg-slate-900/40 hover:bg-slate-900/80 border-transparent hover:border-slate-800'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-semibold text-indigo-300">
          {conversation.isGroup ? (
            <Users className="w-5 h-5 text-indigo-400" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h3 className="text-xs sm:text-sm font-medium text-slate-200 truncate">
            {displayName}
          </h3>
          {lastMsgTime && (
            <span className="text-[10px] text-slate-500 shrink-0">{lastMsgTime}</span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">
          {lastMsgContent}
        </p>
      </div>
    </div>
  );
};

export default ConversationListItem;
