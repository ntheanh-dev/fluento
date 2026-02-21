import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

interface RequiredAuthProps {
    children: React.ReactNode;
}

const RequiredAuth: React.FC<RequiredAuthProps> = ({ children }) => {
    const location = useLocation();
    const accessToken = Cookies.get('accessToken');
    const isAuthenticated = !!accessToken;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default RequiredAuth;
