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
    <div className="px-4 py-1.5 flex items-center gap-2 text-xs text-indigo-400 bg-indigo-950/40 border-t border-indigo-900/30 animate-fadeIn">
      {/* 3 bouncing dots */}
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
      </div>

      <span className="text-[11px] font-medium text-slate-300 italic">{text}...</span>
    </div>
  );
};

export default TypingIndicator;
