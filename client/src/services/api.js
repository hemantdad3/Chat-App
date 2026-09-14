import axios from 'axios';

/**
 * Base Axios instance configured with API URL and credentials.
 * withCredentials: true ensures httpOnly cookies are included in requests.
 * Request interceptor attaches Bearer token from localStorage as cross-origin fallback
 * when browsers restrict cross-domain cookies (e.g. Vercel frontend to Render backend).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
