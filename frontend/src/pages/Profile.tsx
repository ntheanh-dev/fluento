import React, { useState } from 'react';
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
} from '@mui/material';
import { Visibility, VisibilityOff, Save } from '@mui/icons-material';
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

const Profile: React.FC = () => {
    const { user, setUser } = useAuth();
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
