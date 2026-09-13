import React from 'react';

/**
 * OnlineStatusDot Component
 * Renders an online indicator using the sage accent color
 * 
 * @param {{ isOnline: boolean, showText?: boolean, size?: 'sm' | 'md' }} props
 */
const OnlineStatusDot = ({ isOnline, showText = false, size = 'sm' }) => {
  const dotSize = size === 'md' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-40"></span>
        )}
        <span
          className={`relative inline-flex rounded-full ${dotSize} ${
            isOnline
              ? 'bg-sage ring-2 ring-cream'
              : 'bg-ink-muted/40'
          }`}
        ></span>
      </span>

      {showText && (
        <span
          className={`text-[11px] font-medium ${
            isOnline ? 'text-sage' : 'text-ink-muted'
          }`}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default OnlineStatusDot;
