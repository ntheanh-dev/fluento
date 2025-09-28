import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    Select,
    MenuItem,
    Box,
    Typography,
    CircularProgress,
    IconButton,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { NoteForm } from '../vocabulary/notemanagement/index';
import {
    Close as CloseIcon,
} from '@mui/icons-material';
import { vocabularyDeckApi, vocabularyNoteTypeApi, vocabularyNoteApi } from '../vocabulary/vocabularyApi';
import { dictionaryApi } from '../vocabulary/dictionaryApi';
import { notify } from '../../utils/notify';
import { VocabularyCache } from '../../utils/cache';
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
    const navigate = useNavigate();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
    const [selectedNoteType, setSelectedNoteType] = useState<NoteType | null>(null);
    const [fieldValues, setFieldValues] = useState<Record<string, string | File>>({});
    const [loading, setLoading] = useState(false);
    const [autoFillLoading, setAutoFillLoading] = useState(false);
    const [dictionaryData, setDictionaryData] = useState<any>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showValidationErrors, setShowValidationErrors] = useState(false);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

    // Create formData from current state
    const formData: CreateNoteRequest = {
        noteTypeId: selectedNoteType?.id || 0,
        deckId: selectedDeck?.id || 0,
        fieldValues: fieldValues
    };

    // Handler functions for NoteForm
    const handleFormDataChange = (data: CreateNoteRequest) => {
        setFieldValues(data.fieldValues);
    };

    const handleFileChange = (fieldName: string, file: File | null) => {
        if (file) {
            // Check file size (10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                notify('File quá lớn. Kích thước tối đa là 10MB.', 'error');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                notify('Chỉ hỗ trợ file hình ảnh.', 'error');
                return;
            }
        }

        setFieldValues(prev => ({
            ...prev,
            [fieldName]: file || ''
        }));
    };

    // Load data when modal opens
    useEffect(() => {
        if (open) {
            loadData();
            // Clear validation errors when modal opens
            setValidationErrors({});
            setShowValidationErrors(false);
            // Add selectedWord to fieldValues for auto-fill
            setFieldValues(prev => ({
                ...prev,
                word: selectedWord
            }));
        }
    }, [open, selectedWord]);

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

            // Try to load noteTypes from cache first
            const cachedNoteTypes = VocabularyCache.getNoteTypes() as NoteType[] | null;
            let noteTypesData: NoteType[] = cachedNoteTypes || [];


            // Fetch fresh data in parallel
            const [freshDecksData, freshNoteTypesData] = await Promise.all([
                vocabularyDeckApi.getUserDecks(),
                vocabularyNoteTypeApi.getUserNoteTypes()
            ]);

            // Always use fresh decks data (no caching)
            setDecks(freshDecksData);

            // Handle noteTypes cache
            if (noteTypesData.length === 0) {
                noteTypesData = freshNoteTypesData;
                VocabularyCache.setNoteTypes(noteTypesData);
            } else {
                // Compare cached data with fresh data to detect changes
                const cachedIds = noteTypesData.map(nt => nt.id).sort();
                const freshIds = freshNoteTypesData.map(nt => nt.id).sort();

                if (JSON.stringify(cachedIds) !== JSON.stringify(freshIds)) {
                    // Data has changed, update cache
                    noteTypesData = freshNoteTypesData;
                    VocabularyCache.setNoteTypes(noteTypesData);
                }
            }

            setNoteTypes(noteTypesData);
        } catch (error) {
            notify('Lỗi khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const initializeForm = () => {
        // Initialize with selectedWord in word field
        const initialValues: Record<string, string> = {
            word: selectedWord || ''
        };
        setFieldValues(initialValues);
    };

    // Function to clear noteTypes cache (can be called from outside if needed)
    const clearCache = () => {
        VocabularyCache.clearAll();
    };

    // Expose clearCache function globally for external use
    useEffect(() => {
        (window as any).clearVocabularyCache = clearCache;
        return () => {
            delete (window as any).clearVocabularyCache;
        };
    }, []);

    const handleDeckChange = (deckId: number) => {
        const deck = decks.find(d => d.id === deckId);
        setSelectedDeck(deck || null);
    };

    const handleNavigateToDeckManagement = () => {
        onClose(); // Close the modal first
        navigate('/vocabulary/decks');
    };

    // Validation function
    const validateForm = (): { isValid: boolean; errorCount: number } => {
        const errors: Record<string, string> = {};

        if (!selectedDeck) {
            errors.deck = 'Vui lòng chọn deck';
        }

        if (!selectedNoteType) {
            errors.noteType = 'Vui lòng chọn loại note';
        }

        // Validate required fields from selectedNoteType
        if (selectedNoteType) {
            selectedNoteType.fields.forEach(field => {
                if (field.isRequired) {
                    const fieldValue = fieldValues[field.name];
                    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
                        errors[field.name] = `${field.name} là bắt buộc`;
                    }
                }
            });
        }

        setValidationErrors(errors);
        const errorCount = Object.keys(errors).length;
        return { isValid: errorCount === 0, errorCount };
    };

    // Re-validate when form data changes
    useEffect(() => {
        if (showValidationErrors) {
            validateForm();
        }
    }, [fieldValues, selectedDeck, selectedNoteType, showValidationErrors]);

    const handleAutoFill = async (word?: string) => {
        const wordToLookup = word || selectedWord;
        if (!wordToLookup?.trim()) {
            notify('Không có từ để tra', 'warning');
            return;
        }

        setAutoFillLoading(true);
        try {
            const dictionaryResult = await dictionaryApi.lookupWord({ word: wordToLookup.trim() });
            setDictionaryData(dictionaryResult);

            const newFieldValues: Record<string, string | File> = { ...fieldValues };

            // Map dictionary data to common field names
            if (dictionaryResult.phonetic) {
                newFieldValues['phonetic'] = dictionaryResult.phonetic;
                newFieldValues['phiên âm'] = dictionaryResult.phonetic;
            }

            if (dictionaryResult.meaning) {
                newFieldValues['meaning'] = dictionaryResult.meaning;
                newFieldValues['nghĩa'] = dictionaryResult.meaning;
            }

            if (dictionaryResult.pos) {
                newFieldValues['pos'] = dictionaryResult.pos;
                newFieldValues['loại từ'] = dictionaryResult.pos;
            }

            if (dictionaryResult.example) {
                newFieldValues['example'] = dictionaryResult.example;
                newFieldValues['ví dụ'] = dictionaryResult.example;
            }

            if (dictionaryResult.translation) {
                newFieldValues['translation'] = dictionaryResult.translation;
                newFieldValues['dịch'] = dictionaryResult.translation;
            }

            if (dictionaryResult.audio) {
                newFieldValues['audio'] = dictionaryResult.audio;
                newFieldValues['âm thanh'] = dictionaryResult.audio;
            }

            setFieldValues(newFieldValues);
            notify('Đã tự động điền thông tin từ Dictionary!', 'success');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tra từ';
            notify(errorMessage, 'error');
        } finally {
            setAutoFillLoading(false);
        }
    };


    const handleSubmit = async () => {
        if (!selectedDeck || !selectedNoteType) {
            notify('Vui lòng chọn deck và loại note', 'warning');
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
            notify('Tạo note thành công!', 'success');
            onClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo note';
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
        setValidationErrors({});
        setShowValidationErrors(false);
        setImageUrls({});
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
                    Thêm note
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
                        {/* Show validation errors summary */}
                        {showValidationErrors && Object.keys(validationErrors).length > 0 && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Vui lòng điền đầy đủ các trường bắt buộc:
                                </Typography>
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    {Object.entries(validationErrors).map(([field, error]) => (
                                        <li key={field}>{error}</li>
                                    ))}
                                </ul>
                            </Alert>
                        )}

                        {/* Deck Selection */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                                Deck
                            </Typography>
                            {decks.length === 0 ? (
                                <Box sx={{
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    backgroundColor: 'grey.50'
                                }}>
                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                        Bạn chưa có deck nào. Hãy tạo deck để có thể thêm note.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={handleNavigateToDeckManagement}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 2,
                                        }}
                                    >
                                        Tạo Deck
                                    </Button>
                                </Box>
                            ) : (
                                <FormControl fullWidth size="small" error={!!validationErrors.deck}>
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
                                    {validationErrors.deck && (
                                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                            {validationErrors.deck}
                                        </Typography>
                                    )}
                                </FormControl>
                            )}
                        </Box>

                        {/* Note Form */}
                        <NoteForm
                            noteTypes={noteTypes}
                            formData={formData}
                            imageUrls={imageUrls}
                            autoFillLoading={autoFillLoading}
                            validationErrors={validationErrors}
                            showValidationErrors={showValidationErrors}
                            showRequiredFieldsInfo={true}
                            compactMode={true}
                            onFormDataChange={handleFormDataChange}
                            onImageUrlsChange={setImageUrls}
                            onFileChange={handleFileChange}
                            onAutoFillLoadingChange={setAutoFillLoading}
                            onAutoFill={handleAutoFill}
                            dictionaryData={dictionaryData}
                        />
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
                    onClick={() => {
                        setShowValidationErrors(true);
                        const { isValid, errorCount } = validateForm();
                        if (isValid) {
                            handleSubmit();
                        } else {
                            notify(`Vui lòng điền đầy đủ ${errorCount} trường bắt buộc`, 'error');
                        }
                    }}
                    variant="contained"
                    disabled={loading || decks.length === 0}
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
