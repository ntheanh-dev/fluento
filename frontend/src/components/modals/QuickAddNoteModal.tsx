import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    Select,
    MenuItem,
    Box,
    Typography,
    CircularProgress,
    IconButton,
    Chip
} from '@mui/material';
import {
    Close as CloseIcon,
    AutoAwesome as AutoAwesomeIcon,
    VolumeUp as VolumeUpIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { vocabularyDeckApi, vocabularyNoteTypeApi, vocabularyNoteApi } from '../vocabulary/vocabularyApi';
import { dictionaryApi } from '../vocabulary/dictionaryApi';
import { notify } from '../../utils/notify';
import type { Deck, NoteType, CreateNoteRequest } from '../vocabulary/vocabulary';

interface QuickAddNoteModalProps {
    open: boolean;
    onClose: () => void;
    selectedWord: string;
}

const QuickAddNoteModal: React.FC<QuickAddNoteModalProps> = ({
    open,
    onClose,
    selectedWord
}) => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
    const [selectedNoteType, setSelectedNoteType] = useState<NoteType | null>(null);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [autoFillLoading, setAutoFillLoading] = useState(false);
    const [expandedOptions, setExpandedOptions] = useState(false);
    const [dictionaryData, setDictionaryData] = useState<any>(null);

    // Load data when modal opens
    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open]);

    // Initialize form when data is loaded
    useEffect(() => {
        if (decks.length > 0 && noteTypes.length > 0) {
            setSelectedDeck(decks[0]);
            setSelectedNoteType(noteTypes[0]);
            initializeForm();
        }
    }, [decks, noteTypes]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [decksData, noteTypesData] = await Promise.all([
                vocabularyDeckApi.getUserDecks(),
                vocabularyNoteTypeApi.getUserNoteTypes(),
            ]);
            setDecks(decksData);
            setNoteTypes(noteTypesData);
        } catch (error) {
            notify('Lỗi khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const initializeForm = () => {
        if (selectedNoteType) {
            const initialValues: Record<string, string> = {};
            selectedNoteType.fields.forEach(field => {
                if (field.name.toLowerCase().includes('word') || field.name.toLowerCase().includes('từ')) {
                    initialValues[field.name] = selectedWord;
                } else {
                    initialValues[field.name] = '';
                }
            });
            setFieldValues(initialValues);
        }
    };

    const handleDeckChange = (deckId: number) => {
        const deck = decks.find(d => d.id === deckId);
        setSelectedDeck(deck || null);
    };


    const handleFieldChange = (fieldName: string, value: string) => {
        setFieldValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleAutoFill = async () => {
        if (!selectedWord.trim()) {
            notify('Không có từ để tra', 'warning');
            return;
        }

        setAutoFillLoading(true);
        try {
            const dictionaryResult = await dictionaryApi.lookupWord({ word: selectedWord.trim() });
            setDictionaryData(dictionaryResult);

            if (selectedNoteType) {
                const newFieldValues: Record<string, string> = { ...fieldValues };

                selectedNoteType.fields.forEach(field => {
                    const fieldName = field.name.toLowerCase();

                    if (fieldName.includes('phonetic') || fieldName.includes('phiên âm')) {
                        newFieldValues[field.name] = dictionaryResult.phonetic || '';
                    } else if (fieldName.includes('meaning') || fieldName.includes('nghĩa')) {
                        newFieldValues[field.name] = dictionaryResult.meaning || '';
                    } else if (fieldName.includes('pos') || fieldName.includes('loại từ') || fieldName.includes('part of speech')) {
                        newFieldValues[field.name] = dictionaryResult.pos || '';
                    } else if (fieldName.includes('example') || fieldName.includes('ví dụ')) {
                        newFieldValues[field.name] = dictionaryResult.example || '';
                    } else if (fieldName.includes('translation') || fieldName.includes('dịch')) {
                        newFieldValues[field.name] = dictionaryResult.translation || '';
                    } else if (fieldName.includes('audio') || fieldName.includes('âm thanh') || fieldName.includes('pronunciation')) {
                        newFieldValues[field.name] = dictionaryResult.audio || '';
                    }
                });

                setFieldValues(newFieldValues);
                notify('Đã tự động điền thông tin từ Dictionary!', 'success');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tra từ';
            notify(errorMessage, 'error');
        } finally {
            setAutoFillLoading(false);
        }
    };

    const handlePlayAudio = () => {
        if (dictionaryData?.audio) {
            try {
                const audio = new Audio(dictionaryData.audio);
                audio.play().catch(error => {
                    console.error('Error playing audio:', error);
                    notify('Không thể phát audio', 'error');
                });
            } catch (error) {
                notify('URL audio không hợp lệ', 'error');
            }
        } else {
            notify('Không có audio cho từ này', 'warning');
        }
    };

    const handleSubmit = async () => {
        if (!selectedDeck || !selectedNoteType) {
            notify('Vui lòng chọn deck và note type', 'warning');
            return;
        }

        try {
            setLoading(true);
            const createNoteRequest: CreateNoteRequest = {
                noteTypeId: selectedNoteType.id,
                deckId: selectedDeck.id,
                fieldValues: fieldValues
            };

            await vocabularyNoteApi.createNote(createNoteRequest);
            notify('Tạo flashcard thành công!', 'success');
            onClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo flashcard';
            notify(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFieldValues({});
        setSelectedDeck(null);
        setSelectedNoteType(null);
        setDictionaryData(null);
        setExpandedOptions(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                }
            }}
        >
            <DialogTitle sx={{
                pb: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                    Tạo flashcard
                </Typography>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Deck Selection */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                                Deck
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedDeck?.id || ''}
                                    onChange={(e) => handleDeckChange(Number(e.target.value))}
                                    displayEmpty
                                    sx={{ borderRadius: 2 }}
                                >
                                    {decks.map((deck) => (
                                        <MenuItem key={deck.id} value={deck.id}>
                                            {deck.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Word Field */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight="medium" mb={1}>
                                Từ mới
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={selectedWord}
                                disabled
                                sx={{
                                    borderRadius: 2,
                                    '& .MuiInputBase-input': {
                                        bgcolor: 'grey.50',
                                        color: 'text.primary'
                                    }
                                }}
                            />
                        </Box>

                        {/* Auto-fill Section */}
                        <Box>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleAutoFill}
                                    disabled={autoFillLoading}
                                    startIcon={autoFillLoading ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        px: 2
                                    }}
                                >
                                    {autoFillLoading ? 'Đang tra từ...' : 'Tự động điền'}
                                </Button>

                                {dictionaryData?.audio && (
                                    <IconButton
                                        onClick={handlePlayAudio}
                                        sx={{
                                            color: 'primary.main',
                                            '&:hover': {
                                                color: 'primary.dark',
                                                transform: 'scale(1.1)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <VolumeUpIcon />
                                    </IconButton>
                                )}
                            </Box>

                            {/* Dictionary Preview */}
                            {dictionaryData && (
                                <Box sx={{
                                    p: 2,
                                    bgcolor: 'primary.50',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'primary.200'
                                }}>
                                    <Typography variant="caption" color="primary.main" fontWeight="medium">
                                        Thông tin từ Dictionary:
                                    </Typography>
                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {dictionaryData.phonetic && (
                                            <Chip label={`Phát âm: ${dictionaryData.phonetic}`} size="small" />
                                        )}
                                        {dictionaryData.pos && (
                                            <Chip label={`Loại từ: ${dictionaryData.pos}`} size="small" />
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Definition Field */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight="medium" mb={1}>
                                Định nghĩa
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                placeholder="Nhập định nghĩa của từ..."
                                value={fieldValues['meaning'] || fieldValues['nghĩa'] || fieldValues['definition'] || ''}
                                onChange={(e) => {
                                    const fieldName = selectedNoteType?.fields.find(f =>
                                        f.name.toLowerCase().includes('meaning') ||
                                        f.name.toLowerCase().includes('nghĩa') ||
                                        f.name.toLowerCase().includes('definition')
                                    )?.name || 'meaning';
                                    handleFieldChange(fieldName, e.target.value);
                                }}
                                sx={{ borderRadius: 2 }}
                            />
                        </Box>

                        {/* Expandable Options */}
                        <Box>
                            <Button
                                variant="text"
                                onClick={() => setExpandedOptions(!expandedOptions)}
                                endIcon={expandedOptions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                sx={{
                                    textTransform: 'none',
                                    justifyContent: 'flex-start',
                                    p: 0,
                                    color: 'text.secondary'
                                }}
                            >
                                Thêm phiên âm, ví dụ, ảnh, ghi chú ...
                            </Button>

                            {expandedOptions && selectedNoteType && (
                                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {selectedNoteType.fields
                                        .filter(field =>
                                            !field.name.toLowerCase().includes('word') &&
                                            !field.name.toLowerCase().includes('từ') &&
                                            !field.name.toLowerCase().includes('meaning') &&
                                            !field.name.toLowerCase().includes('nghĩa') &&
                                            !field.name.toLowerCase().includes('definition')
                                        )
                                        .map((field) => (
                                            <TextField
                                                key={field.id}
                                                fullWidth
                                                size="small"
                                                label={field.name}
                                                value={fieldValues[field.name] || ''}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                multiline={field.name.toLowerCase().includes('example') || field.name.toLowerCase().includes('ví dụ')}
                                                rows={field.name.toLowerCase().includes('example') || field.name.toLowerCase().includes('ví dụ') ? 2 : 1}
                                                sx={{ borderRadius: 2 }}
                                            />
                                        ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    onClick={handleClose}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3
                    }}
                >
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !selectedDeck || !selectedNoteType}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3,
                        fontWeight: 'medium'
                    }}
                >
                    {loading ? 'Đang tạo...' : 'Lưu'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuickAddNoteModal;
