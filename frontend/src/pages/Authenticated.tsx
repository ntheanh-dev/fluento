import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { authAPI, userAPI } from "../configs/API";

export default function Authenticate() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || "/";

  // Use useRef to track if authentication is already in progress
  const authInProgress = useRef(false);

  useEffect(() => {
    // Only run if not already authenticating
    if (authInProgress.current) {
      return;
    }

    authInProgress.current = true;

    const authenticateUser = async () => {
      try {
        const authCodeRegex = /code=([^&]+)/;
        const isMatch = window.location.href.match(authCodeRegex);

        if (!isMatch) {
          setError("Không tìm thấy mã xác thực");
          setIsLoading(false);
          return;
        }

        const authCode = isMatch[1];

        // Step 1: Exchange auth code for tokens
        const tokenResponse = await authAPI.oauthAuthentication(authCode);

        if (!tokenResponse.data?.result?.accessToken || !tokenResponse.data?.result?.refreshToken) {
          throw new Error("Không nhận được token xác thực");
        }

        const { accessToken, refreshToken } = tokenResponse.data.result;

        // Step 2: Get user info
        const userResponse = await userAPI.getUserInfo(accessToken);

        if (!userResponse.data?.result) {
          throw new Error("Không nhận được thông tin người dùng");
        }

        // Step 3: Login user
        const user = {
          id: userResponse.data.result.id,
          username: userResponse.data.result.username,
          urlAvatar: userResponse.data.result.urlAvatar,
          noPassword: userResponse.data.result.noPassword,
        };

        login(accessToken, refreshToken, user);

        // Success - redirect after a short delay
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);

      } catch (error: any) {
        let errorMessage = "Lỗi xác thực không xác định";

        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const data = error.response.data;

          switch (status) {
            case 400:
              errorMessage = data?.message || "Dữ liệu yêu cầu không hợp lệ";
              break;
            case 401:
              errorMessage = "Mã xác thực không hợp lệ hoặc đã hết hạn";
              break;
            case 403:
              errorMessage = "Không có quyền truy cập";
              break;
            case 404:
              errorMessage = "Endpoint không tồn tại";
              break;
            case 500:
              errorMessage = "Lỗi server, vui lòng thử lại sau";
              break;
            default:
              errorMessage = data?.message || `Lỗi server (${status})`;
          }
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng";
        } else if (error.message) {
          // Something else happened
          errorMessage = error.message;
        }

        setError(errorMessage);
        setIsLoading(false);
      } finally {
        // Reset the flag when done
        authInProgress.current = false;
      }
    };

    authenticateUser();
  }, []); // Empty dependency array to run only once

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    window.location.reload();
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "20px",
        }}
      >
        <Alert severity="error" sx={{ maxWidth: "400px" }}>
          {error}
        </Alert>
        <Box sx={{ display: "flex", gap: "10px" }}>
          <Button variant="contained" onClick={handleRetry}>
            Thử lại
          </Button>
          <Button variant="outlined" onClick={handleGoToLogin}>
            Về trang đăng nhập
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
      <Typography>Đang xác thực...</Typography>
    </Box>
  );
}
