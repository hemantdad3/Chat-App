import React, { useState, useEffect } from 'react';
import chatService from '../../services/chatService';
import Avatar from '../common/Avatar';
import { Search, X, User, Loader2, MessageSquarePlus } from 'lucide-react';

/**
 * NewChatModal Component
 * Search and select users to initiate direct 1-on-1 conversations
 */
const NewChatModal = ({ isOpen, onClose, onSelectUser }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingChatId, setStartingChatId] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setUsers([]);
      return;
    }

    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await chatService.getUsers(search);
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users for new chat:', err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      loadUsers();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleSelect = async (userId) => {
    setStartingChatId(userId);
    try {
      await onSelectUser(userId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setStartingChatId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-sand-light border border-ink-border rounded-2xl p-6 shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ink-border">
          <div className="flex items-center gap-2 text-ink font-semibold text-base">
            <MessageSquarePlus className="w-5 h-5 text-terracotta" />
            <span>Start New Chat</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-muted hover:text-ink rounded-lg hover:bg-sand transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="my-4 relative">
          <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username..."
            autoFocus
            className="w-full bg-cream border border-ink-border text-ink text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
          />
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-ink-muted gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
              <span className="text-xs">Finding contacts...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-ink-muted gap-1 text-center">
              <User className="w-8 h-8 text-ink-faint mb-1" />
              <span className="text-xs text-ink-muted font-medium">No users found</span>
              <span className="text-[11px] text-ink-faint">Try searching for a different username</span>
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                onClick={() => handleSelect(u._id)}
                className="p-3 rounded-xl bg-sand hover:bg-sand-dark border border-ink-border/50 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={u.avatarUrl} name={u.name} size="md" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-ink truncate">{u.name}</h4>
                    <p className="text-[11px] text-ink-muted truncate">@{u.username || 'user'}</p>
                    {u.bio && (
                      <p className="text-[10px] text-ink-faint truncate max-w-[200px]">{u.bio}</p>
                    )}
                  </div>
                </div>

                {startingChatId === u._id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-terracotta" />
                ) : (
                  <span className="px-3 py-1 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-medium rounded-lg transition-colors">
                    Chat
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
