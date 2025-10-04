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
    Close as CloseIcon,
} from '@mui/icons-material';
import { type NoteType, type CreateNoteRequest } from '../vocabulary';
import { dictionaryApi, type DictionaryResponse } from '../dictionaryApi';
import { notify } from '../../../utils/notify';
import ImageUpload from './ImageUpload';

// Helper function to convert byte array to File object
const byteArrayToFile = (audioData: any, filename: string, mimeType: string = 'audio/mpeg'): File => {
    let uint8Array: Uint8Array;

    if (typeof audioData === 'string') {
        // If it's a base64 string, decode it
        const binaryString = atob(audioData);
        uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
    } else if (Array.isArray(audioData)) {
        // If it's an array of numbers
        uint8Array = new Uint8Array(audioData);
    } else {
        throw new Error('Invalid audio data format');
    }

    return new File([uint8Array], filename, { type: mimeType });
};

// Component to display audio file with play button
const AudioFileDisplay: React.FC<{
    file: File;
    onPlay: () => void;
    label: string;
}> = ({ file, onPlay, label }) => (
    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f5f5f5' }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            {label}: {file.name}
        </Typography>
        <IconButton
            onClick={onPlay}
            size="small"
            sx={{
                color: 'primary.main',
                '&:hover': {
                    color: 'primary.dark',
                    transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
            }}
        >
            <VolumeUpIcon fontSize="small" />
        </IconButton>
    </Box>
);

// Component for audio file upload/display
const AudioFileUpload: React.FC<{
    value: File | null;
    onChange: (file: File | null) => void;
    label: string;
    required?: boolean;
    error?: boolean;
    helperText?: string;
}> = ({ value, onChange, label, required, error, helperText }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check if it's an audio file
            if (!file.type.startsWith('audio/')) {
                notify('Vui lòng chọn file audio', 'error');
                return;
            }
            onChange(file);
        }
    };

    const handlePlay = () => {
        if (value) {
            const audioUrl = URL.createObjectURL(value);
            const audio = new Audio(audioUrl);
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                notify(`Không thể phát audio: ${error.message}`, 'error');
            });
            // Clean up the URL after playing
            audio.addEventListener('ended', () => {
                URL.revokeObjectURL(audioUrl);
            });
        }
    };

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                {label} {required && <span style={{ color: 'red' }}>*</span>}
            </Typography>

            {value ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                        {value.name}
                    </Typography>
                    <IconButton
                        onClick={handlePlay}
                        size="small"
                        sx={{
                            color: 'primary.main',
                            '&:hover': {
                                color: 'primary.dark',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <VolumeUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={() => onChange(null)}
                        size="small"
                        sx={{
                            color: 'error.main',
                            '&:hover': {
                                color: 'error.dark',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            ) : (
                <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 2, textAlign: 'center' }}>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id={`audio-upload-${label}`}
                    />
                    <label htmlFor={`audio-upload-${label}`}>
                        <Button
                            component="span"
                            variant="outlined"
                            startIcon={<VolumeUpIcon />}
                            sx={{ cursor: 'pointer' }}
                        >
                            Chọn file audio
                        </Button>
                    </label>
                </Box>
            )}

            {error && helperText && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {helperText}
                </Typography>
            )}
        </Box>
    );
};

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
    dictionaryData?: DictionaryResponse;
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

    // Helper function to detect audio fields
    const isAudioField = (fieldName: string): boolean => {
        const audioKeywords = ['audio', 'âm thanh', 'sound', 'voice', 'speech', 'mp3', 'wav'];
        return audioKeywords.some(keyword =>
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

                if (dictionaryData.example1) {
                    newFieldValues['example1'] = dictionaryData.example1;
                    newFieldValues['ví dụ 1'] = dictionaryData.example1;
                }

                if (dictionaryData.example2) {
                    newFieldValues['example2'] = dictionaryData.example2;
                    newFieldValues['ví dụ 2'] = dictionaryData.example2;
                }

                // Convert audio byte arrays to File objects
                if (dictionaryData.audio && (Array.isArray(dictionaryData.audio) ? dictionaryData.audio.length > 0 : dictionaryData.audio.length > 0)) {
                    const audioFile = byteArrayToFile(dictionaryData.audio, `${dictionaryData.word}_audio.mp3`);
                    newFieldValues['audio'] = audioFile;
                    newFieldValues['âm thanh'] = audioFile;
                }

                if (dictionaryData.audioExample1 && (Array.isArray(dictionaryData.audioExample1) ? dictionaryData.audioExample1.length > 0 : dictionaryData.audioExample1.length > 0)) {
                    const audioFile = byteArrayToFile(dictionaryData.audioExample1, `${dictionaryData.word}_example1_audio.mp3`);
                    newFieldValues['audioExample1'] = audioFile;
                    newFieldValues['âm thanh ví dụ 1'] = audioFile;
                }

                if (dictionaryData.audioExample2 && (Array.isArray(dictionaryData.audioExample2) ? dictionaryData.audioExample2.length > 0 : dictionaryData.audioExample2.length > 0)) {
                    const audioFile = byteArrayToFile(dictionaryData.audioExample2, `${dictionaryData.word}_example2_audio.mp3`);
                    newFieldValues['audioExample2'] = audioFile;
                    newFieldValues['âm thanh ví dụ 2'] = audioFile;
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
        if (dictionaryData?.audio && dictionaryData.audio.length > 0) {
            try {
                const audioFile = byteArrayToFile(dictionaryData.audio, `${dictionaryData.word}_audio.mp3`);
                const audioUrl = URL.createObjectURL(audioFile);
                const audio = new Audio(audioUrl);
                audio.play().catch(error => {
                    console.error('Error playing audio:', error);
                    notify('Không thể phát audio', 'error');
                });
                // Clean up the URL after playing
                audio.addEventListener('ended', () => {
                    URL.revokeObjectURL(audioUrl);
                });
            } catch (error) {
                notify('URL audio không hợp lệ', 'error');
            }
        } else {
            notify('Không có audio cho từ này', 'warning');
        }
    };

    const handlePlayAudioExample1 = () => {
        if (dictionaryData?.audioExample1 && dictionaryData.audioExample1.length > 0) {
            try {
                const audioFile = byteArrayToFile(dictionaryData.audioExample1, `${dictionaryData.word}_example1_audio.mp3`);
                const audioUrl = URL.createObjectURL(audioFile);
                const audio = new Audio(audioUrl);
                audio.play().catch(error => {
                    console.error('Error playing audio example 1:', error);
                    notify('Không thể phát audio ví dụ 1', 'error');
                });
                // Clean up the URL after playing
                audio.addEventListener('ended', () => {
                    URL.revokeObjectURL(audioUrl);
                });
            } catch (error) {
                notify('URL audio ví dụ 1 không hợp lệ', 'error');
            }
        } else {
            notify('Không có audio cho ví dụ 1', 'warning');
        }
    };

    const handlePlayAudioExample2 = () => {
        if (dictionaryData?.audioExample2 && dictionaryData.audioExample2.length > 0) {
            try {
                const audioFile = byteArrayToFile(dictionaryData.audioExample2, `${dictionaryData.word}_example2_audio.mp3`);
                const audioUrl = URL.createObjectURL(audioFile);
                const audio = new Audio(audioUrl);
                audio.play().catch(error => {
                    console.error('Error playing audio example 2:', error);
                    notify('Không thể phát audio ví dụ 2', 'error');
                });
                // Clean up the URL after playing
                audio.addEventListener('ended', () => {
                    URL.revokeObjectURL(audioUrl);
                });
            } catch (error) {
                notify('URL audio ví dụ 2 không hợp lệ', 'error');
            }
        } else {
            notify('Không có audio cho ví dụ 2', 'warning');
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

                    {/* Display audio files from dictionary */}
                    {dictionaryData && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Audio Files từ Dictionary:
                            </Typography>
                            {dictionaryData.audio && (Array.isArray(dictionaryData.audio) ? dictionaryData.audio.length > 0 : dictionaryData.audio.length > 0) && (
                                <AudioFileDisplay
                                    file={byteArrayToFile(dictionaryData.audio, `${dictionaryData.word}_audio.mp3`)}
                                    onPlay={handlePlayAudio}
                                    label="Audio từ chính"
                                />
                            )}
                            {dictionaryData.audioExample1 && (Array.isArray(dictionaryData.audioExample1) ? dictionaryData.audioExample1.length > 0 : dictionaryData.audioExample1.length > 0) && (
                                <AudioFileDisplay
                                    file={byteArrayToFile(dictionaryData.audioExample1, `${dictionaryData.word}_example1_audio.mp3`)}
                                    onPlay={handlePlayAudioExample1}
                                    label="Audio ví dụ 1"
                                />
                            )}
                            {dictionaryData.audioExample2 && (Array.isArray(dictionaryData.audioExample2) ? dictionaryData.audioExample2.length > 0 : dictionaryData.audioExample2.length > 0) && (
                                <AudioFileDisplay
                                    file={byteArrayToFile(dictionaryData.audioExample2, `${dictionaryData.word}_example2_audio.mp3`)}
                                    onPlay={handlePlayAudioExample2}
                                    label="Audio ví dụ 2"
                                />
                            )}
                        </Box>
                    )}

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

                        if (isAudioField(field.name)) {
                            return (
                                <Box key={field.id} sx={{ mt: compactMode ? 1 : 2 }}>
                                    <AudioFileUpload
                                        value={fieldValue instanceof File ? fieldValue : null}
                                        onChange={(file) => onFileChange(field.name, file)}
                                        label={field.name}
                                        required={field.isRequired}
                                        error={!!validationErrors[field.name]}
                                        helperText={validationErrors[field.name]}
                                    />
                                </Box>
                            );
                        }

                        return (
                            <Box key={field.id}>
                                <TextField
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
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default NoteForm;
