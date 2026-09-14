import React from 'react';
import Avatar from '../common/Avatar';
import OnlineStatusDot from '../chat/OnlineStatusDot';
import { X, MessageSquare, Calendar } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

/**
 * Format last seen time for profile modal
 */
const formatLastSeen = (dateStr) => {
  if (!dateStr) return 'Recently';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recently';
  }
};

/**
 * UserProfileModal Component
 * Read-only modal displaying another user's avatar, username, bio, and presence
 */
const UserProfileModal = ({ isOpen, onClose, targetUser, onStartChat }) => {
  const { isUserOnline } = useSocket();

  if (!isOpen || !targetUser) return null;

  const isOnline = isUserOnline(targetUser._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-sand-light border border-ink-border rounded-2xl p-6 shadow-xl flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-sand transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <Avatar
            src={targetUser.avatarUrl}
            name={targetUser.name}
            size="2xl"
            isOnline={isOnline}
            className="mb-3 shadow-sm"
          />

          <h3 className="text-base font-bold text-ink tracking-tight font-serif">
            {targetUser.name}
          </h3>

          <p className="text-xs text-terracotta font-medium mt-0.5">
            @{targetUser.username || 'user'}
          </p>

          {/* Status line */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-ink-muted">
            <OnlineStatusDot isOnline={isOnline} />
            <span>
              {isOnline
                ? 'Active now'
                : `Last seen ${formatLastSeen(targetUser.lastSeen)}`}
            </span>
          </div>
        </div>

        {/* Bio Card */}
        <div className="my-2 p-3.5 bg-sand border border-ink-border/60 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted block mb-1">
            About
          </span>
          <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">
            {targetUser.bio && targetUser.bio.trim()
              ? targetUser.bio
              : 'No bio provided yet.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-ink-border flex justify-end gap-2">
          {onStartChat && (
            <button
              onClick={() => {
                onStartChat(targetUser._id);
                onClose();
              }}
              className="w-full py-2 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
