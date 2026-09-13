import React from 'react';

/**
 * TypingIndicator Component
 * Renders an animated typing bubble and message above input
 * 
 * @param {{ typingUsers: Array<{ _id: string, name: string }> }} props
 */
const TypingIndicator = ({ typingUsers = [] }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.name).join(', ');
  const text =
    typingUsers.length === 1
      ? `${names} is typing`
      : `${names} are typing`;

  return (
    <div className="px-4 py-2 flex items-center gap-2 text-xs bg-sand/60 border-t border-sand-dark">
      {/* 3 bouncing dots */}
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce"></span>
      </div>

      <span className="text-[11px] font-medium text-ink-muted italic">{text}...</span>
    </div>
  );
};

export default TypingIndicator;
