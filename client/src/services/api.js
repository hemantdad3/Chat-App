import axios from 'axios';

/**
 * Base Axios instance configured with API URL and credentials.
 * withCredentials: true ensures httpOnly cookies are included in cross-origin requests.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
