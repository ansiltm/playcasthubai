import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { trackRequests } from './requestLoading';
const api = trackRequests(axios.create({ baseURL: '/api', timeout: 90000 }));
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    useAuthStore.getState().logout();
    toast.error('Please sign in again.', { id: 'session-expired' });
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') window.location.href = '/login';
  } else if (error.response?.status === 403) toast.error('Admin access required.', { id: 'forbidden' });
  return Promise.reject(error);
});
export default api;

