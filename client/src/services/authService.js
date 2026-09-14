import api from './api';

/**
 * Authentication and user profile service communicating with /api/auth and /api/users
 */
const authService = {
  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string }} userData
   */
  signup: async (userData) => {
    if (userData instanceof FormData) {
      const response = await api.post('/auth/signup', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  /**
   * Authenticate existing user
   * @param {{ email: string, password: string }} credentials
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Invalidate session and clear auth cookie
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Verify session and retrieve current logged-in user
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Update current user's profile (username, bio)
   * @param {{ username?: string, bio?: string }} profileData
   */
  updateProfile: async (profileData) => {
    const response = await api.patch('/users/me', profileData);
    return response.data;
  },

  /**
   * Upload user avatar image to ImageKit via backend
   * @param {File} imageFile
   */
  uploadAvatar: async (imageFile) => {
    const formData = new FormData();
    formData.append('avatar', imageFile);

    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get public profile of a user by ID
   * @param {string} userId
   */
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export default authService;
