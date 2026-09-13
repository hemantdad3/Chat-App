import React from 'react';

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
const MessageBubble = ({ message, isOwn, isGroup }) => {
  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-3`}>
      {/* Sender name in group conversations */}
      {!isOwn && isGroup && message.sender?.name && (
        <span className="text-[11px] font-medium text-ink-muted mb-1 ml-1">
          {message.sender.name}
        </span>
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
