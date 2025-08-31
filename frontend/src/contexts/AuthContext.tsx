import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api } from '../configs/API';
import CreatePasswordModal from '../components/CreatePasswordModal';

interface User {
    id: string;
    username: string;
    urlAvatar: string;
    noPassword: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    showCreatePasswordModal: boolean;
    login: (token: string, refreshToken: string, userData: User) => void;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    closeCreatePasswordModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreatePasswordModal, setShowCreatePasswordModal] = useState(false);

    // Check authentication status on app load
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = Cookies.get('auth_token');
            const refreshToken = Cookies.get('refresh_token');

            if (!token) {
                setIsLoading(false);
                return;
            }

            // First, try to verify the current token
            try {
                const tokenResponse = await api.post('/auth/introspect', {
                    token: token
                });

                if (tokenResponse.data?.result?.valid) {
                    // Token is valid, get user info if not already loaded
                    if (!user) {
                        await fetchUserInfo(token);
                    }
                    setIsAuthenticated(true);
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    return;
                }
            } catch (error) {
                console.log('Token validation failed, trying refresh...');
            }

            // Token is invalid, try to refresh
            if (refreshToken) {
                try {
                    const refreshResponse = await api.post('/auth/refresh', {
                        body: { token: refreshToken }
                    });

                    const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.result;

                    if (accessToken) {
                        // Update cookies with new tokens
                        Cookies.set('auth_token', accessToken, {
                            expires: 7,
                            secure: true,
                            sameSite: 'strict',
                            path: '/',
                        });

                        Cookies.set('refresh_token', newRefreshToken, {
                            expires: 7,
                            secure: true,
                            sameSite: 'strict',
                            path: '/',
                        });

                        // Fetch user info with new token
                        await fetchUserInfo(accessToken);
                        setIsAuthenticated(true);
                        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                        return;
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                }
            }

            // Both token validation and refresh failed, clear everything
            clearAuthData();

        } catch (error) {
            console.error('Auth check failed:', error);
            clearAuthData();
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserInfo = async (token: string) => {
        try {
            const response = await api.get('/users/my-info', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data?.code === 1000) {
                const userData = {
                    id: response.data.result.id,
                    username: response.data.result.username,
                    urlAvatar: response.data.result.urlAvatar,
                    noPassword: response.data.result.noPassword,
                };
                setUser(userData);

                // Check if user needs to create password
                if (userData.noPassword) {
                    setShowCreatePasswordModal(true);
                }
            }
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            throw error;
        }
    };

    const clearAuthData = () => {
        Cookies.remove('auth_token');
        Cookies.remove('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
        delete api.defaults.headers.common['Authorization'];
    };

    const login = (token: string, refreshToken: string, userData: User) => {
        // Set tokens in cookies
        Cookies.set('auth_token', token, {
            expires: 7,
            secure: true,
            sameSite: 'strict',
            path: '/',
        });

        Cookies.set('refresh_token', refreshToken, {
            expires: 7,
            secure: true,
            sameSite: 'strict',
            path: '/',
        });

        // Set user data and authentication status
        setUser(userData);
        setIsAuthenticated(true);

        // Check if user needs to create password
        if (userData.noPassword) {
            setShowCreatePasswordModal(true);
        }

        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = async () => {
        try {
            // Call logout API to invalidate token on server
            const refreshToken = Cookies.get('refresh_token');
            if (refreshToken) {
                await api.post('/auth/logout', {
                    token: refreshToken
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with logout even if API call fails
        } finally {
            clearAuthData();
        }
    };

    const closeCreatePasswordModal = () => {
        setShowCreatePasswordModal(false);
    };

    const handlePasswordCreated = () => {
        // Update user data to reflect that password has been created
        if (user) {
            setUser({
                ...user,
                noPassword: false
            });
        }
        setShowCreatePasswordModal(false);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        showCreatePasswordModal,
        login,
        logout,
        checkAuth,
        closeCreatePasswordModal,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            <CreatePasswordModal
                isOpen={showCreatePasswordModal}
                onClose={closeCreatePasswordModal}
                onSuccess={handlePasswordCreated}
            />
        </AuthContext.Provider>
    );
};
