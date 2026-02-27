import axios from "axios";
import toast from "react-hot-toast";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

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

      // Only redirect if not already on login page
      if (!isAlreadyOnLogin) {
        toast.error("Session expired. Please log in again.", {
          duration: 3000,
        });

        // Give the toast 2 seconds to show before redirecting
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          window.location.href = "/";
        }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;