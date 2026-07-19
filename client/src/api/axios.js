import axios from "axios";
import toast from "react-hot-toast";

let store;

export const injectStore = (_store) => {
  store = _store;
};

// Use relative URL for production, absolute for development
// const API_BASE_URL = import.meta.env.PROD 
//   ? '/api'  // In production, use relative path
//   : 'http://localhost:5000/api';
const API_BASE_URL = 'https://trello-rnih.onrender.com/api'
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true, // Add this for cookies
});

// ================= REQUEST =================
api.interceptors.request.use(
  (config) => {
    const state = store?.getState();
    const token = state?.auth?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      store?.dispatch({ type: "auth/logout" });

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }

      toast.error("Session expired");
    }

    return Promise.reject(error);
  }
);

export default api;