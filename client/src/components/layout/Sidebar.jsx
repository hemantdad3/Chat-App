import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ConversationListItem from '../chat/ConversationListItem';
import NewChatModal from '../modals/NewChatModal';
import NewGroupModal from '../modals/NewGroupModal';
import { MessageSquarePlus, Users, LogOut, MessageSquare, Loader2 } from 'lucide-react';

/**
 * Sidebar Component
 * Left pane displaying conversation list, "New Chat" and "New Group" actions
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

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-slate-950 border-r border-slate-800/80 shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Messages</h1>
            <p className="text-[11px] text-slate-400">Direct & Groups</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 rounded-xl transition-all cursor-pointer"
            title="Start Direct Chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsNewGroupOpen(true)}
            className="flex items-center gap-1 px-2.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
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
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-xs">Loading conversations...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-slate-300 mb-1">No conversations yet</h3>
            <p className="text-xs text-slate-500 mb-4">
              Start a direct chat or create a group to begin messaging.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-indigo-400 font-medium transition-colors"
              >
                New Chat
              </button>
              <button
                onClick={() => setIsNewGroupOpen(true)}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 font-medium transition-colors"
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
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-200 truncate">{user?.name}</h4>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
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
    </aside>
  );
};

export default Sidebar;
