import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Alert,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    FormControl,
    Select,
    MenuItem
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    VolumeUp as VolumeUpIcon,
    Add as AddIcon,
    NavigateBefore,
    NavigateNext,
} from '@mui/icons-material';
import { type Note, type Deck } from '../vocabulary';
import { type PaginatedResponse } from '../vocabularyApi';
import { notify } from '../../../utils/notify';

interface NotesTableProps {
    notes: Note[];
    selectedDeck: Deck | null;
    paginationData: PaginatedResponse<Note> | null;
    searchParams: URLSearchParams;
    onEdit: (note: Note) => void;
    onDelete: (note: Note) => void;
    onSort: (property: string) => void;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAddNote: () => void;
}

const NotesTable: React.FC<NotesTableProps> = ({
    notes,
    selectedDeck,
    paginationData,
    searchParams,
    onEdit,
    onDelete,
    onSort,
    onPageChange,
    onRowsPerPageChange,
    onAddNote
}) => {
    const handlePlayAudio = (audioUrl: string) => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play().catch(() => {
                notify('Không thể phát âm thanh', 'error');
            });
        }
    };

    const formatDueDate = (dueDate: string): string => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffMs = due.getTime() - now.getTime();
        const diffMinutes = Math.ceil(diffMs / (1000 * 60));

        if (diffMinutes < 0) {
            return 'Quá hạn';
        } else if (diffMinutes === 0) {
            return 'Bây giờ';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} phút`;
        } else if (diffMinutes < 1440) { // Less than 24 hours
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            return minutes > 0 ? `${hours}h ${minutes}p` : `${hours} giờ`;
        } else {
            const days = Math.floor(diffMinutes / 1440);
            return `${days} ngày`;
        }
    };

    const getDueDateColor = (dueDate: string): string => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffMs = due.getTime() - now.getTime();
        const diffMinutes = Math.ceil(diffMs / (1000 * 60));

        if (diffMinutes < 0) {
            return '#EF4444'; // Đỏ - quá hạn
        } else if (diffMinutes <= 5) {
            return '#F59E0B'; // Cam - sắp đến hạn (trong 5 phút)
        } else if (diffMinutes <= 60) {
            return '#10B981'; // Xanh lá - sắp đến hạn (trong 1 giờ)
        } else {
            return '#6B7280'; // Xám - còn nhiều thời gian
        }
    };

    if (!selectedDeck) {
        return null;
    }

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                        Thẻ trong Deck: {selectedDeck.name}
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={onAddNote}
                        sx={{ borderRadius: 2 }}
                    >
                        Thêm
                    </Button>
                </Box>

                {notes.length === 0 ? (
                    <Alert severity="info">
                        Chưa có note nào trong deck này. Hãy thêm note đầu tiên!
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
                                                onClick={() => onSort('word')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>Từ</span>
                                                    {searchParams.get('sortBy') === 'word' && (
                                                        searchParams.get('sortDir') === 'asc' ? '↑' : '↓'
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">Phiên âm</TableCell>
                                            <TableCell className="font-semibold">Nghĩa</TableCell>
                                            <TableCell className="font-semibold">Loại từ</TableCell>
                                            <TableCell className="font-semibold">Ví dụ</TableCell>
                                            <TableCell className="font-semibold">Hình ảnh</TableCell>
                                            <TableCell className="font-semibold">Thời gian học</TableCell>
                                            <TableCell className="font-semibold">Thao tác</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {notes.map((note) => {
                                            const wordField = note.fieldValues['word'] || Object.values(note.fieldValues)[0] || 'Untitled';
                                            const phoneticField = note.fieldValues['phonetic'] || note.fieldValues['phiên âm'] || '';
                                            const meaningField = note.fieldValues['meaning'] || note.fieldValues['nghĩa'] || '';
                                            const posField = note.fieldValues['pos'] || note.fieldValues['loại từ'] || '';
                                            const exampleField = note.fieldValues['example1'] || note.fieldValues['ví dụ'] || '';
                                            const audioField = note.fieldValues['audio'] || note.fieldValues['âm thanh'] || note.fieldValues['pronunciation'] || '';

                                            // Find image field - check common image field names
                                            const imageField = note.fieldValues['image'];

                                            return (
                                                <TableRow
                                                    key={note.id}
                                                >
                                                    <TableCell className="font-medium">
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <div className="font-semibold">{wordField}</div>
                                                            {audioField && (
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePlayAudio(audioField);
                                                                    }}
                                                                    sx={{
                                                                        p: 0.5,
                                                                        borderRadius: '8px',
                                                                        backgroundColor: '#F3F4F6',
                                                                        '&:hover': {
                                                                            backgroundColor: '#E5E7EB'
                                                                        }
                                                                    }}
                                                                >
                                                                    <VolumeUpIcon fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <div className="italic">
                                                            {phoneticField ? `${phoneticField}` : '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <div>{meaningField || '-'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {posField ? (
                                                            <Chip
                                                                label={posField}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#E0E7FF',
                                                                    color: '#3730A3',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #C7D2FE'
                                                                }}
                                                            />
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <div className="italic max-w-xs">
                                                            {exampleField ? `"${exampleField}"` : '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {imageField ? (
                                                            <Box
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    backgroundImage: `url(${imageField})`,
                                                                    backgroundSize: 'cover',
                                                                    backgroundPosition: 'center',
                                                                    backgroundRepeat: 'no-repeat',
                                                                    borderRadius: 1,
                                                                    cursor: 'pointer',
                                                                    border: '1px solid',
                                                                    borderColor: 'divider',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.1)',
                                                                        transition: 'transform 0.2s ease-in-out',
                                                                        boxShadow: 2
                                                                    }
                                                                }}
                                                                onClick={() => window.open(imageField, '_blank')}
                                                                title="Click to view full image"
                                                            />
                                                        ) : (
                                                            <Box
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    border: '1px dashed',
                                                                    borderColor: 'divider',
                                                                    borderRadius: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <Typography variant="caption" color="text.secondary">
                                                                    -
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {note.due ? (
                                                            <Chip
                                                                label={formatDueDate(note.due)}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: getDueDateColor(note.due),
                                                                    color: 'white',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                label="Chưa có"
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#9CA3AF',
                                                                    color: 'white',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box display="flex" gap={1} justifyContent="center">
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                startIcon={<EditIcon />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onEdit(note);
                                                                }}
                                                                sx={{
                                                                    fontSize: '0.75rem',
                                                                    borderRadius: '8px',
                                                                    textTransform: 'none',
                                                                    borderColor: '#7C3AED',
                                                                    color: '#7C3AED',
                                                                    '&:hover': {
                                                                        backgroundColor: '#F3F4F6',
                                                                        borderColor: '#6D28D9'
                                                                    }
                                                                }}
                                                            >
                                                                Sửa
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                startIcon={<DeleteIcon />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDelete(note);
                                                                }}
                                                                sx={{
                                                                    fontSize: '0.75rem',
                                                                    borderRadius: '8px',
                                                                    textTransform: 'none',
                                                                    '&:hover': {
                                                                        backgroundColor: '#FEF2F2'
                                                                    }
                                                                }}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
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
                                                    onChange={(e) => onRowsPerPageChange(e as any)}
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
                                                onClick={() => onPageChange(null, parseInt(searchParams.get('page') || '0') - 1)}
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
                                                            onClick={() => onPageChange(null, pageNum - 1)}
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
                                                            onClick={() => onPageChange(null, paginationData.totalPages - 1)}
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
                                                onClick={() => onPageChange(null, parseInt(searchParams.get('page') || '0') + 1)}
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
    );
};

export default NotesTable;
