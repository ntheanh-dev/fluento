import axios from "axios";
import { notify } from "../utils/notify";
import Cookies from "js-cookie";

const baseURL = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:9000/api";
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

// Track refresh token attempts to prevent multiple simultaneous requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Handle authentication errors and token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle timeout errors
    const isTimeout = error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "");
    if (isTimeout) {
      const message = "Yêu cầu quá thời gian (timeout). Vui lòng kiểm tra kết nối và thử lại.";
      notify(message, "error");
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (error?.response?.status === 401 && !originalRequest._retry) {
      // Check if we have a refresh token
      const refreshToken = Cookies.get('refresh_token');
      
      if (!refreshToken) {
        // No refresh token, redirect to login
        Cookies.remove('auth_token');
        notify("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "warning");
        
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(error);
      }

      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const refreshResponse = await authAPI.refreshToken(refreshToken);
        
        if (refreshResponse.data?.result?.accessToken) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.result;
          
          // Update cookies with new tokens
          Cookies.set('auth_token', accessToken, {
            expires: 7,
            secure: true,
            sameSite: 'strict',
            path: '/',
          });

          if (newRefreshToken) {
            Cookies.set('refresh_token', newRefreshToken, {
              expires: 7,
              secure: true,
              sameSite: 'strict',
              path: '/',
            });
          }

          // Update the authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Dispatch custom event to notify AuthContext about token refresh
          window.dispatchEvent(new CustomEvent('tokenRefreshed', {
            detail: { accessToken, refreshToken: newRefreshToken }
          }));

          // Process queued requests
          processQueue(null, accessToken);

          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Refresh failed, clear all auth data and redirect to login
        Cookies.remove('auth_token');
        Cookies.remove('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        notify("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "warning");
        
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
    oauthAPI.post('/auth/token', credentials),
  
  // Introspect token
  introspect: (token) => 
    oauthAPI.post('/auth/introspect', {
      token: token
    }),

  // Refresh token
  refreshToken: (token) => 
    oauthAPI.post('/auth/refresh', {
      token: token
    }),

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
