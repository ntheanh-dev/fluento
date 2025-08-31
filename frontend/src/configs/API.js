import axios from "axios";
import { notify } from "../utils/notify";
import Cookies from "js-cookie";

const baseURL = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";
const defaultTimeoutMs = Number(import.meta?.env?.VITE_API_TIMEOUT_MS) || 30000;

export const api = axios.create({
  baseURL,
  timeout: defaultTimeoutMs,
});

export const oauthAPI = axios.create({
  baseURL: baseURL,
  timeout: defaultTimeoutMs,
});

// Automatically attach auth header for authenticated requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors and token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle timeout errors
    const isTimeout = error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "");
    if (isTimeout) {
      const message = "Yêu cầu quá thời gian (timeout). Vui lòng kiểm tra kết nối và thử lại.";
      notify(message, "error");
    }

    // Handle authentication errors
    if (error?.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('auth_token');
      notify("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "warning");
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  // OAuth authentication
  oauthAuthentication: (code) => 
    oauthAPI.post(`/auth/outbound/authentication?code=${code}`),
  
  // Sign in
  signIn: (credentials) => 
    oauthAPI.post('/auth/signin', credentials),
  
  // Get current user info
  getCurrentUser: () => 
    oauthAPI.get('/auth/me'),
};

export const userAPI = {
  // Get user info
  getUserInfo: (token) => 
    oauthAPI.get('/users/my-info', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  
  // Update user profile
  updateProfile: (userData) => 
    oauthAPI.put('/users/profile', userData),
};
