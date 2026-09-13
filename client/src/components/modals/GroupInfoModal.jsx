import React, { useState, useEffect } from 'react';
import chatService from '../../services/chatService';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { X, Users, Shield, UserMinus, UserPlus, Edit2, Check, Loader2, Search } from 'lucide-react';

/**
 * GroupInfoModal Component
 * Shows member directory, admin indicators, and username-only member search & add controls
 */
const GroupInfoModal = ({ isOpen, onClose, conversation }) => {
  const { user } = useAuth();
  const { updateGroup } = useChat();

  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [addingUserId, setAddingUserId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (conversation) {
      setGroupName(conversation.name || '');
      setIsEditingName(false);
      setIsAddingMember(false);
      setSearchQuery('');
      setError('');
    }
  }, [conversation, isOpen]);

  // Load candidate users who are not yet members
  useEffect(() => {
    if (isAddingMember) {
      chatService.getUsers().then((users) => {
        // Exclude current group members
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

  // Add member by userId
  const handleAddMember = async (userIdToAdd) => {
    if (!userIdToAdd) return;

    setAddingUserId(userIdToAdd);
    setError('');
    try {
      await updateGroup(conversation._id, { addMemberId: userIdToAdd });
      // Remove from available users list
      setAvailableUsers((prev) => prev.filter((u) => u._id !== userIdToAdd));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingUserId(null);
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

  // Filter candidate users strictly by username (name), ignoring email completely
  const filteredUsers = availableUsers.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-sand-light border border-ink-border rounded-2xl p-6 shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ink-border">
          <div className="flex items-center gap-2 text-ink font-semibold text-base">
            <Users className="w-5 h-5 text-terracotta" />
            <span>Group Details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-muted hover:text-ink rounded-lg hover:bg-sand transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Group Name & Rename section */}
        <div className="my-4 p-3 bg-sand border border-ink-border/70 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-2">
              <span className="text-[10px] uppercase font-semibold text-ink-muted block mb-1">
                Group Name
              </span>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-cream border border-ink-border text-ink text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-terracotta"
                    autoFocus
                  />
                  <button
                    onClick={handleRenameGroup}
                    disabled={loadingAction}
                    className="p-1.5 bg-terracotta hover:bg-terracotta-hover text-white rounded-lg cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <h3 className="text-sm font-bold text-ink truncate">{conversation.name}</h3>
              )}
            </div>

            {isAdmin && !isEditingName && (
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1.5 text-ink-muted hover:text-terracotta rounded-lg hover:bg-sand-dark cursor-pointer"
                title="Rename group"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Members Header */}
        <div className="flex items-center justify-between mt-2 mb-3">
          <span className="text-xs font-semibold text-ink">
            Members ({conversation.members?.length || 0})
          </span>

          {isAdmin && !isAddingMember && (
            <button
              onClick={() => setIsAddingMember(true)}
              className="flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-hover font-medium cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* Search & Add Member Section (Searches ONLY by username, no email shown) */}
        {isAddingMember && (
          <div className="mb-3 p-3 bg-sand border border-ink-border rounded-xl space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">
                Search & Add by Username
              </span>
              <button
                onClick={() => {
                  setIsAddingMember(false);
                  setSearchQuery('');
                }}
                className="p-1 text-ink-muted hover:text-ink rounded-lg hover:bg-sand-dark cursor-pointer"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Username Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type username..."
                autoFocus
                className="w-full bg-cream border border-ink-border text-ink text-xs rounded-lg pl-8.5 pr-3 py-2 placeholder-ink-faint focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>

            {/* Matching Users List (Only username shown, NO email/gmail id) */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {filteredUsers.length === 0 ? (
                <div className="py-3 text-center text-xs text-ink-muted">
                  {searchQuery.trim()
                    ? `No user found matching "${searchQuery}"`
                    : availableUsers.length === 0
                      ? 'All registered users are already in this group'
                      : 'Search username above to add'}
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="p-2 bg-cream border border-ink-border/60 rounded-lg flex items-center justify-between hover:border-ink-border transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-sand-dark text-terracotta flex items-center justify-center text-xs font-semibold shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      {/* Strictly show username only - no email/gmail id */}
                      <span className="text-xs font-medium text-ink truncate">
                        {u.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddMember(u._id)}
                      disabled={addingUserId === u._id}
                      className="px-2.5 py-1 bg-terracotta hover:bg-terracotta-hover disabled:opacity-50 text-white rounded-md text-[11px] font-medium flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      {addingUserId === u._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                      <span>Add</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Existing Group Members List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
          {conversation.members?.map((m) => {
            const memberIsAdmin = conversation.admins?.some(
              (a) => a._id?.toString() === m._id?.toString() || a.toString() === m._id?.toString()
            );
            const isMe = m._id?.toString() === user?._id?.toString();

            return (
              <div
                key={m._id}
                className="p-2.5 bg-sand border border-ink-border/50 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cream border border-ink-border text-terracotta flex items-center justify-center text-xs font-semibold">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-ink">
                        {m.name} {isMe && <span className="text-ink-muted">(You)</span>}
                      </span>
                      {memberIsAdmin && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-sand-dark text-sage border border-ink-border font-medium">
                          <Shield className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove member button: only for admin removing non-self member */}
                {isAdmin && !isMe && (
                  <button
                    onClick={() => handleRemoveMember(m._id)}
                    disabled={loadingAction}
                    className="p-1.5 text-ink-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
        <div className="mt-4 pt-3 border-t border-ink-border text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-sand hover:bg-sand-dark text-ink text-xs font-medium rounded-xl border border-ink-border transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
