import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { CiLogout } from "react-icons/ci";
import { HiMenu, HiX } from "react-icons/hi";
import Container from "@mui/material/Container";
import logo from "../assets/image/logo3.png";
import { useAuth } from "../contexts/AuthContext";
import { notify } from "../utils/notify";
import { FaKey } from "react-icons/fa";
import { Modal, Backdrop, Fade, Typography, TextField, Button } from "@mui/material";

const menuItems = [
  { label: "Luyện từ vựng", path: "/vocabulary" },
  { label: "Từ điển", path: "/dictionary" },
  { label: "Luyện viết", path: "/writing" },
  { label: "Thống kê học tập", path: "/analytic" },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, hasApiKey, saveApiKey } = useAuth();
  const menuRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for API key modal
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  const handleApiKeyButtonClick = () => {
    setShowApiKeyModal(true);
    setApiKeyInput("");
  };

  const handleSaveApiKey = async () => {
    try {
      await saveApiKey("GOOGLE", apiKeyInput.trim());
      setShowApiKeyModal(false);
      setApiKeyInput("");
    } catch (error) {
      // Error handling is done in AuthContext
      console.error('Failed to save API key:', error);
    }
  };


  const handleLogout = async () => {
    try {
      await logout();
      notify("Đăng xuất thành công!", "success");
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if logout fails
      navigate('/');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Manage focus when mobile menu opens/closes
  useEffect(() => {
    if (mobileMenuOpen) {
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when menu is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <div className="h-16 fixed top-0 left-0 right-0 z-50 bg-[#eaf6fa]/80 backdrop-blur-sm flex items-center border-b border-gray-100">
        <Container className="w-full flex justify-between min-h-0 px-6">
          {/* Logo and Menu */}
          <Box className="flex items-center gap-4 md:gap-8">
            {/* Mobile Menu Button */}
            <IconButton
              className="md:hidden text-gray-600 hover:text-gray-800 transition-colors duration-200"
              onClick={toggleMobileMenu}
              size="large"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              sx={{
                display: { xs: 'flex', sm: 'flex', md: 'none' }
              }}
            >
              {mobileMenuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
            </IconButton>

            <Link className="flex items-center hover:cursor-pointer" to="/">
              <Box className="rounded-md w-12 h-12 md:w-20 md:h-20 flex items-center justify-center">
                <img src={logo} alt="logo"></img>
              </Box>
              <p className="font-bold text-lg md:text-2xl">FLUENTO</p>
            </Link>

            {/* Desktop Menu */}
            <Box
              className="hidden md:flex gap-6 relative"
              sx={{
                display: { xs: 'none', sm: 'none', md: 'flex' }
              }}
            >
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

            </Box>
          </Box>

          {/* Avatar */}
          <Box className="flex items-center gap-3">

            {/* API Key Button - Only show when no API key */}
            {!hasApiKey && (
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white text-sm shadow-sm focus:outline-none transition-all duration-200 bg-orange-500 hover:bg-orange-600"
                onClick={handleApiKeyButtonClick}
              >
                <FaKey className="text-lg" />
                Connect API Key
              </button>
            )}

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
      </div>
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
            <Typography
              variant="h5"
              className="mb-5 flex items-center gap-3 font-bold text-gray-800"
            >
              <span className="bg-yellow-100 text-yellow-700 rounded-full p-2 flex items-center justify-center text-2xl shadow-sm">
                <FaKey />
              </span>
              Kết nối Google Gemini API Key
            </Typography>

            <Box className="my-4">
              <TextField
                label="Nhập API Key"
                placeholder="AIzaSyBk..."
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
          </Box>
        </Fade>
      </Modal>
      {/* Mobile Sidebar */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        className="md:hidden"
        ModalProps={{
          keepMounted: true, // Better for mobile performance
        }}
        PaperProps={{
          className: "w-80 bg-white shadow-xl",
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Box className="rounded-md w-10 h-10 flex items-center justify-center">
                <img src={logo} alt="logo"></img>
              </Box>
              <p className="font-bold text-xl text-gray-800">FLUENTO</p>
            </div>
            <IconButton
              onClick={closeMobileMenu}
              className="text-gray-600 hover:text-gray-800"
            >
              <HiX className="text-2xl" />
            </IconButton>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4">
            <List>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem
                    key={item.label}
                    component={Link}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`mb-2 rounded-lg transition-all duration-200 ${isActive
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "hover:bg-gray-50 text-gray-700"
                      }`}
                  >
                    <ListItemText
                      primary={item.label}
                      className={`font-medium ${isActive ? "text-blue-600" : "text-gray-700"}`}
                    />
                  </ListItem>
                );
              })}

            </List>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                alt={isAuthenticated ? user?.username || 'User' : 'Guest'}
                src={user?.urlAvatar}
                className="w-10 h-10 border-2 border-gray-200"
              />
              <div>
                <p className="font-medium text-gray-800">
                  {isAuthenticated ? user?.username || 'User' : 'Guest'}
                </p>
                <p className="text-sm text-gray-500">
                  {isAuthenticated ? 'Đã đăng nhập' : 'Chưa đăng nhập'}
                </p>
              </div>
            </div>

            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await handleLogout();
                  closeMobileMenu();
                }}
                className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
              >
                <CiLogout className="text-lg" />
                Đăng xuất
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
              >
                <CiLogout className="text-lg" />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Header;
