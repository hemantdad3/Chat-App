import React, { useState, useEffect } from 'react';
import chatService from '../../services/chatService';
import { useChat } from '../../context/ChatContext';
import { Search, X, Users, Check, Loader2 } from 'lucide-react';

/**
 * NewGroupModal Component
 * Allows users to name a new group and select multiple contacts
 */
const NewGroupModal = ({ isOpen, onClose }) => {
  const { createGroup } = useChat();

  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setGroupName('');
      setSearch('');
      setSelectedUserIds([]);
      setError('');
      return;
    }

    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const users = await chatService.getUsers(search);
        setAvailableUsers(users);
      } catch (err) {
        console.error('Failed to load users for group modal:', err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    const timer = setTimeout(() => {
      loadUsers();
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, search]);

  if (!isOpen) return null;

  const toggleUserSelection = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      return setError('Please enter a group name');
    }

    if (selectedUserIds.length < 1) {
      return setError('Please select at least 1 member for the group');
    }

    setCreating(true);
    try {
      await createGroup(groupName.trim(), selectedUserIds);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Create New Group</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Group Name Input */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="groupName">
            Group Name
          </label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Project Launch Team"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Selected Members Badges */}
        {selectedUserIds.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1">
            {selectedUserIds.map((userId) => {
              const u = availableUsers.find((user) => user._id === userId);
              return (
                <span
                  key={userId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 rounded-lg text-xs"
                >
                  <span>{u?.name || 'User'}</span>
                  <button
                    type="button"
                    onClick={() => toggleUserSelection(userId)}
                    className="hover:text-rose-400 text-slate-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Contact Search */}
        <div className="mt-4 mb-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts by username..."
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Member checklist */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[180px]">
          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span className="text-xs">Loading contacts...</span>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-xs">
              No contacts found
            </div>
          ) : (
            availableUsers.map((u) => {
              const isSelected = selectedUserIds.includes(u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => toggleUserSelection(u._id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-100'
                      : 'bg-slate-950/40 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-semibold">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-200">{u.name}</h4>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-700 bg-slate-900 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateGroup}
            disabled={creating || !groupName.trim() || selectedUserIds.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Create Group ({selectedUserIds.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;
