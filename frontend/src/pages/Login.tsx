import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { Google } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../assets/image/logo4.png";
import { oauthConfig } from "../configs/oauthConfig";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || "/";

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email không được để trống";
    }
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ";
    }
    return "";
  };

  // Password validation function
  const validatePassword = (password: string) => {
    if (!password) {
      return "Mật khẩu không được để trống";
    }
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    return "";
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleLoginWithGoogle = () => {
    const callbackUrl = oauthConfig.redirectUri;
    const authUrl = oauthConfig.authUri;
    const googleClientId = oauthConfig.clientId;

    const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

    window.location.href = targetUrl;
  };

  const handleSignIn = async () => {
    // Validate both fields before proceeding
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/auth/signin", {
        email,
        password,
      });

      // Login successful
      setSnackbar({
        open: true,
        message: "Đăng nhập thành công!",
        severity: "success",
      });

      // Store token and user data using AuthContext
      if (response.data.token) {
        const userData = {
          id: response.data.user?.id || 'unknown',
          username: response.data.user?.username || email.split('@')[0],
          urlAvatar: response.data.user?.urlAvatar || '',
          noPassword: response.data.user?.noPassword || false,
        };

        login(response.data.token, response.data.refreshToken, userData);
      }

      // Redirect to the page user was trying to access
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);

      if (axios.isAxiosError(error)) {
        // Handle axios error
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";

        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      } else {
        // Handle other errors
        setSnackbar({
          open: true,
          message: "Lỗi kết nối. Vui lòng thử lại sau.",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 relative overflow-hidden">
      {/* Main content */}
      <Box className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
        {/* Greet Logo */}
        <Box className="flex items-center">
          <Box className="rounded-md w-56 h-36 flex items-center justify-center">
            <img src={logo} alt="logo"></img>
          </Box>
        </Box>

        {/* Login Card */}
        <Box className="bg-white rounded-2xl p-10 shadow-2xl w-full max-w-md">
          {/* Sign in title */}
          <Typography
            variant="h4"
            className="font-bold text-gray-700 text-center mb-8 text-2xl"
          >
            Đăng nhập
          </Typography>

          {/* Email field */}
          <Box className="mb-5">
            <Typography
              variant="body2"
              className="text-gray-500 mb-2 font-medium"
            >
              Email
            </Typography>
            <TextField
              fullWidth
              value={email}
              onChange={handleEmailChange}
              variant="outlined"
              placeholder="Nhập email của bạn"
              className="rounded-lg"
              error={!!emailError}
              helperText={emailError}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": {
                    borderColor: emailError ? "#ef4444" : "#d1d5db",
                  },
                  "&:hover fieldset": {
                    borderColor: emailError ? "#ef4444" : "#9ca3af",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: emailError ? "#ef4444" : "#3b82f6",
                  },
                },
                "& .MuiFormHelperText-root": {
                  marginLeft: 0,
                  marginRight: 0,
                  fontSize: "12px",
                },
              }}
            />
          </Box>

          {/* Password field */}
          <Box className="mb-5">
            <Typography
              variant="body2"
              className="text-gray-500 mb-2 font-medium"
            >
              Mật khẩu
            </Typography>
            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={handlePasswordChange}
              variant="outlined"
              placeholder="Mật khẩu"
              className="rounded-lg"
              error={!!passwordError}
              helperText={passwordError}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": {
                    borderColor: passwordError ? "#ef4444" : "#d1d5db",
                  },
                  "&:hover fieldset": {
                    borderColor: passwordError ? "#ef4444" : "#9ca3af",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: passwordError ? "#ef4444" : "#3b82f6",
                  },
                },
                "& .MuiFormHelperText-root": {
                  marginLeft: 0,
                  marginRight: 0,
                  fontSize: "12px",
                },
              }}
            />
          </Box>

          {/* Forgot password link */}
          <Box className="text-right mb-4">
            <Link
              href="#"
              className="text-blue-500 no-underline text-sm font-medium hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </Box>

          {/* Sign in button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleSignIn}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg py-3 normal-case font-semibold text-base mb-6 hover:from-blue-600 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          {/* Divider */}
          <Box className="flex items-center my-4">
            <Box className="flex-1 h-px bg-gray-200"></Box>
            <Typography variant="body2" className="text-gray-400 mx-4 text-sm">
              hoặc
            </Typography>
            <Box className="flex-1 h-px bg-gray-200"></Box>
          </Box>

          {/* Google sign in button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={handleLoginWithGoogle}
            disabled={loading}
            className="border-gray-300 rounded-lg py-3 normal-case font-medium text-base text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            Tiếp tục với Google
          </Button>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
