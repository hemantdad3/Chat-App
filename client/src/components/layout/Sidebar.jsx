import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ConversationListItem from '../chat/ConversationListItem';
import NewChatModal from '../modals/NewChatModal';
import NewGroupModal from '../modals/NewGroupModal';
import ProfileModal from '../modals/ProfileModal';
import Avatar from '../common/Avatar';
import { MessageSquarePlus, Users, LogOut, MessageSquare, Loader2, UserCog } from 'lucide-react';

/**
 * Sidebar Component
 * Left pane with warm cream background, sand card lists, and terracotta accents
 */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const {
    conversations,
    activeConversation,
    selectConversation,
    startDirectChat,
    loadingConversations,
  } = useChat();

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-cream-dark border-r border-sand-dark shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-sand-dark flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sand border border-sand-dark rounded-xl text-terracotta">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-ink tracking-tight">Messages</h1>
            <p className="text-[11px] text-ink-muted">Direct & Groups</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="p-2 bg-sand hover:bg-sand-dark border border-sand-dark text-ink rounded-xl transition-all cursor-pointer"
            title="Start Direct Chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsNewGroupOpen(true)}
            className="flex items-center gap-1 px-3 py-2 bg-terracotta hover:bg-terracotta-hover text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="Create New Group"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Group</span>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {loadingConversations ? (
          <div className="flex flex-col items-center justify-center h-48 text-ink-muted gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
            <span className="text-xs">Loading conversations...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-sand border border-sand-dark flex items-center justify-center text-ink-muted mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-ink mb-1">No conversations yet</h3>
            <p className="text-xs text-ink-muted mb-4">
              Start a direct chat or create a group to begin messaging.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="px-3 py-1.5 bg-sand hover:bg-sand-dark border border-sand-dark rounded-xl text-xs text-ink font-medium transition-colors cursor-pointer"
              >
                New Chat
              </button>
              <button
                onClick={() => setIsNewGroupOpen(true)}
                className="px-3 py-1.5 bg-terracotta hover:bg-terracotta-hover text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                New Group
              </button>
            </div>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationListItem
              key={conv._id}
              conversation={conv}
              currentUserId={user?._id}
              isActive={activeConversation?._id === conv._id}
              onSelect={selectConversation}
            />
          ))
        )}
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-sand-dark bg-sand/40 flex items-center justify-between">
        <div
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1 mr-2"
          title="Edit your profile"
        >
          <Avatar
            src={user?.avatarUrl}
            name={user?.name}
            size="sm"
            className="group-hover:ring-2 group-hover:ring-terracotta/40 rounded-xl transition-all"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-ink truncate group-hover:text-terracotta transition-colors">
              {user?.name}
            </h4>
            <p className="text-[10px] text-ink-muted truncate">
              @{user?.username || 'user'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-2 text-ink-muted hover:text-terracotta hover:bg-sand rounded-xl transition-colors cursor-pointer"
            title="Edit Profile"
          >
            <UserCog className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            className="p-2 text-ink-muted hover:text-terracotta hover:bg-sand rounded-xl transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={startDirectChat}
      />

      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </aside>
  );
};

export default Sidebar;
