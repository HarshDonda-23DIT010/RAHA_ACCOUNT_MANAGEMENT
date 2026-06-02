import axios from 'axios';

// Web: uses '/api' (proxied by Nginx)
// Mobile (Capacitor): uses absolute VPS URL from VITE_API_URL env var
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
