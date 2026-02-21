import axios from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_EXPIRE_TIME } from "../../features/auth/constant";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const http = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/hal+json'
    },
    withCredentials: true,
    timeout: 10000,
    timeoutErrorMessage: "Request timed out"
})

http.interceptors.request.use((config) => {
    const token = Cookies.get('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // FormData: bỏ Content-Type để browser tự set multipart/form-data + boundary
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
});

/** Queue requests while refresh is in progress to avoid multiple refresh calls */
let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (token: string | null, error: unknown = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Don't try refresh on logout — let the app handle redirect
        const isLogoutRequest = originalRequest.url?.includes("/auth/logout");
        if (isLogoutRequest) {
            Cookies.remove("accessToken");
            return Promise.reject(error);
        }

        // Already on login page — avoid redirect to prevent reload loop
        if (window.location.pathname === "/login") {
            Cookies.remove("accessToken");
            return Promise.reject(error);
        }

        // Refresh token is in httpOnly cookie (path /auth/refresh), sent automatically with withCredentials
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token) => {
                        if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(http(originalRequest));
                    },
                    reject,
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const res = await http.post<{ result: { accessToken: string } }>("/auth/refresh", {}, {
                withCredentials: true,
            });
            const accessToken = res.data?.result?.accessToken;
            if (!accessToken) {
                throw new Error("Invalid refresh response");
            }
            Cookies.set("accessToken", accessToken, {
                expires: ACCESS_TOKEN_EXPIRE_TIME,
                secure: true,
                sameSite: "strict",
                path: "/",
            });
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            processQueue(accessToken);
            return http(originalRequest);
        } catch (refreshError) {
            processQueue(null, refreshError);
            Cookies.remove("accessToken");
            window.location.href = "/login";
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);