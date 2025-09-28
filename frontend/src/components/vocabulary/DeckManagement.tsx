import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
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
    Paper,
    Alert,
    FormControl,
    Select,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Widgets as WidgetsIcon,
    School as SchoolIcon,
    Home as HomeIcon,
    NavigateNext as NavigateNextIcon,
    Visibility as VisibilityIcon,
    NavigateBefore,
    NavigateNext,
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
        } catch (error: any) {
            if (error?.response?.data?.code === 2001) {
                notify('Tên deck đã tồn tại', 'warning');
            } else {
                notify('Lỗi khi lưu deck', 'error');
            }
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
    };


    const handleDeckClick = (deck: Deck) => {
        navigate(`/vocabulary/study-mode/decks/${deck.id}`);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, deck: Deck) => {
        setAnchorEl(event.currentTarget);
        setSelectedDeck(deck);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedDeck(null);
    };

    const handleDetails = (deck: Deck) => {
        navigate(`/vocabulary/decks/${deck.id}`);
        handleMenuClose();
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
                    <WidgetsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Quản lý Decks
                </Typography>
            </Breadcrumbs>

            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6">
                            Các decks của bạn
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ borderRadius: 2 }}
                        >
                            Thêm
                        </Button>
                    </Box>

                    {decks.length === 0 ? (
                        <Alert severity="info">
                            Chưa có deck nào. Hãy tạo deck đầu tiên!
                        </Alert>
                    ) : (
                        <Box>
                            <Paper
                                className="rounded-2xl shadow-lg overflow-hidden"
                                sx={{
                                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
                                    border: '1px solid #E2E8F0'
                                }}
                            >
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                                                <TableCell
                                                    className="font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => handleSort('name')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>Tên Deck</span>
                                                        {sortBy === 'name' && (
                                                            sortDir === 'asc' ? '↑' : '↓'
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        <span>Số Notes</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    className="font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => handleSort('createdAt')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>Ngày tạo</span>
                                                        {sortBy === 'createdAt' && (
                                                            sortDir === 'asc' ? '↑' : '↓'
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold">Hành động</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {decks.map((deck) => (
                                                <TableRow
                                                    key={deck.id}
                                                    onClick={() => handleDeckClick(deck)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            backgroundColor: '#F1F5F9',
                                                            transform: 'scale(1.01)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                        },
                                                        borderBottom: '1px solid #E5E7EB',
                                                        transition: 'all 0.2s ease',
                                                        '&:active': {
                                                            transform: 'scale(0.99)',
                                                            backgroundColor: '#E2E8F0'
                                                        }
                                                    }}
                                                >
                                                    <TableCell className="font-medium">
                                                        <div className="font-semibold">{deck.name}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span>{deck.noteCount}</span>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <div>{new Date(deck.createdAt).toLocaleDateString('vi-VN')}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMenuOpen(e, deck);
                                                            }}
                                                            sx={{
                                                                borderRadius: '8px',
                                                                backgroundColor: '#F3F4F6',
                                                                '&:hover': {
                                                                    backgroundColor: '#E5E7EB'
                                                                }
                                                            }}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Bottom Control Bar */}
                                {paginationData && (
                                    <Box className="p-4 border-t border-gray-200 bg-white">
                                        <div className="flex items-center justify-between">
                                            {/* Rows per page selector */}
                                            <div className="flex items-center gap-3">
                                                <Typography variant="body2" className="text-gray-600">
                                                    Số dòng hiển thị:
                                                </Typography>
                                                <FormControl size="small" sx={{ minWidth: 80 }}>
                                                    <Select
                                                        value={parseInt(searchParams.get('size') || '10')}
                                                        onChange={(e) => handleChangeRowsPerPage(e as any)}
                                                        sx={{
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#D1D5DB',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#7C3AED',
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#7C3AED',
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem value={5}>5</MenuItem>
                                                        <MenuItem value={10}>10</MenuItem>
                                                        <MenuItem value={25}>25</MenuItem>
                                                        <MenuItem value={50}>50</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <Typography variant="body2" className="text-gray-600">
                                                    {`${parseInt(searchParams.get('page') || '0') * parseInt(searchParams.get('size') || '10') + 1}-${Math.min((parseInt(searchParams.get('page') || '0') + 1) * parseInt(searchParams.get('size') || '10'), paginationData.totalElements)} of ${paginationData.totalElements}`}
                                                </Typography>
                                            </div>

                                            {/* Pagination */}
                                            <div className="flex items-center gap-6">
                                                <Button
                                                    variant="outlined"
                                                    disabled={parseInt(searchParams.get('page') || '0') === 0}
                                                    startIcon={<NavigateBefore />}
                                                    onClick={() => handleChangePage(null, parseInt(searchParams.get('page') || '0') - 1)}
                                                    sx={{
                                                        borderRadius: '8px',
                                                        textTransform: 'none',
                                                        borderColor: parseInt(searchParams.get('page') || '0') === 0 ? '#D1D5DB' : '#7C3AED',
                                                        color: parseInt(searchParams.get('page') || '0') === 0 ? '#9CA3AF' : '#7C3AED'
                                                    }}
                                                >
                                                    Trang trước
                                                </Button>

                                                {/* Page Numbers */}
                                                <div className="flex gap-3">
                                                    {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                                                        const pageNum = i + 1;
                                                        const currentPage = parseInt(searchParams.get('page') || '0') + 1;
                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={pageNum === currentPage ? 'contained' : 'text'}
                                                                onClick={() => handleChangePage(null, pageNum - 1)}
                                                                sx={{
                                                                    minWidth: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '8px',
                                                                    textTransform: 'none',
                                                                    fontWeight: 600,
                                                                    ...(pageNum === currentPage && {
                                                                        backgroundColor: '#7C3AED',
                                                                        '&:hover': { backgroundColor: '#6D28D9' }
                                                                    })
                                                                }}
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        );
                                                    })}
                                                    {paginationData.totalPages > 5 && (
                                                        <>
                                                            {paginationData.totalPages > 6 && <span className="px-2">...</span>}
                                                            <Button
                                                                variant="text"
                                                                onClick={() => handleChangePage(null, paginationData.totalPages - 1)}
                                                                sx={{
                                                                    minWidth: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '8px',
                                                                    textTransform: 'none',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {paginationData.totalPages}
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>

                                                <Button
                                                    variant="outlined"
                                                    disabled={parseInt(searchParams.get('page') || '0') === paginationData.totalPages - 1}
                                                    endIcon={<NavigateNext />}
                                                    onClick={() => handleChangePage(null, parseInt(searchParams.get('page') || '0') + 1)}
                                                    sx={{
                                                        borderRadius: '8px',
                                                        textTransform: 'none',
                                                        borderColor: parseInt(searchParams.get('page') || '0') === paginationData.totalPages - 1 ? '#D1D5DB' : '#7C3AED',
                                                        color: parseInt(searchParams.get('page') || '0') === paginationData.totalPages - 1 ? '#9CA3AF' : '#7C3AED'
                                                    }}
                                                >
                                                    Trang sau
                                                </Button>
                                            </div>
                                        </div>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    )}

                </CardContent>
            </Card>


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

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleDetails(selectedDeck!)}>
                    <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                    Chi tiết
                </MenuItem>
                <MenuItem onClick={() => {
                    handleOpenDialog(selectedDeck!);
                    handleMenuClose();
                }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Sửa
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
