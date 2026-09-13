import api from './api';

/**
 * Authentication service communicating with /api/auth endpoints
 */
const authService = {
  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string }} userData
   */
  signup: async (userData) => {
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
};

export default authService;
