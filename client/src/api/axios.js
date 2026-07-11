import axios from "axios";
import toast from "react-hot-toast";

let store;

export const injectStore = (_store) => {
  store = _store;
  console.log("✅ Store injected into axios");
};

const api = axios.create({
  baseURL: "https://trello-rnih.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ================= REQUEST =================

api.interceptors.request.use(
  (config) => {
    const state = store?.getState();
    const token = state?.auth?.token;

    console.group("🚀 API REQUEST");
    console.log("Method :", config.method?.toUpperCase());
    console.log("URL :", config.baseURL + config.url);
    console.log("Data :", config.data);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token Added");
    } else {
      console.log("⚠️ No Token");
    }

    console.groupEnd();

    return config;
  },
  (error) => {
    console.error("❌ Request Error", error);
    return Promise.reject(error);
  }
);

// ================= RESPONSE =================

api.interceptors.response.use(
  (response) => {
    console.group("✅ API RESPONSE");
    console.log("URL :", response.config.url);
    console.log("Status :", response.status);
    console.log("Data :", response.data);
    console.groupEnd();

    return response;
  },
  (error) => {
    console.group("❌ API ERROR");

    if (error.response) {
      console.log("Status :", error.response.status);
      console.log("Data :", error.response.data);
      console.log("Headers :", error.response.headers);
    } else if (error.request) {
      console.log("No Response From Backend");
      console.log(error.request);
    } else {
      console.log("Axios Error :", error.message);
    }

    console.groupEnd();

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