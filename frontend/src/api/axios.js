import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT token (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bulkmail_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, log the admin out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("bulkmail_token");
      localStorage.removeItem("bulkmail_admin");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
