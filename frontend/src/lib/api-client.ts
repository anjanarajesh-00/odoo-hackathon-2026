import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      if (isAuthenticated) {
        useAuthStore.getState().logout();
        toast.error("Your session has expired. Please sign in again.");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    } else if (status === 403) {
      toast.error("You don't have permission to perform this action.");
    }

    return Promise.reject(error);
  }
);

