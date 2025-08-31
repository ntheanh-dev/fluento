import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface RequiredAuthProps {
    children: React.ReactNode;
}

const RequiredAuth: React.FC<RequiredAuthProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <Box className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <CircularProgress size={60} className="mb-4" />
                <Typography variant="h6" className="text-gray-600">
                    Đang kiểm tra xác thực...
                </Typography>
            </Box>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Render children if authenticated
    return <>{children}</>;
};

export default RequiredAuth;
