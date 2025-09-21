import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Avatar,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    VolumeUp as VolumeUpIcon,
    AutoAwesome as AutoAwesomeIcon,
    CloudUpload as CloudUploadIcon,
    Home as HomeIcon,
    School as SchoolIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { type Deck, type NoteType, type Note, type CreateNoteRequest } from './vocabulary';
import { vocabularyDeckApi, vocabularyNoteTypeApi, vocabularyNoteApi, type PaginatedResponse, type PaginationParams } from './vocabularyApi';
import { dictionaryApi } from './dictionaryApi';
import { notify } from '../../utils/notify';
import { showOverlay, hideOverlay } from '../../utils/overlay';

interface ImageUploadProps {
    value: File | null;
    onChange: (file: File | null) => void;
    onRemove: () => void;
    imageUrl?: string; // For editing existing images
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, onRemove, imageUrl }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if it's an image file
            const isImage = file.type && file.type.startsWith('image/') ||
                file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);

            if (!isImage) {
                notify('Please select an image file (JPG, PNG, GIF, WebP, etc.)', 'error');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                notify('File size must be less than 10MB', 'error');
                return;
            }
            onChange(file);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    return (
        <Box>
            {(value || imageUrl) ? (
                <Card sx={{ maxWidth: 300, margin: '8px 0' }}>
                    <Avatar
                        src={value ? URL.createObjectURL(value) : imageUrl}
                        alt="Preview"
                        sx={{ width: 200, height: 200, margin: 'auto', mt: 2 }}
                    />
                    <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={onRemove}
                        >
                            Remove
                        </Button>
                        <Button
                            size="small"
                            color="primary"
                            startIcon={<CloudUploadIcon />}
                            onClick={handleClick}
                        >
                            Change
                        </Button>
                    </Box>
                </Card>
            ) : (
                <Paper
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        backgroundColor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'action.hover'
                        }
                    }}
                    onClick={handleClick}
                >
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Click to upload image
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Supports: JPG, PNG, GIF, WebP (Max 10MB)
                    </Typography>
                    <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={handleClick}
                    >
                        Select Image File
                    </Button>
                </Paper>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
        </Box>
    );
};

const NoteManagement: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { deckId: urlDeckId } = useParams<{ deckId?: string }>();
    const navigate = useNavigate();

    const [decks, setDecks] = useState<Deck[]>([]);
    const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
    const [loading, setLoading] = useState(true);

    // Pagination state - initialize from URL params
    const [paginationData, setPaginationData] = useState<PaginatedResponse<Note> | null>(null);
    const page = parseInt(searchParams.get('page') || '0');
    const rowsPerPage = parseInt(searchParams.get('size') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc';

    const [openDialog, setOpenDialog] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [formData, setFormData] = useState<CreateNoteRequest>({
        noteTypeId: 0, // Will be updated when noteTypes are loaded
        deckId: 0,
        fieldValues: {},
    });
    const [autoFillLoading, setAutoFillLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const loadedDeckRef = useRef<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    // Update formData with first noteType when noteTypes are loaded
    useEffect(() => {
        if (noteTypes.length > 0 && formData.noteTypeId === 0) {
            setFormData(prev => ({
                ...prev,
                noteTypeId: noteTypes[0].id
            }));
        }
    }, [noteTypes]);

    // Load notes from URL params when component mounts or URL changes
    useEffect(() => {
        if (decks.length > 0) {
            // Priority: URL path param > search param > first deck
            const deckIdFromUrl = urlDeckId || searchParams.get('deckId');
            let selectedDeck: Deck | null = null;

            console.log('Loading notes - deckIdFromUrl:', deckIdFromUrl, 'decks:', decks.length);

            if (deckIdFromUrl) {
                // Try to find deck from URL params
                selectedDeck = decks.find(d => d.id === parseInt(deckIdFromUrl)) || null;
                console.log('Found deck from URL:', selectedDeck?.name);
            }

            // If no deck from URL or deck not found, select first deck
            if (!selectedDeck) {
                selectedDeck = decks[0];
                console.log('Using first deck:', selectedDeck?.name);
            }

            if (selectedDeck && loadedDeckRef.current !== selectedDeck.id) {
                console.log('Loading notes for deck:', selectedDeck.name, selectedDeck.id);
                loadedDeckRef.current = selectedDeck.id;
                setSelectedDeck(selectedDeck);
                loadNotesForDeck(selectedDeck.id, page, rowsPerPage, sortBy, sortDir);
            }
        }
    }, [decks, searchParams, urlDeckId]);

    // Helper function to detect image fields
    const isImageField = (fieldName: string): boolean => {
        const imageKeywords = ['image', 'hình ảnh', 'picture', 'photo', 'img'];
        return imageKeywords.some(keyword =>
            fieldName.toLowerCase().includes(keyword)
        );
    };

    // Handle file change for image fields
    const handleFileChange = (fieldName: string, file: File | null) => {
        const newFieldValues = { ...formData.fieldValues };
        const newImageUrls = { ...imageUrls };

        if (file) {
            newFieldValues[fieldName] = file;
            // Remove the existing image URL when user selects a new file
            delete newImageUrls[fieldName];
        } else {
            delete newFieldValues[fieldName];
            // Remove the image URL when user removes the image
            delete newImageUrls[fieldName];
        }

        setFormData({
            ...formData,
            fieldValues: newFieldValues
        });
        setImageUrls(newImageUrls);
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [decksData, noteTypesData] = await Promise.all([
                vocabularyDeckApi.getUserDecks(),
                vocabularyNoteTypeApi.getUserNoteTypes()
            ]);
            setDecks(decksData);
            setNoteTypes(noteTypesData);
        } catch (error) {
            notify('Lỗi khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadNotesForDeck = async (deckId: number, pageNum: number = page, size: number = rowsPerPage, sort: string = sortBy, dir: 'asc' | 'desc' = sortDir) => {
        try {
            console.log('loadNotesForDeck called with:', { deckId, pageNum, size, sort, dir });
            showOverlay({ message: 'Đang tải notes...' });

            // Only navigate if we're not already on the correct URL
            const currentUrl = window.location.pathname;
            const targetUrl = `/vocabulary/decks/${deckId}`;

            if (currentUrl !== targetUrl) {
                // Update URL path and params
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('page', pageNum.toString());
                newSearchParams.set('size', size.toString());
                newSearchParams.set('sortBy', sort);
                newSearchParams.set('sortDir', dir);

                // Navigate to deck-specific URL
                const newUrl = `${targetUrl}?${newSearchParams.toString()}`;
                console.log('Navigating to:', newUrl);
                navigate(newUrl, { replace: true });
            }

            const params: PaginationParams = {
                page: pageNum,
                size: size,
                sortBy: sort,
                sortDir: dir
            };
            console.log('API call params:', params);
            const paginatedData = await vocabularyNoteApi.getNotesByDeckPaginated(deckId, params);
            console.log('API response:', paginatedData);
            setPaginationData(paginatedData);
            setNotes(paginatedData.content);
        } catch (error) {
            console.error('Error loading notes:', error);
            notify('Lỗi khi tải notes', 'error');
        } finally {
            hideOverlay();
        }
    };

    const handleDeckChange = async (deck: Deck) => {
        await loadNotesForDeck(deck.id, 0, rowsPerPage, sortBy, sortDir);
    };

    // Pagination handlers
    const handleChangePage = async (_event: unknown, newPage: number) => {
        if (selectedDeck) {
            await loadNotesForDeck(selectedDeck.id, newPage, rowsPerPage, sortBy, sortDir);
        }
    };

    const handleChangeRowsPerPage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.target.value, 10);
        if (selectedDeck) {
            await loadNotesForDeck(selectedDeck.id, 0, newSize, sortBy, sortDir);
        }
    };

    const handleSort = async (property: string) => {
        const isAsc = sortBy === property && sortDir === 'asc';
        const newSortDir = isAsc ? 'desc' : 'asc';
        if (selectedDeck) {
            await loadNotesForDeck(selectedDeck.id, 0, rowsPerPage, property, newSortDir);
        }
    };

    const handleOpenDialog = (note?: Note) => {
        if (note) {
            setEditingNote(note);

            // Separate image URLs from other field values
            const textFields: Record<string, string> = {};
            const imageFields: Record<string, string> = {};

            Object.entries(note.fieldValues).forEach(([key, value]) => {
                if (typeof value === 'string' && (value.includes('res.cloudinary.com') || value.includes('http'))) {
                    // This is likely an image URL
                    imageFields[key] = value;
                } else if (typeof value === 'string') {
                    // This is a text field
                    textFields[key] = value;
                }
            });

            setFormData({
                noteTypeId: note.noteTypeId,
                deckId: note.deckId,
                fieldValues: textFields
            });
            setImageUrls(imageFields);
        } else {
            setEditingNote(null);
            setFormData({
                noteTypeId: noteTypes.length > 0 ? noteTypes[0].id : 0,
                deckId: selectedDeck?.id || 0,
                fieldValues: {}
            });
            setImageUrls({});
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingNote(null);
        setFormData({
            noteTypeId: noteTypes.length > 0 ? noteTypes[0].id : 0,
            deckId: 0,
            fieldValues: {}
        });
        setImageUrls({});
    };

    const handleSave = async () => {
        try {
            showOverlay({ message: editingNote ? 'Đang cập nhật note...' : 'Đang tạo note...' });

            // Merge text fields and image URLs/files
            const mergedFieldValues = { ...formData.fieldValues };

            // Add image URLs from existing images
            Object.entries(imageUrls).forEach(([key, url]) => {
                mergedFieldValues[key] = url;
            });

            // Add new image files
            Object.entries(formData.fieldValues).forEach(([key, value]) => {
                if (value instanceof File) {
                    mergedFieldValues[key] = value;
                }
            });

            const dataToSave = {
                ...formData,
                fieldValues: mergedFieldValues
            };

            if (editingNote) {
                await vocabularyNoteApi.updateNote(editingNote.id, dataToSave);
                notify('Cập nhật note thành công', 'success');
            } else {
                await vocabularyNoteApi.createNote(dataToSave);
                notify('Tạo note thành công', 'success');
            }
            handleCloseDialog();
            if (selectedDeck) {
                await loadNotesForDeck(selectedDeck.id, page, rowsPerPage, sortBy, sortDir);
            }
        } catch (error) {
            notify('Lỗi khi lưu note', 'error');
        } finally {
            hideOverlay();
        }
    };

    const handleDelete = async (note: Note) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa note này?')) {
            try {
                showOverlay({ message: 'Đang xóa note...' });
                await vocabularyNoteApi.deleteNote(note.id);
                notify('Xóa note thành công', 'success');
                if (selectedDeck) {
                    await loadNotesForDeck(selectedDeck.id, page, rowsPerPage, sortBy, sortDir);
                }
            } catch (error) {
                notify('Lỗi khi xóa note', 'error');
            } finally {
                hideOverlay();
            }
        }
    };

    const handlePlayAudio = (audioUrl: string) => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play().catch(() => {
                notify('Không thể phát âm thanh', 'error');
            });
        }
    };

    const handleAutoFill = async () => {
        const wordField = formData.fieldValues['word'];
        if (!wordField || typeof wordField !== 'string' || wordField.trim() === '') {
            notify('Vui lòng nhập từ tiếng Anh vào trường "word" trước khi auto-fill', 'warning');
            return;
        }

        try {
            setAutoFillLoading(true);
            const dictionaryData = await dictionaryApi.lookupWord({ word: wordField.trim() });

            if (dictionaryData) {
                const newFieldValues = { ...formData.fieldValues };

                // Map dictionary data to form fields
                if (dictionaryData.phonetic) {
                    newFieldValues['phonetic'] = dictionaryData.phonetic;
                    newFieldValues['phiên âm'] = dictionaryData.phonetic;
                }

                if (dictionaryData.meaning) {
                    newFieldValues['meaning'] = dictionaryData.meaning;
                    newFieldValues['nghĩa'] = dictionaryData.meaning;
                }

                if (dictionaryData.pos) {
                    newFieldValues['pos'] = dictionaryData.pos;
                    newFieldValues['loại từ'] = dictionaryData.pos;
                }

                if (dictionaryData.example) {
                    newFieldValues['example'] = dictionaryData.example;
                    newFieldValues['ví dụ'] = dictionaryData.example;
                }

                if (dictionaryData.translation) {
                    newFieldValues['translation'] = dictionaryData.translation;
                    newFieldValues['dịch'] = dictionaryData.translation;
                }

                if (dictionaryData.audio) {
                    newFieldValues['audio'] = dictionaryData.audio;
                    newFieldValues['âm thanh'] = dictionaryData.audio;
                }

                setFormData({ ...formData, fieldValues: newFieldValues });
                notify('Auto-fill thành công!', 'success');
            } else {
                notify('Không tìm thấy thông tin từ điển cho từ này', 'warning');
            }
        } catch (error) {
            notify('Lỗi khi auto-fill từ điển', 'error');
        } finally {
            setAutoFillLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
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
                <Link
                    href={'/vocabulary/decks'}
                    color="inherit"
                    sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                    <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Decks
                </Link>
                <Typography
                    color="text.primary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    {selectedDeck ? selectedDeck.name : 'Quản lý Notes'}
                </Typography>
            </Breadcrumbs>

            {/* Deck Selection */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" gap={2} alignItems="center">
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Chọn Deck</InputLabel>
                            <Select
                                value={selectedDeck?.id || ''}
                                onChange={(e) => {
                                    const deck = decks.find(d => d.id === e.target.value);
                                    if (deck) handleDeckChange(deck);
                                }}
                                label="Chọn Deck"
                            >
                                {decks.map((deck) => (
                                    <MenuItem key={deck.id} value={deck.id}>
                                        {deck.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            disabled={!selectedDeck}
                        >
                            Thêm Note
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Notes Table */}
            {selectedDeck && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Notes trong "{selectedDeck.name}"
                        </Typography>

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
                                                        onClick={() => handleSort('word')}
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
                                                        onClick={() => handleSort('createdAt')}
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
                                                const imageField = note.fieldValues['image'] ||
                                                    note.fieldValues['hình ảnh'] ||
                                                    note.fieldValues['picture'] ||
                                                    note.fieldValues['photo'] ||
                                                    Object.values(note.fieldValues).find(value =>
                                                        typeof value === 'string' &&
                                                        (value.includes('res.cloudinary.com') || value.includes('http'))
                                                    ) as string;
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
                                                                    onClick={() => handleOpenDialog(note)}
                                                                    sx={{ fontSize: '0.75rem' }}
                                                                >
                                                                    Sửa
                                                                </Button>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="error"
                                                                    startIcon={<DeleteIcon />}
                                                                    onClick={() => handleDelete(note)}
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
                                        onPageChange={handleChangePage}
                                        rowsPerPage={parseInt(searchParams.get('size') || '10')}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
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
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingNote ? 'Sửa Note' : 'Thêm Note Mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Loại Note</InputLabel>
                            <Select
                                value={formData.noteTypeId}
                                onChange={(e) => setFormData({ ...formData, noteTypeId: Number(e.target.value) })}
                                label="Loại Note"
                            >
                                {noteTypes.map((noteType) => (
                                    <MenuItem key={noteType.id} value={noteType.id}>
                                        {noteType.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {formData.noteTypeId > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">
                                        Nội dung
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={autoFillLoading ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                                        onClick={handleAutoFill}
                                        disabled={autoFillLoading}
                                        sx={{ fontSize: '0.875rem' }}
                                    >
                                        {autoFillLoading ? 'Đang tải...' : 'Auto-fill'}
                                    </Button>
                                </Box>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                    Nhập từ tiếng Anh vào trường "word" và nhấn nút này để tự động điền các trường còn lại
                                </Typography>
                                {noteTypes.find(nt => nt.id === formData.noteTypeId)?.fields.map((field) => {
                                    const fieldValue = formData.fieldValues[field.name];

                                    if (isImageField(field.name)) {
                                        return (
                                            <Box key={field.id} sx={{ mt: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    {field.name} {field.isRequired && <span style={{ color: 'red' }}>*</span>}
                                                </Typography>
                                                <ImageUpload
                                                    value={fieldValue instanceof File ? fieldValue : null}
                                                    onChange={(file) => handleFileChange(field.name, file)}
                                                    onRemove={() => handleFileChange(field.name, null)}
                                                    imageUrl={imageUrls[field.name]}
                                                />
                                            </Box>
                                        );
                                    }

                                    return (
                                        <TextField
                                            key={field.id}
                                            fullWidth
                                            label={field.name}
                                            value={typeof fieldValue === 'string' ? fieldValue : ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                fieldValues: {
                                                    ...formData.fieldValues,
                                                    [field.name]: e.target.value
                                                }
                                            })}
                                            margin="normal"
                                            multiline={field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('mô tả')}
                                            rows={field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('mô tả') ? 3 : 1}
                                            required={field.isRequired}
                                        />
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                    >
                        {editingNote ? 'Cập nhật' : 'Tạo'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NoteManagement;