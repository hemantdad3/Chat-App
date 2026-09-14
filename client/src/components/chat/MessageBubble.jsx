import React from 'react';
import Avatar from '../common/Avatar';

/**
 * Formats ISO timestamp to short time string (e.g. "3:45 PM")
 */
const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

/**
 * MessageBubble Component
 * Renders individual chat messages:
 * Sent: #C1502E (terracotta)
 * Received: #EFE7DC (sand)
 * Primary text: #2B2B2B (ink)
 */
const MessageBubble = ({ message, isOwn, isGroup, onViewProfile }) => {
  const sender = message.sender;

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-3`}>
      {/* Sender info in group conversations */}
      {!isOwn && isGroup && sender?.name && (
        <div
          onClick={() => onViewProfile?.(sender)}
          className="flex items-center gap-1.5 mb-1 ml-1 cursor-pointer group select-none"
          title="View profile"
        >
          <Avatar
            src={sender.avatarUrl}
            name={sender.name}
            size="xs"
            className="group-hover:opacity-80 transition-opacity"
          />
          <span className="text-[11px] font-semibold text-ink group-hover:text-terracotta transition-colors">
            {sender.name}
          </span>
          {sender.username && (
            <span className="text-[10px] text-ink-muted">
              @{sender.username}
            </span>
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[78%] sm:max-w-[65%] px-4 py-2.5 break-words rounded-2xl ${
          isOwn
            ? 'bg-terracotta text-white rounded-br-xs'
            : 'bg-sand text-ink rounded-bl-xs border border-sand-dark'
        } ${message.isOptimistic ? 'opacity-70' : 'opacity-100'}`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
          {message.content}
        </p>

        {/* Timestamp */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
            isOwn ? 'text-white/80' : 'text-ink-muted'
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {message.isOptimistic && (
            <span className="italic text-[9px]">• sending...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
