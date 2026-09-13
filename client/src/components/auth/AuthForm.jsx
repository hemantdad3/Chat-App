import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, MessageSquare } from 'lucide-react';

/**
 * Reusable AuthForm component for Login and Signup
 * @param {{ mode: 'login' | 'signup' }} props
 */
const AuthForm = ({ mode }) => {
  const isSignup = mode === 'signup';
  const { login, signup, error: serverError, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    if (localError) setLocalError('');
    if (serverError) clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Form validations
    if (isSignup && !formData.name.trim()) {
      return setLocalError('Please enter your full name');
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
        await signup(formData.name.trim(), formData.email.trim(), formData.password);
      } else {
        await login(formData.email.trim(), formData.password);
      }
      navigate('/chat');
    } catch (err) {
      // Error handled by AuthContext state or caught here
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || serverError;

  return (
    <div className="w-full max-w-md bg-sand-light border border-ink-border rounded-2xl p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="p-3 bg-sand border border-ink-border rounded-2xl text-terracotta mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">
          {isSignup ? 'Create an Account' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          {isSignup
            ? 'Sign up to start chatting with your colleagues in real-time'
            : 'Enter your credentials to access your conversations'}
        </p>
      </div>

      {/* Error Alert */}
      {displayError && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name (Signup only) */}
        {isSignup && (
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="name">
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
                className="w-full bg-cream border border-ink-border text-ink text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
                autoComplete="name"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="email">
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
              className="w-full bg-cream border border-ink-border text-ink text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="password">
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
              className="w-full bg-cream border border-ink-border text-ink text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </div>
        </div>

        {/* Confirm Password (Signup only) */}
        {isSignup && (
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="confirmPassword">
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
                className="w-full bg-cream border border-ink-border text-ink text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-ink-faint focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-2.5 px-4 bg-terracotta hover:bg-terracotta-hover disabled:bg-terracotta/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
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
      <div className="mt-6 pt-6 border-t border-ink-border text-center text-xs text-ink-muted">
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
