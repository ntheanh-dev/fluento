import React from 'react';
import {
    Box,
    TextField,
    Typography,
    CircularProgress,
    Button,
    Alert,
    IconButton
} from '@mui/material';
import {
    AutoAwesome as AutoAwesomeIcon,
    VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { type NoteType, type CreateNoteRequest } from '../vocabulary';
import { dictionaryApi } from '../dictionaryApi';
import { notify } from '../../../utils/notify';
import ImageUpload from './ImageUpload';

interface NoteFormProps {
    noteTypes: NoteType[];
    formData: CreateNoteRequest;
    imageUrls: Record<string, string>;
    autoFillLoading: boolean;
    validationErrors: Record<string, string>;
    showValidationErrors: boolean;
    showRequiredFieldsInfo?: boolean;
    compactMode?: boolean; // For QuickAddNoteModal
    onFormDataChange: (data: CreateNoteRequest) => void;
    onImageUrlsChange?: (urls: Record<string, string>) => void;
    onFileChange: (fieldName: string, file: File | null) => void;
    onAutoFillLoadingChange: (loading: boolean) => void;
    onAutoFill?: (word: string) => Promise<void>;
    dictionaryData?: any;
}

const NoteForm: React.FC<NoteFormProps> = ({
    noteTypes,
    formData,
    imageUrls,
    autoFillLoading,
    validationErrors,
    showValidationErrors,
    showRequiredFieldsInfo = true,
    compactMode = false,
    onFormDataChange,
    onImageUrlsChange: _onImageUrlsChange,
    onFileChange,
    onAutoFillLoadingChange,
    onAutoFill,
    dictionaryData
}) => {
    // Helper function to detect image fields
    const isImageField = (fieldName: string): boolean => {
        const imageKeywords = ['image', 'hình ảnh', 'picture', 'photo', 'img'];
        return imageKeywords.some(keyword =>
            fieldName.toLowerCase().includes(keyword)
        );
    };

    const handleAutoFill = async () => {
        // Try to find word in various field names
        const wordField = formData.fieldValues['word'] ||
            formData.fieldValues['Word'] ||
            formData.fieldValues['từ'] ||
            formData.fieldValues['Từ'] ||
            formData.fieldValues['word'] ||
            Object.values(formData.fieldValues).find(value =>
                typeof value === 'string' && value.trim() !== ''
            );

        if (!wordField || typeof wordField !== 'string' || wordField.trim() === '') {
            notify('Vui lòng nhập từ tiếng Anh vào một trường nào đó trước khi auto-fill', 'warning');
            return;
        }

        try {
            onAutoFillLoadingChange(true);
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

                onFormDataChange({ ...formData, fieldValues: newFieldValues });
                notify('Auto-fill thành công!', 'success');
            } else {
                notify('Không tìm thấy thông tin từ điển cho từ này', 'warning');
            }
        } catch (error: any) {
            if (error.response?.data?.code === 1100) {
                notify('Thêm API key để sử dụng tính năng này', 'error');
            } else {
                notify(error, 'error');
            }
        } finally {
            onAutoFillLoadingChange(false);
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

    const currentNoteType = noteTypes.find(nt => nt.id === formData.noteTypeId);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: compactMode ? 2 : 3 }}>
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


            {formData.noteTypeId > 0 && (
                <Box sx={{ mt: compactMode ? 1 : 2 }}>
                    {/* Auto-fill Section */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant={compactMode ? "subtitle2" : "h6"}>
                            Nội dung
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Button
                                variant="outlined"
                                startIcon={autoFillLoading ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                                onClick={() => {
                                    if (onAutoFill) {
                                        // Try to find word in various field names
                                        const wordField = formData.fieldValues['word'] ||
                                            formData.fieldValues['Word'] ||
                                            formData.fieldValues['từ'] ||
                                            formData.fieldValues['Từ'] ||
                                            Object.values(formData.fieldValues).find(value =>
                                                typeof value === 'string' && value.trim() !== ''
                                            );
                                        if (wordField && typeof wordField === 'string') {
                                            onAutoFill(wordField);
                                        } else {
                                            notify('Vui lòng nhập từ tiếng Anh vào một trường nào đó trước khi auto-fill', 'warning');
                                        }
                                    } else {
                                        handleAutoFill();
                                    }
                                }}
                                disabled={autoFillLoading}
                                size={compactMode ? "small" : "medium"}
                                sx={{ fontSize: compactMode ? '0.75rem' : '0.875rem' }}
                            >
                                {autoFillLoading ? 'Đang tải...' : 'Auto-fill'}
                            </Button>
                            {dictionaryData?.audio && (
                                <IconButton
                                    onClick={handlePlayAudio}
                                    size={compactMode ? "small" : "medium"}
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
                    </Box>

                    {!compactMode && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                            Nhập từ tiếng Anh vào trường "word" và nhấn nút này để tự động điền các trường còn lại
                        </Typography>
                    )}

                    {/* Show required fields info */}
                    {showRequiredFieldsInfo && currentNoteType && (() => {
                        const requiredFields = currentNoteType.fields.filter(f => f.isRequired);
                        if (requiredFields.length > 0) {
                            return (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <Typography variant="caption">
                                        <strong>Các trường bắt buộc:</strong> {requiredFields.map(f => f.name).join(', ')}
                                    </Typography>
                                </Alert>
                            );
                        }
                        return null;
                    })()}

                    {/* Fields */}
                    {currentNoteType?.fields.map((field) => {
                        const fieldValue = formData.fieldValues[field.name];

                        if (isImageField(field.name)) {
                            return (
                                <Box key={field.id} sx={{ mt: compactMode ? 1 : 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        {field.name} {field.isRequired && <span style={{ color: 'red' }}>*</span>}
                                    </Typography>
                                    <ImageUpload
                                        value={fieldValue instanceof File ? fieldValue : null}
                                        onChange={(file) => onFileChange(field.name, file)}
                                        onRemove={() => onFileChange(field.name, null)}
                                        imageUrl={imageUrls[field.name]}
                                    />
                                    {validationErrors[field.name] && (
                                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                            {validationErrors[field.name]}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        }

                        return (
                            <TextField
                                key={field.id}
                                fullWidth
                                label={field.name}
                                value={typeof fieldValue === 'string' ? fieldValue : ''}
                                onChange={(e) => onFormDataChange({
                                    ...formData,
                                    fieldValues: {
                                        ...formData.fieldValues,
                                        [field.name]: e.target.value
                                    }
                                })}
                                margin={compactMode ? "dense" : "normal"}
                                multiline={field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('mô tả')}
                                rows={field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('mô tả') ? 3 : 1}
                                required={field.isRequired}
                                error={!!validationErrors[field.name]}
                                helperText={validationErrors[field.name]}
                                size={compactMode ? "small" : "medium"}
                            />
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default NoteForm;
