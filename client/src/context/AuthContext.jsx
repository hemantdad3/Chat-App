import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check existing session on mount using httpOnly cookie
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
      } catch (err) {
        // User not logged in or token expired - silent catch
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  // Signup action
  const signup = async (payloadOrName, email, password, username, bio, avatarFile) => {
    setLoading(true);
    setError(null);
    try {
      let payload;
      if (payloadOrName instanceof FormData) {
        payload = payloadOrName;
      } else if (typeof payloadOrName === 'object' && payloadOrName !== null) {
        payload = payloadOrName;
      } else {
        payload = { name: payloadOrName, email, password, username, bio };
      }

      const data = await authService.signup(payload);
      setUser(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Login action
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login({ email, password });
      setUser(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  // Update profile action (username, bio)
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser((prev) => ({ ...prev, ...updatedUser }));
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setError(message);
      throw new Error(message);
    }
  };

  // Upload avatar image to ImageKit via backend
  const uploadAvatar = async (imageFile) => {
    setError(null);
    try {
      const updatedUser = await authService.uploadAvatar(imageFile);
      setUser((prev) => ({ ...prev, ...updatedUser }));
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload avatar';
      setError(message);
      throw new Error(message);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signup,
        login,
        logout,
        updateProfile,
        uploadAvatar,
        clearError,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
