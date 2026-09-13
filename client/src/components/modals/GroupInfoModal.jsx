import React, { useState, useEffect } from 'react';
import chatService from '../../services/chatService';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { X, Users, Shield, UserMinus, UserPlus, Edit2, Check, Loader2 } from 'lucide-react';

/**
 * GroupInfoModal Component
 * Shows member directory, admin indicators, and member add/remove controls
 */
const GroupInfoModal = ({ isOpen, onClose, conversation }) => {
  const { user } = useAuth();
  const { updateGroup } = useChat();

  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (conversation) {
      setGroupName(conversation.name || '');
      setIsEditingName(false);
      setIsAddingMember(false);
      setError('');
    }
  }, [conversation, isOpen]);

  useEffect(() => {
    if (isAddingMember) {
      chatService.getUsers().then((users) => {
        // Exclude existing members
        const currentMemberIds = (conversation.members || []).map((m) => m._id);
        const filtered = users.filter((u) => !currentMemberIds.includes(u._id));
        setAvailableUsers(filtered);
      });
    }
  }, [isAddingMember, conversation]);

  if (!isOpen || !conversation || !conversation.isGroup) return null;

  // Determine if logged-in user is an admin of this group
  const isAdmin = conversation.admins?.some(
    (a) => a._id?.toString() === user?._id?.toString() || a.toString() === user?._id?.toString()
  );

  const handleRenameGroup = async () => {
    if (!groupName.trim() || groupName.trim() === conversation.name) {
      setIsEditingName(false);
      return;
    }

    setLoadingAction(true);
    setError('');
    try {
      await updateGroup(conversation._id, { name: groupName.trim() });
      setIsEditingName(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to rename group');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserToAdd) return;

    setLoadingAction(true);
    setError('');
    try {
      await updateGroup(conversation._id, { addMemberId: selectedUserToAdd });
      setSelectedUserToAdd('');
      setIsAddingMember(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }

    setLoadingAction(true);
    setError('');
    try {
      await updateGroup(conversation._id, { removeMemberId: memberId });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Group Details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Group Name & Rename section */}
        <div className="my-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Group Name
              </span>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={handleRenameGroup}
                    disabled={loadingAction}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <h3 className="text-sm font-bold text-white truncate">{conversation.name}</h3>
              )}
            </div>

            {isAdmin && !isEditingName && (
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-900"
                title="Rename group"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Members Header */}
        <div className="flex items-center justify-between mt-2 mb-3">
          <span className="text-xs font-semibold text-slate-300">
            Members ({conversation.members?.length || 0})
          </span>

          {isAdmin && !isAddingMember && (
            <button
              onClick={() => setIsAddingMember(true)}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* Add Member Select box */}
        {isAddingMember && (
          <div className="mb-3 p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2">
            <span className="text-xs font-medium text-slate-300 block">Select contact to add:</span>
            <div className="flex items-center gap-2">
              <select
                value={selectedUserToAdd}
                onChange={(e) => setSelectedUserToAdd(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Select Contact --</option>
                {availableUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddMember}
                disabled={!selectedUserToAdd || loadingAction}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Add
              </button>

              <button
                onClick={() => setIsAddingMember(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
          {conversation.members?.map((m) => {
            const memberIsAdmin = conversation.admins?.some(
              (a) => a._id?.toString() === m._id?.toString() || a.toString() === m._id?.toString()
            );
            const isMe = m._id?.toString() === user?._id?.toString();

            return (
              <div
                key={m._id}
                className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-semibold">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-200">
                        {m.name} {isMe && <span className="text-slate-500">(You)</span>}
                      </span>
                      {memberIsAdmin && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          <Shield className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{m.email}</span>
                  </div>
                </div>

                {/* Remove member button: only for admin removing non-self member */}
                {isAdmin && !isMe && (
                  <button
                    onClick={() => handleRemoveMember(m._id)}
                    disabled={loadingAction}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove member"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
