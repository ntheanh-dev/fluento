import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Menu,
    MenuItem,
    CircularProgress,
    Breadcrumbs,
    Link,
    Container,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
    LibraryBooks as LibraryBooksIcon,
    Visibility as VisibilityIcon,
    Home as HomeIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { type Deck, type CreateDeckRequest } from './vocabulary';
import { vocabularyDeckApi } from './vocabularyApi';
import { notify } from '../../utils/notify';

const DeckManagement: React.FC = () => {
    const navigate = useNavigate();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
    const [formData, setFormData] = useState<CreateDeckRequest>({
        name: '',
    });

    useEffect(() => {
        loadDecks();
    }, []);

    const loadDecks = async () => {
        try {
            setLoading(true);
            const userDecks = await vocabularyDeckApi.getUserDecks();
            setDecks(userDecks);
        } catch (error) {
            notify('Lỗi khi tải danh sách deck', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (deck?: Deck) => {
        if (deck) {
            setEditingDeck(deck);
            setFormData({
                name: deck.name,
            });
        } else {
            setEditingDeck(null);
            setFormData({
                name: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingDeck(null);
        setFormData({
            name: '',
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingDeck) {
                await vocabularyDeckApi.updateDeck(editingDeck.id, formData);
                notify('Cập nhật deck thành công', 'success');
            } else {
                await vocabularyDeckApi.createDeck(formData);
                notify('Tạo deck thành công', 'success');
            }
            handleCloseDialog();
            loadDecks();
        } catch (error) {
            notify('Lỗi khi lưu deck', 'error');
        }
    };

    const handleDelete = async (deck: Deck) => {
        if (window.confirm(`Bạn có chắc muốn xóa deck "${deck.name}"?`)) {
            try {
                await vocabularyDeckApi.deleteDeck(deck.id);
                notify('Xóa deck thành công', 'success');
                loadDecks();
            } catch (error) {
                notify('Lỗi khi xóa deck', 'error');
            }
        }
        setAnchorEl(null);
        setSelectedDeck(null);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, deck: Deck) => {
        setAnchorEl(event.currentTarget);
        setSelectedDeck(deck);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedDeck(null);
    };

    const handleDeckClick = (deck: Deck) => {
        navigate(`/vocabulary/decks/${deck.id}`);
    };


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumb */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 2 }}
            >
                <Link
                    href="/"
                    color="inherit"
                    sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Trang chủ
                </Link>
                <Link
                    href="/vocabulary"
                    color="inherit"
                    sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                    <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Luyện từ vựng
                </Link>
                <Typography
                    color="text.primary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Quản lý Decks
                </Typography>
            </Breadcrumbs>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Quản lý Decks
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: 2 }}
                >
                    Tạo Deck Mới
                </Button>
            </Box>

            {decks.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <LibraryBooksIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Chưa có deck nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Tạo deck đầu tiên để bắt đầu học với flashcard
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            Tạo Deck Đầu Tiên
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {decks.map((deck) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={deck.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    },
                                }}
                                onClick={() => handleDeckClick(deck)}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="h6" component="h2" noWrap>
                                                {deck.name}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMenuOpen(e, deck);
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>


                                    <Box display="flex" gap={1} mb={2}>
                                        <Chip
                                            icon={<SchoolIcon />}
                                            label={`${deck.noteCount} notes`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                        <Chip
                                            icon={<LibraryBooksIcon />}
                                            label={`${deck.cardCount} cards`}
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(deck.createdAt).toLocaleDateString('vi-VN')}
                                        </Typography>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<SchoolIcon />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/vocabulary/study-mode/decks/${deck.id}`);
                                            }}
                                            sx={{ ml: 1 }}
                                        >
                                            Học
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingDeck ? 'Chỉnh sửa Deck' : 'Tạo Deck Mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Tên deck"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingDeck ? 'Cập nhật' : 'Tạo'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    handleDeckClick(selectedDeck!);
                    handleMenuClose();
                }}>
                    <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                    Xem Notes
                </MenuItem>
                <MenuItem onClick={() => {
                    navigate(`/vocabulary/study-mode/decks/${selectedDeck!.id}`);
                    handleMenuClose();
                }}>
                    <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                    Học
                </MenuItem>
                <MenuItem onClick={() => {
                    handleOpenDialog(selectedDeck!);
                    handleMenuClose();
                }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Chỉnh sửa
                </MenuItem>
                <MenuItem onClick={() => handleDelete(selectedDeck!)}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Xóa
                </MenuItem>
            </Menu>
        </Container>

    );
};

export default DeckManagement;
