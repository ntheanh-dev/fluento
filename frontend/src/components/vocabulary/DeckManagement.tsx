import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Paper,
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
import { vocabularyDeckApi, type PaginatedResponse, type PaginationParams } from './vocabularyApi';
import { notify } from '../../utils/notify';

const DeckManagement: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
    const [formData, setFormData] = useState<CreateDeckRequest>({
        name: '',
    });

    // Pagination state - initialize from URL params
    const [paginationData, setPaginationData] = useState<PaginatedResponse<Deck> | null>(null);
    const page = parseInt(searchParams.get('page') || '0');
    const rowsPerPage = parseInt(searchParams.get('size') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc';

    useEffect(() => {
        loadDecks();
    }, [searchParams]);

    const loadDecks = async () => {
        try {
            setLoading(true);
            const params: PaginationParams = {
                page: page,
                size: rowsPerPage,
                sortBy: sortBy,
                sortDir: sortDir
            };
            const paginatedData = await vocabularyDeckApi.getUserDecksPaginated(params);
            setPaginationData(paginatedData);
            setDecks(paginatedData.content);
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

    // Pagination handlers
    const handleChangePage = async (_event: unknown, newPage: number) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('page', newPage.toString());
        setSearchParams(newSearchParams);
    };

    const handleChangeRowsPerPage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.target.value, 10);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('size', newSize.toString());
        newSearchParams.set('page', '0'); // Reset to first page
        setSearchParams(newSearchParams);
    };

    const handleSort = async (property: string) => {
        const isAsc = sortBy === property && sortDir === 'asc';
        const newSortDir = isAsc ? 'desc' : 'asc';
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('sortBy', property);
        newSearchParams.set('sortDir', newSortDir);
        newSearchParams.set('page', '0'); // Reset to first page
        setSearchParams(newSearchParams);
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
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'name'}
                                        direction={sortBy === 'name' ? sortDir : 'asc'}
                                        onClick={() => handleSort('name')}
                                    >
                                        Tên Deck
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'noteCount'}
                                        direction={sortBy === 'noteCount' ? sortDir : 'asc'}
                                        onClick={() => handleSort('noteCount')}
                                    >
                                        Số Notes
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'cardCount'}
                                        direction={sortBy === 'cardCount' ? sortDir : 'asc'}
                                        onClick={() => handleSort('cardCount')}
                                    >
                                        Số Cards
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'createdAt'}
                                        direction={sortBy === 'createdAt' ? sortDir : 'asc'}
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        Ngày tạo
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {decks.map((deck) => (
                                <TableRow
                                    key={deck.id}
                                    hover
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        },
                                    }}
                                    onClick={() => handleDeckClick(deck)}
                                >
                                    <TableCell>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            {deck.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<SchoolIcon />}
                                            label={deck.noteCount}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<LibraryBooksIcon />}
                                            label={deck.cardCount}
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(deck.createdAt).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" gap={1} alignItems="center">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                startIcon={<SchoolIcon />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/vocabulary/study-mode/decks/${deck.id}`);
                                                }}
                                            >
                                                Học
                                            </Button>
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {paginationData && (
                        <TablePagination
                            component="div"
                            count={paginationData.totalElements}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            labelRowsPerPage="Số dòng mỗi trang:"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
                            }
                        />
                    )}
                </TableContainer>
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
