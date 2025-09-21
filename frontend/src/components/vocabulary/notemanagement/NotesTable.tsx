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
    TablePagination,
    TableSortLabel,
    Button,
    Chip,
    IconButton
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    VolumeUp as VolumeUpIcon,
    Add as AddIcon,
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

    if (!selectedDeck) {
        return null;
    }

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Notes trong "{selectedDeck.name}"
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAddNote}
                        size="small"
                    >
                        Thêm Note
                    </Button>
                </Box>

                {notes.length === 0 ? (
                    <Alert severity="info">
                        Chưa có note nào trong deck này. Hãy thêm note đầu tiên!
                    </Alert>
                ) : (
                    <Box>
                        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <TableSortLabel
                                                active={searchParams.get('sortBy') === 'word'}
                                                direction={searchParams.get('sortBy') === 'word' ? (searchParams.get('sortDir') as 'asc' | 'desc') : 'asc'}
                                                onClick={() => onSort('word')}
                                            >
                                                Từ
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>Phiên âm</TableCell>
                                        <TableCell>Nghĩa</TableCell>
                                        <TableCell>Loại từ</TableCell>
                                        <TableCell>Ví dụ</TableCell>
                                        <TableCell>Hình ảnh</TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={searchParams.get('sortBy') === 'createdAt'}
                                                direction={searchParams.get('sortBy') === 'createdAt' ? (searchParams.get('sortDir') as 'asc' | 'desc') : 'asc'}
                                                onClick={() => onSort('createdAt')}
                                            >
                                                Ngày tạo
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="center">Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {notes.map((note) => {
                                        const wordField = note.fieldValues['word'] || Object.values(note.fieldValues)[0] || 'Untitled';
                                        const phoneticField = note.fieldValues['phonetic'] || note.fieldValues['phiên âm'] || '';
                                        const meaningField = note.fieldValues['meaning'] || note.fieldValues['nghĩa'] || '';
                                        const posField = note.fieldValues['pos'] || note.fieldValues['loại từ'] || '';
                                        const exampleField = note.fieldValues['example'] || note.fieldValues['ví dụ'] || '';
                                        const audioField = note.fieldValues['audio'] || note.fieldValues['âm thanh'] || note.fieldValues['pronunciation'] || '';

                                        // Find image field - check common image field names
                                        const imageField = note.fieldValues['image'];

                                        return (
                                            <TableRow key={note.id} hover>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {wordField}
                                                        </Typography>
                                                        {audioField && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handlePlayAudio(audioField)}
                                                                sx={{ p: 0.5 }}
                                                            >
                                                                <VolumeUpIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                        {phoneticField ? `${phoneticField}` : '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {meaningField || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {posField ? (
                                                        <Chip label={posField} size="small" variant="outlined" />
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic', maxWidth: 200 }}>
                                                        {exampleField ? `"${exampleField}"` : '-'}
                                                    </Typography>
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
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box display="flex" gap={1} justifyContent="center">
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<EditIcon />}
                                                            onClick={() => onEdit(note)}
                                                            sx={{ fontSize: '0.75rem' }}
                                                        >
                                                            Sửa
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() => onDelete(note)}
                                                            sx={{ fontSize: '0.75rem' }}
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

                        {/* Pagination */}
                        {paginationData && (
                            <TablePagination
                                component="div"
                                count={paginationData.totalElements}
                                page={parseInt(searchParams.get('page') || '0')}
                                onPageChange={onPageChange}
                                rowsPerPage={parseInt(searchParams.get('size') || '10')}
                                onRowsPerPageChange={onRowsPerPageChange}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                labelRowsPerPage="Số dòng mỗi trang:"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
                                }
                            />
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default NotesTable;
