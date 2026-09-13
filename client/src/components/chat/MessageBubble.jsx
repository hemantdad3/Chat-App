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
 * Renders individual chat messages with distinct sent vs. received aesthetics
 */
const MessageBubble = ({ message, isOwn, isGroup }) => {
  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-3`}>
      {/* Sender name in group conversations */}
      {!isOwn && isGroup && message.sender?.name && (
        <span className="text-[11px] font-medium text-slate-400 mb-1 ml-1">
          {message.sender.name}
        </span>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[78%] sm:max-w-[65%] px-4 py-2.5 shadow-md break-words ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-2xl rounded-br-xs shadow-indigo-950/20'
            : 'bg-slate-800/90 text-slate-100 rounded-2xl rounded-bl-xs border border-slate-700/60 shadow-slate-950/40'
        } ${message.isOptimistic ? 'opacity-70' : 'opacity-100'}`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
          {message.content}
        </p>

        {/* Timestamp */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
            isOwn ? 'text-indigo-200/80' : 'text-slate-400'
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
