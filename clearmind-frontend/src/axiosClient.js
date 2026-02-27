import axios from "axios";
import toast from "react-hot-toast";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Clear token when browser/tab is closed ─────────────────────────────────
// sessionStorage is cleared automatically when the tab/browser closes
// If no session flag exists, it means a fresh browser open — clear old token
if (!sessionStorage.getItem("session_active")) {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
}
sessionStorage.setItem("session_active", "true");

// ── Request Interceptor ────────────────────────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAlreadyOnLogin = window.location.pathname === "/";
      if (!isAlreadyOnLogin) {
        toast.error("Session expired. Please log in again.", {
          duration: 3000,
        });
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          sessionStorage.removeItem("session_active");
          window.location.href = "/";
        }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;