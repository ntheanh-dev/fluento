import React, { useState, useEffect } from 'react';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Menu,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
    LibraryBooks as LibraryBooksIcon,
    Quiz as QuizIcon,
    AutoAwesome as AutoAwesomeIcon,
    VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { type Deck, type NoteType, type Note, type CreateNoteRequest } from './vocabulary';
import { vocabularyDeckApi, vocabularyNoteTypeApi, vocabularyNoteApi } from './vocabularyApi';
import { dictionaryApi } from './dictionaryApi';
import { notify } from '../../utils/notify';

const NoteManagement: React.FC = () => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [formData, setFormData] = useState<CreateNoteRequest>({
        noteTypeId: 0,
        deckId: 0,
        fieldValues: {},
    });
    const [autoFillLoading, setAutoFillLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [decksData, noteTypesData] = await Promise.all([
                vocabularyDeckApi.getUserDecks(),
                vocabularyNoteTypeApi.getUserNoteTypes(),
            ]);
            setDecks(decksData);
            setNoteTypes(noteTypesData);

            if (decksData.length > 0) {
                setSelectedDeck(decksData[0]);
                await loadNotesForDeck(decksData[0].id);
            }
        } catch (error) {
            notify('Lỗi khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadNotesForDeck = async (deckId: number) => {
        try {
            const notesData = await vocabularyNoteApi.getNotesByDeck(deckId);
            setNotes(notesData);
        } catch (error) {
            notify('Lỗi khi tải notes', 'error');
        }
    };

    const handleDeckChange = async (deck: Deck) => {
        setSelectedDeck(deck);
        await loadNotesForDeck(deck.id);
    };

    const handleOpenDialog = (note?: Note) => {
        if (note) {
            setEditingNote(note);
            setFormData({
                noteTypeId: note.noteTypeId,
                deckId: note.deckId,
                fieldValues: note.fieldValues,
            });
        } else {
            setEditingNote(null);
            setFormData({
                noteTypeId: noteTypes.length > 0 ? noteTypes[0].id : 0,
                deckId: selectedDeck?.id || 0,
                fieldValues: {},
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingNote(null);
        setFormData({
            noteTypeId: 0,
            deckId: 0,
            fieldValues: {},
        });
    };

    const handleNoteTypeChange = (noteTypeId: number) => {
        const noteType = noteTypes.find(nt => nt.id === noteTypeId);
        if (noteType) {
            const fieldValues: Record<string, string> = {};
            noteType.fields.forEach(field => {
                fieldValues[field.name] = formData.fieldValues[field.name] || '';
            });
            setFormData({ ...formData, noteTypeId, fieldValues });
        }
    };

    const handleFieldChange = (fieldName: string, value: string) => {
        setFormData({
            ...formData,
            fieldValues: {
                ...formData.fieldValues,
                [fieldName]: value,
            },
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingNote) {
                await vocabularyNoteApi.updateNote(editingNote.id, formData);
                notify('Cập nhật note thành công', 'success');
            } else {
                await vocabularyNoteApi.createNote(formData);
                notify('Tạo note thành công', 'success');
            }
            handleCloseDialog();
            if (selectedDeck) {
                await loadNotesForDeck(selectedDeck.id);
            }
        } catch (error) {
            notify('Lỗi khi lưu note', 'error');
        }
    };

    const handleDelete = async (note: Note) => {
        if (window.confirm(`Bạn có chắc muốn xóa note này?`)) {
            try {
                await vocabularyNoteApi.deleteNote(note.id);
                notify('Xóa note thành công', 'success');
                if (selectedDeck) {
                    await loadNotesForDeck(selectedDeck.id);
                }
            } catch (error) {
                notify('Lỗi khi xóa note', 'error');
            }
        }
        setAnchorEl(null);
        setSelectedNote(null);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, note: Note) => {
        setAnchorEl(event.currentTarget);
        setSelectedNote(note);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedNote(null);
    };

    const handlePlayAudio = (audioUrl: string) => {
        if (audioUrl && audioUrl.trim()) {
            try {
                const audio = new Audio(audioUrl);
                audio.play().catch(error => {
                    console.error('Error playing audio:', error);
                    notify('Không thể phát audio', 'error');
                });
            } catch (error) {
                console.error('Error creating audio:', error);
                notify('URL audio không hợp lệ', 'error');
            }
        } else {
            notify('Không có audio cho từ này', 'warning');
        }
    };

    const handleAutoFill = async () => {
        const wordField = formData.fieldValues['word'];
        if (!wordField || !wordField.trim()) {
            notify('Vui lòng nhập từ tiếng Anh trước', 'warning');
            return;
        }

        setAutoFillLoading(true);
        try {
            const dictionaryResult = await dictionaryApi.lookupWord({ word: wordField.trim() });

            // Get the selected note type to know all available fields
            const selectedNoteType = noteTypes.find(nt => nt.id === formData.noteTypeId);
            if (!selectedNoteType) {
                notify('Không tìm thấy note type', 'error');
                return;
            }

            // Initialize field values with all fields from note type
            const newFieldValues: Record<string, string> = {};
            selectedNoteType.fields.forEach(field => {
                // Keep existing values or initialize with empty string
                newFieldValues[field.name] = formData.fieldValues[field.name] || '';
            });

            // Map dictionary result to form fields based on field names
            selectedNoteType.fields.forEach(field => {
                const fieldName = field.name.toLowerCase();

                if (fieldName.includes('phonetic') || fieldName.includes('phiên âm')) {
                    newFieldValues[field.name] = dictionaryResult.phonetic;
                } else if (fieldName.includes('meaning') || fieldName.includes('nghĩa')) {
                    newFieldValues[field.name] = dictionaryResult.meaning;
                } else if (fieldName.includes('pos') || fieldName.includes('loại từ') || fieldName.includes('part of speech')) {
                    newFieldValues[field.name] = dictionaryResult.pos;
                } else if (fieldName.includes('example') || fieldName.includes('ví dụ')) {
                    newFieldValues[field.name] = dictionaryResult.example;
                } else if (fieldName.includes('translation') || fieldName.includes('dịch')) {
                    newFieldValues[field.name] = dictionaryResult.translation;
                } else if (fieldName.includes('audio') || fieldName.includes('âm thanh') || fieldName.includes('pronunciation')) {
                    newFieldValues[field.name] = dictionaryResult.audio || '';
                }
                // Keep the word field as is (user input)
                else if (fieldName.includes('word') || fieldName.includes('từ')) {
                    // Don't override the word field, keep user input
                }
            });

            setFormData({
                ...formData,
                fieldValues: newFieldValues,
            });

            notify('Đã tự động điền các trường còn thiếu!', 'success');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tra từ';
            notify(errorMessage, 'error');
        } finally {
            setAutoFillLoading(false);
        }
    };

    const selectedNoteType = noteTypes.find(nt => nt.id === formData.noteTypeId);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Quản lý Notes
            </Typography>

            {/* Deck Selection */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Chọn Deck
                    </Typography>
                    <Grid container spacing={2}>
                        {decks.map((deck) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={deck.id}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        border: selectedDeck?.id === deck.id ? 2 : 1,
                                        borderColor: selectedDeck?.id === deck.id ? 'primary.main' : 'divider',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: 2,
                                        },
                                    }}
                                    onClick={() => handleDeckChange(deck)}
                                >
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Typography variant="subtitle1" noWrap>
                                                {deck.name}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" gap={1}>
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
                                                color="info"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* Notes List */}
            {selectedDeck && (
                <Box>
                    <Card sx={{ mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box display="flex" alignItems="center" gap={2}>
                                    <LibraryBooksIcon color="primary" />
                                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                                        Notes trong "{selectedDeck.name}"
                                    </Typography>
                                    <Chip
                                        label={`${notes.length} từ`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenDialog()}
                                    disabled={noteTypes.length === 0}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 'medium',
                                        px: 3
                                    }}
                                >
                                    Thêm Note
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {noteTypes.length === 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Bạn cần tạo Note Type trước khi có thể thêm Notes.
                        </Alert>
                    )}

                    {notes.length === 0 ? (
                        <Card sx={{ textAlign: 'center', py: 4 }}>
                            <CardContent>
                                <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Chưa có note nào
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Thêm note đầu tiên để tạo flashcard
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenDialog()}
                                    disabled={noteTypes.length === 0}
                                >
                                    Thêm Note Đầu Tiên
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Grid container spacing={3}>
                            {notes.map((note) => {
                                const wordField = note.fieldValues['word'] || Object.values(note.fieldValues)[0] || 'Untitled';
                                const phoneticField = note.fieldValues['phonetic'] || note.fieldValues['phiên âm'] || '';
                                const meaningField = note.fieldValues['meaning'] || note.fieldValues['nghĩa'] || '';
                                const posField = note.fieldValues['pos'] || note.fieldValues['loại từ'] || '';
                                const exampleField = note.fieldValues['example'] || note.fieldValues['ví dụ'] || '';
                                const audioField = note.fieldValues['audio'] || note.fieldValues['âm thanh'] || note.fieldValues['pronunciation'] || '';

                                return (
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={note.id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 3,
                                                boxShadow: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4,
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                                {/* Header with word, audio and menu */}
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                        sx={{
                                                            color: 'primary.main',
                                                            fontSize: '1.1rem',
                                                            lineHeight: 1.2,
                                                            flexGrow: 1
                                                        }}
                                                    >
                                                        {wordField}
                                                    </Typography>
                                                    <Box display="flex" gap={0.5}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handlePlayAudio(audioField)}
                                                            disabled={!audioField || audioField.trim() === ''}
                                                            sx={{
                                                                color: audioField ? 'primary.main' : 'text.disabled',
                                                                '&:hover': {
                                                                    color: audioField ? 'primary.dark' : 'text.disabled',
                                                                    transform: 'scale(1.1)'
                                                                },
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <VolumeUpIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => handleMenuOpen(e, note)}
                                                            sx={{
                                                                color: 'text.secondary',
                                                                '&:hover': { color: 'primary.main' }
                                                            }}
                                                        >
                                                            <MoreVertIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>

                                                {/* Phonetic */}
                                                {phoneticField && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'text.secondary',
                                                            fontStyle: 'italic',
                                                            mb: 1,
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        {phoneticField}
                                                    </Typography>
                                                )}

                                                {/* Part of Speech */}
                                                {posField && (
                                                    <Chip
                                                        label={posField}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{
                                                            mb: 1.5,
                                                            fontSize: '0.75rem',
                                                            height: 24,
                                                            '& .MuiChip-label': {
                                                                px: 1.5
                                                            }
                                                        }}
                                                    />
                                                )}

                                                {/* Meaning */}
                                                {meaningField && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            mb: 1.5,
                                                            lineHeight: 1.4,
                                                            color: 'text.primary'
                                                        }}
                                                    >
                                                        {meaningField}
                                                    </Typography>
                                                )}

                                                {/* Example */}
                                                {exampleField && (
                                                    <Box
                                                        sx={{
                                                            bgcolor: 'grey.50',
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: 'grey.200',
                                                            mb: 2
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{ fontWeight: 'medium' }}
                                                        >
                                                            Ví dụ:
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mt: 0.5,
                                                                fontStyle: 'italic',
                                                                color: 'text.primary'
                                                            }}
                                                        >
                                                            {exampleField}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Footer */}
                                                <Box
                                                    display="flex"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    sx={{ mt: 'auto' }}
                                                >
                                                    <Box display="flex" gap={1}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<QuizIcon />}
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                textTransform: 'none',
                                                                borderRadius: 2,
                                                                px: 1.5,
                                                                py: 0.5
                                                            }}
                                                        >
                                                            Test
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() => handleDelete(note)}
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                textTransform: 'none',
                                                                borderRadius: 2,
                                                                px: 1.5,
                                                                py: 0.5
                                                            }}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </Box>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ fontSize: '0.7rem' }}
                                                    >
                                                        {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Box>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingNote ? 'Chỉnh sửa Note' : 'Tạo Note Mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Note Type</InputLabel>
                            <Select
                                value={formData.noteTypeId}
                                onChange={(e) => handleNoteTypeChange(Number(e.target.value))}
                                label="Note Type"
                            >
                                {noteTypes.map((noteType) => (
                                    <MenuItem key={noteType.id} value={noteType.id}>
                                        {noteType.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Auto-fill button for Default note type */}
                        {selectedNoteType && !editingNote && (
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => {
                                        console.log('Selected note type:', selectedNoteType);
                                        console.log('Form data:', formData);
                                        handleAutoFill();
                                    }}
                                    disabled={autoFillLoading || !formData.fieldValues['word']?.trim()}
                                    startIcon={autoFillLoading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                                    sx={{ mb: 1 }}
                                >
                                    {autoFillLoading ? 'Đang tra từ...' : 'Tự động điền từ Dictionary'}
                                </Button>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Nhập từ tiếng Anh vào trường "word" và nhấn nút này để tự động điền các trường còn lại
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Debug: Note type "{selectedNoteType.name}" có {selectedNoteType.fields.length} fields
                                </Typography>
                            </Box>
                        )}

                        {selectedNoteType && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Nội dung
                                </Typography>
                                {selectedNoteType.fields.map((field) => (
                                    <TextField
                                        key={field.id}
                                        fullWidth
                                        label={field.name}
                                        value={formData.fieldValues[field.name] || ''}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                        margin="normal"
                                        multiline={field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('mô tả')}
                                        rows={field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('mô tả') ? 3 : 1}
                                        required={field.isRequired}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingNote ? 'Cập nhật' : 'Tạo'}
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
                    handleOpenDialog(selectedNote!);
                    handleMenuClose();
                }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Chỉnh sửa
                </MenuItem>
                <MenuItem onClick={() => handleDelete(selectedNote!)}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Xóa
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default NoteManagement;
