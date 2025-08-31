import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  Modal,
  Backdrop,
  Fade,
  Button,
  TextField,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { CiLogout } from "react-icons/ci";
import Container from "@mui/material/Container";
import { FaKey } from "react-icons/fa";
import logo from "../assets/image/logo3.png";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  { label: "Luyện viết", path: "/" },
  { label: "Lịch sử luyện", path: "/analytic" },
  { label: "Học lại từ", path: "/contact" },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const menuRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // State for API key (string, not boolean)
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  useEffect(() => {
    const activeIndex = menuItems.findIndex(
      (item) => location.pathname === item.path
    );
    const activeElement = menuRefs.current[activeIndex];

    if (activeElement) {
      const rect = activeElement.getBoundingClientRect();
      const parentRect = activeElement.parentElement?.getBoundingClientRect();

      if (parentRect) {
        setIndicatorStyle({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    }
  }, [location.pathname]);

  const handleApiKeyButtonClick = () => {
    setShowApiKeyModal(true);
    setApiKeyInput("");
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput.trim());
    setShowApiKeyModal(false);
    setApiKeyInput("");
  };

  const handleRemoveApiKey = () => {
    setApiKey("");
    setApiKeyInput("");
    setShowApiKeyModal(false);
  };

  const handleUpdateApiKey = () => {
    setApiKey(apiKeyInput.trim());
    setShowApiKeyModal(false);
    setApiKeyInput("");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if logout fails
      navigate('/');
    }
  };

  return (
    <div className="h-16 fixed top-0 left-0 right-0 z-50 bg-[#eaf6fa]/80 backdrop-blur-sm flex items-center border-b border-gray-100">
      <Container className="w-full flex justify-between min-h-0 px-6">
        {/* Logo and Menu */}
        <Box className="flex items-center gap-8">
          <Link className="flex items-center hover:cursor-pointer" to="/">
            <Box className="rounded-md w-20 h-20 flex items-center justify-center">
              <img src={logo} alt="logo"></img>
            </Box>
            <p className="font-bold text-2xl">FLUENTO</p>
          </Link>

          {/* Menu */}
          <Box className="flex gap-6 relative">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  ref={(el) => {
                    menuRefs.current[index] = el;
                  }}
                  className={`text-[15px] transition-colors duration-150 ease-in-out relative hover:cursor-pointer ${isActive
                    ? "text-black"
                    : "text-gray-600 hover:text-black"
                    }`}
                  style={{ paddingBottom: 4 }}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Animated indicator line */}
            <div
              className="absolute bottom-0 h-0.5 bg-black/80 transition-all duration-150 ease-in-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          </Box>
        </Box>

        {/* Avatar and API Key Button */}
        <Box className="flex items-center gap-3">
          {/* API Key Button */}
          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white text-sm shadow-sm focus:outline-none transition-all duration-200 ${Boolean(apiKey)
              ? "bg-green-500 hover:bg-green-600"
              : "bg-orange-500 hover:bg-orange-600"
              }`}
            onClick={handleApiKeyButtonClick}
          >
            <FaKey className="text-lg" />
            {Boolean(apiKey) ? "API Key Connected" : "Connect API Key"}
          </button>
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <IconButton
                  color="inherit"
                  {...bindTrigger(popupState)}
                  size="large"
                  className=" transition-colors duration-200"
                >
                  <Avatar
                    alt={isAuthenticated ? user?.username || 'User' : 'Guest'}
                    src={user?.urlAvatar}
                    className="w-8 h-8 border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200"
                  >
                    {/* {isAuthenticated && user?.username ? user.username.charAt(0).toUpperCase() : 'G'} */}
                  </Avatar>
                </IconButton>
                <Menu
                  {...bindMenu(popupState)}
                  className="mt-2"
                  PaperProps={{
                    className:
                      "shadow-lg border border-gray-100 rounded-lg min-w-[200px]",
                    elevation: 8,
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  {isAuthenticated ? (
                    <MenuItem
                      key="logout"
                      className="py-3 px-4 hover:shadow-sm transition-all duration-200 rounded-md mx-2 my-1"
                      onClick={async () => {
                        await handleLogout();
                        popupState.close();
                      }}
                    >
                      <Box className="flex items-center gap-3 text-sm font-medium text-red-600 transition-all duration-200 w-full">
                        <CiLogout className="text-lg hover:scale-110 transition-transform duration-200" />
                        Đăng xuất
                      </Box>
                    </MenuItem>
                  ) : (
                    <MenuItem
                      key="login"
                      className="py-3 px-4 hover:shadow-sm transition-all duration-200 rounded-md mx-2 my-1"
                    >
                      <Link
                        to="/login"
                        className="flex items-center gap-3 text-sm font-medium text-gray-700 transition-all duration-200 w-full"
                        onClick={() => popupState.close()}
                      >
                        <CiLogout className="text-lg hover:scale-110 transition-transform duration-200" />
                        Đăng nhập
                      </Link>
                    </MenuItem>
                  )}
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
        </Box>
      </Container>
      {/* API Key Modal */}
      <Modal
        open={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Fade in={showApiKeyModal}>
          <Box className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-[95vw] max-w-lg outline-none border border-gray-100">
            {apiKey ? (
              <>
                <Box className="bg-green-50 border border-green-300 rounded-lg p-2 flex items-center gap-3 mb-5">
                  <span className="bg-green-500 text-white rounded-full p-2 flex items-center justify-center text-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      className="font-semibold text-green-700 mb-1"
                    >
                      API Key đã kết nối
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="subtitle2"
                  className="mb-2 text-gray-700 font-semibold"
                >
                  Cập nhật API Key
                </Typography>
                <Box className="my-4">
                  <TextField
                    label="Nhập API Key mới"
                    placeholder="Dán Google Gemini API key mới của bạn"
                    fullWidth
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    autoFocus
                    InputProps={{
                      style: {
                        fontFamily: "monospace",
                        fontSize: 16,
                        background: "#f8fafc",
                        borderRadius: 8,
                      },
                    }}
                  />
                </Box>
                <Box className="bg-blue-50 rounded-lg p-4 mb-7 border border-blue-100">
                  <Typography
                    variant="body2"
                    className="text-gray-700 mb-2 font-semibold"
                  >
                    <span className="mr-1">💡</span>Bạn chưa có API key?
                  </Typography>
                  <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                    <li>
                      Truy cập{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline font-medium"
                      >
                        Google AI Studio
                      </a>
                    </li>
                    <li>Đăng nhập bằng tài khoản Google của bạn</li>
                    <li>Nhấn "Create API key" và sao chép khoá</li>
                    <li>Dán vào ô phía trên</li>
                  </ol>
                </Box>
                <Box className="flex flex-wrap justify-end gap-3 mt-2 mb-2">
                  <Button
                    onClick={() => setShowApiKeyModal(false)}
                    variant="outlined"
                    className="rounded-lg px-5 py-2 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleRemoveApiKey}
                    variant="contained"
                    color="error"
                    className="rounded-lg px-5 py-2 font-semibold bg-red-500 hover:bg-red-600 flex items-center gap-2"
                  >
                    <span role="img" aria-label="remove">
                      🗑️
                    </span>{" "}
                    Xoá khoá
                  </Button>
                  <Button
                    onClick={handleUpdateApiKey}
                    variant="contained"
                    className="rounded-lg px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-700"
                    disabled={
                      !apiKeyInput.trim() || apiKeyInput.trim() === apiKey
                    }
                  >
                    Cập nhật khoá
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography
                  variant="h5"
                  className="mb-5 flex items-center gap-3 font-bold text-gray-800"
                >
                  <span className="bg-yellow-100 text-yellow-700 rounded-full p-2 flex items-center justify-center text-2xl shadow-sm">
                    <FaKey />
                  </span>
                  Kết nối Google Gemini API Key
                </Typography>
                <Typography variant="body2" className="mb-6 text-gray-600">
                  Khoá này cho phép ứng dụng phân tích bài viết của bạn và cung
                  cấp phản hồi. Khoá sẽ được lưu an toàn trên trình duyệt của
                  bạn.
                </Typography>
                <Box className="my-4">
                  <TextField
                    label="Nhập API Key"
                    placeholder="AIzaSyBk... (dán Google Gemini API key của bạn)"
                    fullWidth
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    autoFocus
                    InputProps={{
                      style: {
                        fontFamily: "monospace",
                        fontSize: 16,
                        background: "#f8fafc",
                        borderRadius: 8,
                      },
                    }}
                  />
                </Box>
                <Box className="bg-blue-50 rounded-lg p-4 mb-7 border border-blue-100">
                  <Typography
                    variant="body2"
                    className="text-gray-700 mb-2 font-semibold"
                  >
                    <span className="mr-1">💡</span>Bạn chưa có API key?
                  </Typography>
                  <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                    <li>
                      Truy cập{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline font-medium"
                      >
                        Google AI Studio
                      </a>
                    </li>
                    <li>Đăng nhập bằng tài khoản Google của bạn</li>
                    <li>Nhấn "Create API key" và sao chép khoá</li>
                    <li>Dán vào ô phía trên</li>
                  </ol>
                </Box>
                <Box className="flex justify-end gap-3 mt-2 mb-2">
                  <Button
                    onClick={() => setShowApiKeyModal(false)}
                    variant="outlined"
                    className="rounded-lg px-5 py-2 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSaveApiKey}
                    variant="contained"
                    className="rounded-lg px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-700"
                    disabled={!apiKeyInput.trim()}
                  >
                    Lưu khoá
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default Header;
