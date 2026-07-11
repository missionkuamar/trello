// api/axios.js
import axios from 'axios';
import toast from 'react-hot-toast';

let store;

export const injectStore = (_store) => {
  store = _store;
  console.log('✅ Store injected into axios');
};

const api = axios.create({
  baseURL: 'https://trello-rnih.onrender.com/api', // Use the deployed backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor
api.interceptors.request.use(
  (config) => {
    const state = store?.getState();
    const token = state?.auth?.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to request');
    } else {
      console.log('⚠️ No token found');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (store) {
        store.dispatch({ type: 'auth/logout' });
      }
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export default api;