import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  MessageSquare,
  Camera,
  AtSign,
} from 'lucide-react';

/**
 * Reusable AuthForm component for Login and Signup
 * Supports Full Name, Username, Avatar upload, Email, and Password
 * @param {{ mode: 'login' | 'signup' }} props
 */
const AuthForm = ({ mode }) => {
  const isSignup = mode === 'signup';
  const { login, signup, error: serverError, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    if (localError) setLocalError('');
    if (serverError) clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (localError) setLocalError('');
    if (serverError) clearError();

    const isJpg = file.type === 'image/jpeg' || file.type === 'image/pjpeg' || /\.jpe?g$/i.test(file.name);
    if (!isJpg) {
      return setLocalError('Please select a JPG image file.');
    }

    if (file.size > 2 * 1024 * 1024) {
      return setLocalError('Avatar image size must be under 2MB.');
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Form validations
    if (isSignup && !formData.name.trim()) {
      return setLocalError('Please enter your full name');
    }

    if (isSignup && !formData.username.trim()) {
      return setLocalError('Please choose a username');
    }

    if (isSignup) {
      const cleanUsername = formData.username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
        return setLocalError('Username must be between 3 and 30 characters and contain only letters, numbers, and underscores');
      }
    }

    if (!formData.email.trim()) {
      return setLocalError('Please enter your email address');
    }

    if (!formData.password) {
      return setLocalError('Please enter your password');
    }

    if (formData.password.length < 6) {
      return setLocalError('Password must be at least 6 characters long');
    }

    if (isSignup && formData.password !== formData.confirmPassword) {
      return setLocalError('Passwords do not match');
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        if (avatarFile) {
          const formPayload = new FormData();
          formPayload.append('name', formData.name.trim());
          formPayload.append('email', formData.email.trim());
          formPayload.append('password', formData.password);
          formPayload.append('username', formData.username.trim().toLowerCase());
          formPayload.append('avatar', avatarFile);
          await signup(formPayload);
        } else {
          const jsonPayload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            username: formData.username.trim().toLowerCase(),
          };
          await signup(jsonPayload);
        }
      } else {
        await login(formData.email.trim(), formData.password);
      }
      navigate('/chat');
    } catch (err) {
      // Error handled by AuthContext or caught here
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || serverError;

  return (
    <div className="w-full max-w-md bg-sand-light border border-ink-border rounded-2xl p-6 sm:p-8 shadow-sm max-h-[92vh] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="p-3 bg-sand border border-ink-border rounded-2xl text-terracotta mb-3">
          <MessageSquare className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink font-serif">
          {isSignup ? 'Create an Account' : 'Welcome Back'}
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          {isSignup
            ? 'Sign up to start chatting with your colleagues in real-time'
            : 'Enter your credentials to access your conversations'}
        </p>
      </div>

      {/* Error Alert */}
      {displayError && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Avatar Upload (Signup only) */}
        {isSignup && (
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar
                src={avatarPreview}
                name={formData.name || 'User'}
                size="xl"
                className="shadow-xs"
              />

              {/* Camera upload overlay */}
              <div className="absolute inset-0 bg-ink/50 group-hover:opacity-100 opacity-0 rounded-xl flex flex-col items-center justify-center transition-opacity text-white">
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium">Photo</span>
              </div>

              {/* Small camera badge */}
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-terracotta text-white rounded-lg shadow-sm border border-white">
                <Camera className="w-3 h-3" />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/pjpeg,.jpg,.jpeg"
              className="hidden"
            />

            <span className="text-[11px] text-ink-muted mt-2">
              {avatarFile ? avatarFile.name : 'Upload avatar (optional, JPG only, under 2MB)'}
            </span>
          </div>
        )}

        {/* Full Name (Signup only) */}
        {isSignup && (
          <div>
            <label className="block text-xs font-medium text-ink mb-1" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-cream border border-ink-border text-ink text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
                autoComplete="name"
              />
            </div>
          </div>
        )}

        {/* Username (Signup only, required) */}
        {isSignup && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-ink" htmlFor="username">
                Username
              </label>
              <span className="text-[10px] text-ink-muted">3–30 characters, unique</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-muted select-none">
                @
              </span>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })
                }
                placeholder="unique_username"
                maxLength={30}
                className="w-full bg-cream border border-ink-border text-ink text-xs sm:text-sm rounded-xl pl-8 pr-4 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
                autoComplete="username"
              />
            </div>
          </div>
        )}

        {/* Email Address */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-cream border border-ink-border text-ink text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-cream border border-ink-border text-ink text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </div>
        </div>

        {/* Confirm Password (Signup only) */}
        {isSignup && (
          <div>
            <label className="block text-xs font-medium text-ink mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-cream border border-ink-border text-ink text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-2.5 px-4 bg-terracotta hover:bg-terracotta-hover disabled:bg-terracotta/50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isSignup ? 'Creating account...' : 'Signing in...'}</span>
            </>
          ) : (
            <>
              <span>{isSignup ? 'Sign Up' : 'Log In'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch auth mode footer */}
      <div className="mt-5 pt-4 border-t border-ink-border text-center text-xs text-ink-muted">
        {isSignup ? (
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-sage hover:text-sage-hover font-semibold transition-colors">
              Log in
            </Link>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="text-sage hover:text-sage-hover font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
