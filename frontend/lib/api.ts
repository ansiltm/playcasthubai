import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Suppress "Invalid token" message, instead force logout
        useAuthStore.getState().logout();
        toast.error('Your session has expired. Please log in again.', { id: 'session-expired' });
        // Optional: redirect to login via window.location if router is unavailable here
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (error.response.status === 403) {
        toast.error('You do not have permission to perform this action.', { id: 'forbidden' });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
