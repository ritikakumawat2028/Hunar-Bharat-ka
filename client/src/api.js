import axios from 'axios';

// Automatically detect environment: In production, relative to domain or VITE_API_URL or Render backend; in local dev http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://hunar-bharat-ka.onrender.com');

const api = axios.create({
  baseURL: API_BASE_URL
});

// Automatically inject Authorization header if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { API_BASE_URL };
export default api;
