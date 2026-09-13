import React, { useState, useEffect } from 'react';
import chatService from '../../services/chatService';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <MessageSquarePlus className="w-5 h-5 text-indigo-400" />
            <span>Start New Chat</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="my-4 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username..."
            autoFocus
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Finding contacts...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-1 text-center">
              <User className="w-8 h-8 opacity-40 mb-1" />
              <span className="text-xs text-slate-400 font-medium">No users found</span>
              <span className="text-[11px] text-slate-600">Try searching for a different username</span>
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                onClick={() => handleSelect(u._id)}
                className="p-3 rounded-xl bg-slate-950/50 hover:bg-indigo-950/40 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-semibold text-sm">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">{u.name}</h4>
                  </div>
                </div>

                {startingChatId === u._id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  <span className="text-xs text-indigo-400 font-medium hover:underline">
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
