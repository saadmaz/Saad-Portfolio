/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to inject token
apiClient.interceptors.request.use((config) => {
  const secret = localStorage.getItem('admin_secret');
  if (secret) {
    config.headers.Authorization = `Bearer ${secret}`;
  }
  return config;
});

// Add response interceptor for easy data access
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Log error or handle globally
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);
