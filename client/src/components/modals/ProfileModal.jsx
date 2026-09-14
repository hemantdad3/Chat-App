import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { X, Camera, Check, Loader2, User, AlertCircle, Sparkles, Eye } from 'lucide-react';

/**
 * ProfileModal Component
 * Allows user to customize username, bio, view full-size avatar, and upload an avatar
 */
const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile, uploadAvatar } = useAuth();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
      setAvatarPreview(null);
      setSelectedFile(null);
      setShowLightbox(false);
      setError('');
      setSuccess('');
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  // Handle avatar file selection with client-side 2MB & JPG-only validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    // Check MIME type and file extension strictly for JPG/JPEG
    const isJpg = file.type === 'image/jpeg' || file.type === 'image/pjpeg' || /\.jpe?g$/i.test(file.name);
    if (!isJpg) {
      setError('Please select a JPG image file.');
      return;
    }

    // Check size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar image size must be under 2MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  // Upload avatar immediately or on save
  const handleUploadAvatarDirectly = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    setError('');
    setSuccess('');
    try {
      await uploadAvatar(file);
      setSuccess('Profile photo updated successfully!');
      setSelectedFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setError(err.message || 'Failed to upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle form submission for username and bio
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanUsername = username.trim().toLowerCase();

    // Client-side username validation
    if (cleanUsername) {
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
        return setError('Username must be 3–30 characters and contain only letters, numbers, or underscores.');
      }
    }

    if (bio.length > 150) {
      return setError('Bio cannot exceed 150 characters.');
    }

    setLoading(true);
    try {
      // 1. If an avatar file is queued, upload it first
      if (selectedFile) {
        await uploadAvatar(selectedFile);
        setSelectedFile(null);
        setAvatarPreview(null);
      }

      // 2. Update username and bio
      await updateProfile({
        username: cleanUsername,
        bio: bio.trim(),
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to save profile changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fadeIn">
        <div className="w-full max-w-md bg-sand-light border border-ink-border rounded-2xl p-6 shadow-xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-ink-border">
            <div className="flex items-center gap-2 text-ink font-semibold text-base">
              <User className="w-5 h-5 text-terracotta" />
              <span>Edit Profile</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-ink-muted hover:text-ink rounded-lg hover:bg-sand transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-sand border border-sage/40 rounded-xl text-sage text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative group">
                <Avatar
                  src={avatarPreview || user.avatarUrl}
                  name={user.name}
                  size="2xl"
                  className="shadow-sm"
                />

                {/* Camera upload overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar || loading}
                  className="absolute inset-0 bg-ink/50 hover:bg-ink/60 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                  title="Change Avatar"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-medium">Change</span>
                    </>
                  )}
                </button>

                {/* Small camera badge (bottom-right) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-2 bg-terracotta hover:bg-terracotta-hover text-white rounded-xl shadow-md cursor-pointer transition-colors border border-white"
                  title="Upload photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>

                {/* Small eye icon button badge (bottom-left) */}
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  className="absolute -bottom-1 -left-1 p-2 bg-cream hover:bg-sand text-ink rounded-xl shadow-md cursor-pointer transition-colors border border-ink-border"
                  title="View full-size avatar"
                >
                  <Eye className="w-3.5 h-3.5 text-terracotta" />
                </button>
              </div>

              {/* Action buttons: View Avatar & Change Photo */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-sand hover:bg-sand-dark/40 border border-ink-border rounded-lg text-xs font-medium text-ink transition-colors cursor-pointer"
                  title="View full-size avatar preview"
                >
                  <Eye className="w-3.5 h-3.5 text-terracotta" />
                  <span>View Avatar</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar || loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-sand hover:bg-sand-dark/40 border border-ink-border rounded-lg text-xs font-medium text-ink transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <Camera className="w-3.5 h-3.5 text-terracotta" />
                  <span>Change Photo</span>
                </button>
              </div>

              {/* Hidden file input strictly JPG */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/pjpeg,.jpg,.jpeg"
                className="hidden"
              />

              {/* Clean format guidance: JPG only, under 2MB (No mention of ImageKit or storage provider) */}
              <p className="text-[11px] text-ink-muted mt-1.5">
                JPG only, under 2MB
              </p>

              {selectedFile && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-ink font-medium truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUploadAvatarDirectly(selectedFile)}
                    disabled={uploadingAvatar}
                    className="px-2.5 py-1 bg-terracotta hover:bg-terracotta-hover text-white text-[11px] rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>Upload Now</span>
                  </button>
                </div>
              )}
            </div>



          {/* Display Name (Read-only indication) */}
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={user.name}
              disabled
              className="w-full bg-sand/60 border border-ink-border/60 text-ink-muted text-xs rounded-xl px-3.5 py-2.5 cursor-not-allowed select-none"
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1" htmlFor="username">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs text-ink-muted font-medium select-none">
                @
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                placeholder="your_unique_username"
                maxLength={30}
                className="w-full bg-cream border border-ink-border text-ink text-xs rounded-xl pl-8 pr-3.5 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
              />
            </div>
            <p className="text-[10px] text-ink-muted mt-1">
              3–30 chars, letters, numbers, and underscores only.
            </p>
          </div>

          {/* Bio Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-ink" htmlFor="bio">
                Bio
              </label>
              <span
                className={`text-[10px] ${
                  bio.length > 140 ? 'text-terracotta font-semibold' : 'text-ink-muted'
                }`}
              >
                {bio.length}/150
              </span>
            </div>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a little about yourself..."
              maxLength={150}
              rows={3}
              className="w-full bg-cream border border-ink-border text-ink text-xs rounded-xl px-3.5 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-ink-border flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink rounded-xl hover:bg-sand transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingAvatar}
              className="px-5 py-2 bg-terracotta hover:bg-terracotta-hover disabled:opacity-50 text-white text-xs font-medium rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
          </form>
        </div>
      </div>

      {/* Full-size Avatar Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative bg-sand-light border border-ink-border rounded-2xl p-5 max-w-sm sm:max-w-md w-full shadow-2xl flex flex-col items-center animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-ink-border">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                <Eye className="w-4 h-4 text-terracotta" />
                <span>Avatar Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLightbox(false)}
                className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-sand transition-colors cursor-pointer"
                title="Close preview"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Full Size Image */}
            <div className="w-full aspect-square max-w-[320px] bg-sand rounded-xl overflow-hidden flex items-center justify-center border border-ink-border/50 shadow-inner">
              <img
                src={avatarPreview || user.avatarUrl}
                alt={`${user.name}'s Avatar`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Lightbox Footer */}
            <div className="w-full flex items-center justify-between pt-3 mt-3 border-t border-ink-border text-xs text-ink-muted">
              <span className="font-semibold text-ink truncate">{user.name}</span>
              <span className="text-[11px] font-mono">@{user.username || 'user'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
