import React, { useState } from 'react';
import OnlineStatusDot from '../chat/OnlineStatusDot';

/**
 * Avatar Component
 * Handles user avatars with ImageKit URLs, initials fallback, sizes, and online presence dot
 * Uses the Warm & Editorial color palette (#FAF6F0 cream, #C1502E terracotta, #EFE7DC sand, #4A6C4A sage)
 */
const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  isOnline,
  className = '',
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  // Size definitions
  const sizeMap = {
    xs: {
      container: 'w-6 h-6 text-[10px]',
      dotOffset: '-bottom-0.5 -right-0.5',
    },
    sm: {
      container: 'w-8 h-8 text-xs',
      dotOffset: '-bottom-0.5 -right-0.5',
    },
    md: {
      container: 'w-10 h-10 text-sm',
      dotOffset: '-bottom-0.5 -right-0.5',
    },
    lg: {
      container: 'w-12 h-12 text-base',
      dotOffset: 'bottom-0 right-0',
    },
    xl: {
      container: 'w-16 h-16 text-xl',
      dotOffset: 'bottom-0.5 right-0.5',
    },
    '2xl': {
      container: 'w-20 h-20 text-2xl',
      dotOffset: 'bottom-1 right-1',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Extract up to 2 initials from user's name
  const getInitials = (userName) => {
    if (!userName || typeof userName !== 'string') return 'U';
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const showImage = src && !imgError;

  return (
    <div
      onClick={onClick}
      className={`relative shrink-0 inline-block select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div
        className={`${currentSize.container} rounded-xl overflow-hidden border border-sand-dark flex items-center justify-center font-bold tracking-wider transition-transform ${
          showImage ? 'bg-sand' : 'bg-sand-dark text-terracotta'
        }`}
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Online presence badge if isOnline is explicitly provided */}
      {isOnline !== undefined && (
        <div className={`absolute ${currentSize.dotOffset} p-0.5 bg-cream rounded-full`}>
          <OnlineStatusDot isOnline={isOnline} />
        </div>
      )}
    </div>
  );
};

export default Avatar;
