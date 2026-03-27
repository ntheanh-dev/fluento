import axios from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_EXPIRE_TIME } from "../../features/auth/constant";
import { getRuntimeEnv } from "../config/runtime-env";

const runtimeEnv = getRuntimeEnv();
const BASE_URL = runtimeEnv.VITE_API_URL || import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Dùng chung một promise refresh cho tất cả request 401 đang chờ
let refreshTokenPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
    if (!refreshTokenPromise) {
        refreshTokenPromise = (async () => {
            const res = await axios.post<{ result: { accessToken: string } }>(
                `${BASE_URL}/auth/refresh`,
                {},
                {
                    withCredentials: true,
                }
            );
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

            return accessToken;
        })()
            .catch((err) => {
                // Nếu refresh fail thì redirect về login 1 lần
                console.error("Token refresh failed:", err);
                Cookies.remove("accessToken");
                window.location.href = "/login";
                throw err;
            })
            .finally(() => {
                refreshTokenPromise = null;
            });
    }

    return refreshTokenPromise;
};

export const http = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/hal+json'
    },
    withCredentials: true,
    timeout: 30000,
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

http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        // Never try to refresh for the refresh endpoint itself to avoid loops
        const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");
        if (!originalRequest || isRefreshRequest) {
            return Promise.reject(error);
        }

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

        originalRequest._retry = true;

        try {
            // Dùng chung 1 lần refresh cho tất cả request 401 đang chờ
            const accessToken = await refreshAccessToken();

            // Cập nhật header Authorization cho request hiện tại
            if (!originalRequest.headers) {
                originalRequest.headers = {};
            }
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Retry lại đúng request vừa bị 401 một lần
            return http(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }
);