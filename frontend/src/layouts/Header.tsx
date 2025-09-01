import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { CiLogout } from "react-icons/ci";
import Container from "@mui/material/Container";
import logo from "../assets/image/logo3.png";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  { label: "Trang chủ", path: "/" },
  { label: "Luyện viết", path: "/writing" },
  { label: "Luyện từ vựng", path: "/vocabulary-practice" },
  { label: "Thống kê học tập", path: "/analytic" },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const menuRefs = useRef<(HTMLAnchorElement | null)[]>([]);

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

        {/* Avatar */}
        <Box className="flex items-center gap-3">
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
  );
};

export default Header;
