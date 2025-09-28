import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    TextField,
    Button,
    Avatar,
    Container,
    Alert,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import { Visibility, VisibilityOff, Save, Add, ContentCopy, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../configs/API';
import { notify } from '../utils/notify';

interface User {
    id: string;
    username: string;
    urlAvatar: string;
    noPassword: boolean;
    createdAt?: string;
}

interface ApiKey {
    id: number;
    apiKey: string;
    createdAt: string;
}

const Profile: React.FC = () => {
    const { user, setUser, refreshUserData } = useAuth();
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [changePasswordData, setChangePasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [showCreatePasswordForm, setShowCreatePasswordForm] = useState(false);
    const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
    const [error, setError] = useState<string>('');

    // API Key states
    const [userApiKey, setUserApiKey] = useState<ApiKey | null>(null);
    const [newApiKey, setNewApiKey] = useState('');
    const [isLoadingApiKey, setIsLoadingApiKey] = useState(false);
    const [isCreatingApiKey, setIsCreatingApiKey] = useState(false);
    const [isUpdatingApiKey, setIsUpdatingApiKey] = useState(false);
    const [isDeletingApiKey, setIsDeletingApiKey] = useState(false);
    const [showCreateApiKeyForm, setShowCreateApiKeyForm] = useState(false);
    const [apiKeyError, setApiKeyError] = useState<string>('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Load API key when user data changes
    useEffect(() => {
        loadApiKey();
    }, [user]);

    const loadApiKey = () => {
        setIsLoadingApiKey(true);
        try {
            if (user?.apiKey) {
                setUserApiKey({
                    id: parseInt(user.id),
                    apiKey: user.apiKey,
                    createdAt: user.createdAt || new Date().toISOString()
                });
            } else {
                setUserApiKey(null);
            }
        } catch (error) {
            console.error('Error loading API key from auth context:', error);
            setUserApiKey(null);
        } finally {
            setIsLoadingApiKey(false);
        }
    };

    const handleCreateApiKey = async () => {
        if (!newApiKey.trim()) {
            setApiKeyError('API key không được để trống');
            return;
        }

        setIsCreatingApiKey(true);
        setApiKeyError('');

        try {
            const response = await api.post('/users/api-key', {
                apiKey: newApiKey.trim(),
            });

            if (response.data?.code === 1000) {
                setNewApiKey('');
                setShowCreateApiKeyForm(false);
                notify('Thêm Gemini API key thành công!', 'success');
                // Refresh user data from auth context
                await refreshUserData();
            } else {
                setApiKeyError('Có lỗi xảy ra khi tạo API key');
            }
        } catch (error: any) {
            console.error('Create API key error:', error);
            if (error.response?.data?.message) {
                setApiKeyError(error.response.data.message);
            } else {
                setApiKeyError('Có lỗi xảy ra khi tạo API key');
            }
        } finally {
            setIsCreatingApiKey(false);
        }
    };

    const handleUpdateApiKey = async () => {
        if (!newApiKey.trim()) {
            setApiKeyError('API key không được để trống');
            return;
        }

        setIsUpdatingApiKey(true);
        setApiKeyError('');

        try {
            const response = await api.put('/users/api-key', {
                apiKey: newApiKey.trim(),
            });

            if (response.data?.code === 1000) {
                setNewApiKey('');
                setShowCreateApiKeyForm(false);
                notify('Cập nhật Gemini API key thành công!', 'success');
                // Refresh user data from auth context
                await refreshUserData();
            } else {
                setApiKeyError('Có lỗi xảy ra khi cập nhật API key');
            }
        } catch (error: any) {
            console.error('Update API key error:', error);
            if (error.response?.data?.message) {
                setApiKeyError(error.response.data.message);
            } else {
                setApiKeyError('Có lỗi xảy ra khi cập nhật API key');
            }
        } finally {
            setIsUpdatingApiKey(false);
        }
    };

    const handleDeleteApiKey = async () => {
        setIsDeletingApiKey(true);
        try {
            const response = await api.delete('/users/api-key');
            if (response.data?.code === 1000) {
                setShowDeleteConfirm(false);
                notify('Xóa Gemini API key thành công!', 'success');
                // Refresh user data from auth context
                await refreshUserData();
            } else {
                notify('Có lỗi xảy ra khi xóa API key', 'error');
            }
        } catch (error: any) {
            console.error('Delete API key error:', error);
            notify('Có lỗi xảy ra khi xóa API key', 'error');
        } finally {
            setIsDeletingApiKey(false);
        }
    };

    const handleCopyApiKey = (apiKey: string) => {
        navigator.clipboard.writeText(apiKey);
        notify('Đã sao chép Gemini API key!', 'success');
    };

    const handlePasswordChange = (field: 'password' | 'confirmPassword') => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: event.target.value,
        }));
        setError('');
    };

    const handleChangePasswordChange = (field: 'currentPassword' | 'newPassword' | 'confirmNewPassword') => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setChangePasswordData(prev => ({
            ...prev,
            [field]: event.target.value,
        }));
        setError('');
    };

    const handleUpdatePassword = async () => {
        if (!passwordData.password.trim()) {
            setError('Mật khẩu không được để trống');
            return;
        }

        if (passwordData.password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        if (passwordData.password !== passwordData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsUpdatingPassword(true);
        setError('');

        try {
            const response = await api.post('/users/create-password', {
                password: passwordData.password.trim(),
            });

            if (response.data?.code === 1000) {
                // Update user context to reflect password has been created
                const updatedUser = {
                    ...user,
                    noPassword: false,
                } as User;
                setUser(updatedUser);

                setPasswordData({ password: '', confirmPassword: '' });
                setShowCreatePasswordForm(false);
                notify('Tạo mật khẩu thành công!', 'success');
            } else {
                setError('Có lỗi xảy ra khi tạo mật khẩu');
            }
        } catch (error: any) {
            console.error('Password creation error:', error);
            if (error.response?.data?.code === 1014) {
                setError('Mật khẩu đã được tạo trước đó');
            } else {
                setError('Có lỗi xảy ra khi tạo mật khẩu');
            }
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleChangePassword = async () => {
        if (!changePasswordData.currentPassword.trim()) {
            setError('Mật khẩu hiện tại không được để trống');
            return;
        }

        if (!changePasswordData.newPassword.trim()) {
            setError('Mật khẩu mới không được để trống');
            return;
        }

        if (changePasswordData.newPassword.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự');
            return;
        }

        if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsChangingPassword(true);
        setError('');

        try {
            const response = await api.put('/users/change-password', {
                currentPassword: changePasswordData.currentPassword.trim(),
                newPassword: changePasswordData.newPassword.trim(),
            });

            if (response.data?.code === 1000) {
                setChangePasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                setShowChangePasswordForm(false);
                notify('Thay đổi mật khẩu thành công!', 'success');
            } else {
                setError('Có lỗi xảy ra khi thay đổi mật khẩu');
            }
        } catch (error: any) {
            console.error('Change password error:', error);
            if (error.response?.data?.code === 1009) {
                setError('Mật khẩu hiện tại không đúng');
            } else {
                setError('Có lỗi xảy ra khi thay đổi mật khẩu');
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const toggleCurrentPasswordVisibility = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmNewPasswordVisibility = () => {
        setShowConfirmNewPassword(!showConfirmNewPassword);
    };

    const toggleCreatePasswordForm = () => {
        setShowCreatePasswordForm(!showCreatePasswordForm);
        setError('');
        setPasswordData({ password: '', confirmPassword: '' });
    };

    const toggleChangePasswordForm = () => {
        setShowChangePasswordForm(!showChangePasswordForm);
        setError('');
        setChangePasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Profile Banner */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    mb: 3,
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Banner Background */}
                <Box sx={{
                    height: 200,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'relative'
                }}>
                    {/* Geometric shapes overlay */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
              linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent 70%),
              linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.05) 70%, transparent 70%)
            `,
                        backgroundSize: '20px 20px'
                    }} />
                </Box>

                {/* Profile Picture */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <Avatar
                        src={user?.urlAvatar}
                        sx={{
                            width: 120,
                            height: 120,
                            border: '4px solid white',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        }}
                    >
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                </Box>
            </Card>

            {/* User Info */}
            <Box sx={{ mt: 7, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {user?.username || 'Chưa có username'}
                </Typography>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 3,
                    flexWrap: 'wrap',
                    mt: 3
                }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Trạng thái mật khẩu
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 'medium',
                                color: user?.noPassword ? 'warning.main' : 'success.main'
                            }}
                        >
                            {user?.noPassword ? 'Chưa tạo mật khẩu' : 'Đã tạo mật khẩu'}
                        </Typography>
                    </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    {user?.noPassword ? (
                        <Button
                            variant="contained"
                            onClick={toggleCreatePasswordForm}
                            sx={{ px: 3 }}
                        >
                            Tạo mật khẩu
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            onClick={toggleChangePasswordForm}
                            sx={{ px: 3 }}
                        >
                            Thay đổi mật khẩu
                        </Button>
                    )}
                </Box>
            </Box>

            {/* API Key Management Section */}
            <Card sx={{ mt: 4, p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Gemini API Key
                    </Typography>
                    {!userApiKey && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setShowCreateApiKeyForm(true)}
                                sx={{ px: 3 }}
                            >
                                Thêm Gemini API Key
                            </Button>
                        </Box>
                    )}
                </Box>

                {isLoadingApiKey ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (userApiKey && (
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Key</strong></TableCell>
                                    <TableCell><strong>Ngày thêm</strong></TableCell>
                                    <TableCell align="center"><strong>Thao tác</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    backgroundColor: 'grey.100',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    maxWidth: 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {userApiKey.apiKey}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCopyApiKey(userApiKey.apiKey)}
                                                title="Sao chép API key"
                                            >
                                                <ContentCopy fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(userApiKey.createdAt).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    setNewApiKey(userApiKey.apiKey);
                                                    setShowCreateApiKeyForm(true);
                                                }}
                                            >
                                                Cập nhật
                                            </Button>
                                            <IconButton
                                                color="error"
                                                onClick={() => setShowDeleteConfirm(true)}
                                                disabled={isDeletingApiKey}
                                                title="Xóa API key"
                                            >
                                                {isDeletingApiKey ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <Delete />
                                                )}
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                ))}
            </Card>

            {/* Create/Update API Key Modal */}
            <Dialog
                open={showCreateApiKeyForm}
                onClose={() => {
                    setShowCreateApiKeyForm(false);
                    setNewApiKey('');
                    setApiKeyError('');
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {userApiKey ? 'Cập nhật Gemini API Key' : 'Thêm Gemini API Key'}
                    </Typography>

                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {apiKeyError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {apiKeyError}
                        </Alert>
                    )}

                    {/* Hướng dẫn lấy API key */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                            📋 Hướng dẫn lấy Key
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                1. Truy cập Google AI Studio:
                            </Typography>
                            <Box sx={{
                                p: 2,
                                backgroundColor: 'grey.50',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.200'
                            }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        color: 'primary.main',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        '&:hover': {
                                            color: 'primary.dark'
                                        }
                                    }}
                                    onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
                                >
                                    https://aistudio.google.com/app/apikey
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                2. Đăng nhập bằng tài khoản Google của bạn
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                3. Nhấn "Create API Key" để tạo key mới
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                4. Copy API key (bắt đầu với "AIza...")
                            </Typography>
                        </Box>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Lưu ý:</strong> API key miễn phí có giới hạn 15 requests/phút và 1M tokens/tháng.
                                Để tăng giới hạn, bạn có thể nâng cấp tài khoản Google Cloud.
                            </Typography>
                        </Alert>
                    </Box>

                    <TextField
                        fullWidth
                        label="API Key"
                        value={newApiKey}
                        onChange={(e) => {
                            setNewApiKey(e.target.value);
                            setApiKeyError('');
                        }}
                        variant="outlined"
                        placeholder="Nhập Gemini API key của bạn"
                        multiline
                        rows={1}
                        sx={{
                            marginTop: 2,
                            '& .MuiInputBase-input': {
                                fontFamily: 'monospace',
                                fontSize: '0.875rem'
                            }
                        }}
                    />

                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setShowCreateApiKeyForm(false);
                            setNewApiKey('');
                            setApiKeyError('');
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={(isCreatingApiKey || isUpdatingApiKey) ? <CircularProgress size={20} /> : <Add />}
                        onClick={userApiKey ? handleUpdateApiKey : handleCreateApiKey}
                        disabled={(isCreatingApiKey || isUpdatingApiKey) || !newApiKey.trim()}
                    >
                        {(isCreatingApiKey || isUpdatingApiKey)
                            ? (userApiKey ? 'Đang cập nhật...' : 'Đang thêm...')
                            : (userApiKey ? 'Cập nhật Gemini API Key' : 'Thêm Gemini API Key')
                        }
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Xác nhận xóa Gemini API Key
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Bạn có chắc chắn muốn xóa key này không?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeletingApiKey}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteApiKey}
                        disabled={isDeletingApiKey}
                        startIcon={isDeletingApiKey ? <CircularProgress size={20} /> : undefined}
                    >
                        {isDeletingApiKey ? 'Đang xóa...' : 'Xóa Gemini API Key'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Password Creation Modal */}
            <Dialog
                open={!!(user?.noPassword && showCreatePasswordForm)}
                onClose={toggleCreatePasswordForm}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Tạo mật khẩu
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Bạn đã đăng nhập bằng Google. Hãy tạo mật khẩu để có thể đăng nhập bằng tài khoản này.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Mật khẩu mới"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.password}
                            onChange={handlePasswordChange('password')}
                            variant="outlined"
                            helperText="Mật khẩu phải có ít nhất 8 ký tự"
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={togglePasswordVisibility}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Xác nhận mật khẩu"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange('confirmPassword')}
                            variant="outlined"
                            helperText="Nhập lại mật khẩu để xác nhận"
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={toggleConfirmPasswordVisibility}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                ),
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={toggleCreatePasswordForm}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={isUpdatingPassword ? <CircularProgress size={20} /> : <Save />}
                        onClick={handleUpdatePassword}
                        disabled={isUpdatingPassword || !passwordData.password || !passwordData.confirmPassword}
                    >
                        {isUpdatingPassword ? 'Đang tạo...' : 'Tạo mật khẩu'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Change Password Modal */}
            <Dialog
                open={!!(!user?.noPassword && showChangePasswordForm)}
                onClose={toggleChangePasswordForm}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Thay đổi mật khẩu
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Thay đổi mật khẩu hiện tại của bạn để bảo mật tài khoản tốt hơn.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Mật khẩu hiện tại"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={changePasswordData.currentPassword}
                            onChange={handleChangePasswordChange('currentPassword')}
                            variant="outlined"
                            helperText="Nhập mật khẩu hiện tại của bạn"
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={toggleCurrentPasswordVisibility}
                                        edge="end"
                                    >
                                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Mật khẩu mới"
                            type={showNewPassword ? 'text' : 'password'}
                            value={changePasswordData.newPassword}
                            onChange={handleChangePasswordChange('newPassword')}
                            variant="outlined"
                            helperText="Mật khẩu mới phải có ít nhất 8 ký tự"
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={toggleNewPasswordVisibility}
                                        edge="end"
                                    >
                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Xác nhận mật khẩu mới"
                            type={showConfirmNewPassword ? 'text' : 'password'}
                            value={changePasswordData.confirmNewPassword}
                            onChange={handleChangePasswordChange('confirmNewPassword')}
                            variant="outlined"
                            helperText="Nhập lại mật khẩu mới để xác nhận"
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={toggleConfirmNewPasswordVisibility}
                                        edge="end"
                                    >
                                        {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                ),
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={toggleChangePasswordForm}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={isChangingPassword ? <CircularProgress size={20} /> : <Save />}
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.confirmNewPassword}
                    >
                        {isChangingPassword ? 'Đang thay đổi...' : 'Thay đổi mật khẩu'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Profile;
