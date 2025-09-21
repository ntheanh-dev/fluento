import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Chip,
    Divider,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { dictionaryApi, type DictionaryResponse } from './dictionaryApi';
import { notify } from '../../utils/notify';

const DictionaryLookup: React.FC = () => {
    const [word, setWord] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DictionaryResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [originalWord, setOriginalWord] = useState<string>('');

    const handleLookup = async () => {
        if (!word.trim()) {
            notify('Vui lòng nhập từ cần tra', 'warning');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setOriginalWord(word.trim());

        try {
            const response = await dictionaryApi.lookupWord({ word: word.trim() });
            setResult(response);

            // Check if word was corrected
            if (response.word.toLowerCase() !== word.trim().toLowerCase()) {
                notify(`Từ "${word.trim()}" đã được sửa thành "${response.word}"`, 'info');
            } else {
                notify('Tra từ thành công!', 'success');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi tra từ';
            setError(errorMessage);
            notify(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleLookup();
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Từ Điển Anh - Việt
            </Typography>

            {/* Search Input */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" gap={2} alignItems="center">
                        <TextField
                            fullWidth
                            label="Nhập từ tiếng Anh"
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ví dụ: hello, beautiful, good morning"
                            disabled={loading}
                        />
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                            onClick={handleLookup}
                            disabled={loading || !word.trim()}
                            sx={{ minWidth: 120 }}
                        >
                            {loading ? 'Đang tra...' : 'Tra từ'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Result Display */}
            {result && (
                <Card>
                    <CardContent>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h3" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                {result.word}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                {result.phonetic}
                            </Typography>
                            <Box display="flex" gap={1} sx={{ mb: 2 }}>
                                <Chip label={result.pos} color="primary" variant="outlined" />
                                {result.word.toLowerCase() !== originalWord.toLowerCase() && (
                                    <Chip
                                        label={`Đã sửa từ "${originalWord}"`}
                                        color="warning"
                                        variant="filled"
                                        size="small"
                                    />
                                )}
                                {result.audio && (
                                    <Chip
                                        label="Có phát âm"
                                        color="success"
                                        variant="filled"
                                        size="small"
                                    />
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Nghĩa:
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                                {result.meaning}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Ví dụ:
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1, fontStyle: 'italic' }}>
                                "{result.example}"
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {result.translation}
                            </Typography>
                        </Box>

                        {result.audio && (
                            <Box>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Phát âm:
                                </Typography>
                                <audio controls>
                                    <source src={result.audio} type="audio/mpeg" />
                                    Trình duyệt không hỗ trợ phát âm thanh.
                                </audio>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default DictionaryLookup;
