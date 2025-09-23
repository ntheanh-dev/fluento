import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    LinearProgress,
    TextField,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Breadcrumbs,
    Link,
    Grid,
} from '@mui/material';
import {
    VolumeUp as VolumeUpIcon,
    Keyboard as KeyboardIcon,
    Info as InfoIcon,
    NavigateNext as NavigateNextIcon,
    School as SchoolIcon,
    Home as HomeIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { type StudySession } from '../vocabulary';
import { useSearchParams } from 'react-router-dom';

// Function to render template with field values
const renderTemplate = (template: string, fieldValues: Record<string, string> | undefined | null): string => {
    if (!template) return '';
    if (!fieldValues) return template;

    let rendered = template;

    // Replace {{FieldName}} with actual field values
    Object.entries(fieldValues).forEach(([fieldName, value]) => {
        const placeholder = `{{${fieldName}}}`;
        rendered = rendered.replace(new RegExp(placeholder, 'g'), value || '');
    });

    return rendered;
};

interface GuessTypeProps {
    session: StudySession;
    currentCardIndex: number;
    onReview: (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => void;
}

const normalize = (text: string) => {
    return (text || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}+/gu, '')
        .replace(/[^a-z0-9\s'-]/g, '')
        .replace(/\s+/g, ' ');
};

// Mask the word: keep first and last letters of each token, mask the rest with •, preserve spaces/punctuations
const maskWord = (value: string): string => {
    if (!value) return '';
    let result = '';
    const isLetter = (ch: string) => /[A-Za-zÀ-ỹ]/.test(ch);

    let tokenStart = -1;
    for (let i = 0; i < value.length; i++) {
        const ch = value[i];
        if (isLetter(ch)) {
            if (tokenStart === -1) tokenStart = i;
            result += '_';
        } else {
            if (tokenStart !== -1) {
                const start = tokenStart;
                const end = i - 1;
                const tokenLen = end - start + 1;
                if (tokenLen >= 1) {
                    // reveal first
                    result = result.substring(0, start) + value[start] + result.substring(start + 1);
                }
                if (tokenLen >= 2) {
                    // reveal last
                    result = result.substring(0, end) + value[end] + result.substring(end + 1);
                }
            }
            tokenStart = -1;
            result += ch;
        }
    }
    if (tokenStart !== -1) {
        const start = tokenStart;
        const end = value.length - 1;
        const tokenLen = end - start + 1;
        if (tokenLen >= 1) {
            result = result.substring(0, start) + value[start] + result.substring(start + 1);
        }
        if (tokenLen >= 2) {
            result = result.substring(0, end) + value[end] + result.substring(end + 1);
        }
    }
    return result;
};

// Build per-character comparison between user's answer and target.
// Returns array of { char, status } where status = 'correct' | 'wrong' | 'neutral'
const buildCharFeedback = (target: string, answer: string): Array<{ char: string; status: 'correct' | 'wrong' | 'neutral' }> => {
    const feedback: Array<{ char: string; status: 'correct' | 'wrong' | 'neutral' }> = [];
    const maxLen = Math.max(target.length, answer.length);
    for (let i = 0; i < maxLen; i++) {
        const t = target[i] ?? '';
        const a = answer[i] ?? '';
        if (!t) {
            // extra typed chars
            feedback.push({ char: a, status: 'wrong' });
            continue;
        }
        // spaces and punctuation considered neutral, show as-is
        if (/[^A-Za-zÀ-ỹ]/.test(t)) {
            feedback.push({ char: t, status: 'neutral' });
            continue;
        }
        if (!a) {
            feedback.push({ char: t, status: 'wrong' });
            continue;
        }
        const ok = normalize(t) === normalize(a);
        feedback.push({ char: t, status: ok ? 'correct' : 'wrong' });
    }
    return feedback;
};

const GuessType: React.FC<GuessTypeProps> = ({ session, currentCardIndex, onReview }) => {
    const [searchParams] = useSearchParams();
    const deckId = searchParams.get('deckId');
    const currentCard = session.cardsToStudy[currentCardIndex];
    const progress = ((currentCardIndex + 1) / session.cardsToStudy.length) * 100;

    const fieldValues = currentCard?.fieldValues || {};
    const word = fieldValues.word || renderTemplate(currentCard?.backTemplate || '', fieldValues);
    const phonetic = fieldValues.phonetic || '';
    const meaning = fieldValues.meaning || '';
    const translation = fieldValues.translation || '';
    const example = fieldValues.example || '';
    const pos = fieldValues.pos || '';
    const audio = fieldValues.audio || '';
    const image = fieldValues.image || '';

    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        // reset state when card changes
        setAnswer('');
        setSubmitted(false);
    }, [currentCardIndex]);

    // Auto-play audio on card load
    useEffect(() => {
        if (audio) {
            const audioElement = new Audio(audio);
            audioElement.play().catch(() => undefined);
        }
    }, [audio, currentCardIndex]);

    const charFeedback = useMemo(() => buildCharFeedback(word, answer), [word, answer]);
    const masked = useMemo(() => maskWord(word), [word]);

    const handleSubmit = () => {
        if (!submitted) {
            setSubmitted(true);
        }
    };

    const shortcuts = [
        { key: 'Enter', action: 'Nộp đáp án' },
        { key: 'R', action: 'Phát âm từ' },
        { key: '1', action: 'Đánh dấu Khó' },
        { key: '2', action: 'Đánh dấu Trung bình' },
        { key: '3', action: 'Đánh dấu Dễ' },
        { key: '4', action: 'Đánh dấu Đã biết' },
        { key: 'S', action: 'Cài đặt hiển thị' },
    ];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showShortcuts) return;
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                handleSubmit();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                const audioElement = new Audio(audio);
                audioElement.play().catch(() => undefined);
                break;

            case '1':
                e.preventDefault();
                if (submitted) onReview('AGAIN');
                break;
            case '2':
                e.preventDefault();
                if (submitted) onReview('HARD');
                break;
            case '3':
                e.preventDefault();
                if (submitted) onReview('GOOD');
                break;
            case '4':
                e.preventDefault();
                if (submitted) onReview('EASY');
                break;
        }

    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ height: '85vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5', position: 'relative' }}>
                {/* Floating buttons */}
                <Box sx={{ position: 'absolute', top: 120, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <IconButton
                        size="small"
                        onClick={() => setShowGuide(true)}
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,1)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } }}
                    >
                        <InfoIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => setShowShortcuts(true)}
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,1)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } }}
                    >
                        <KeyboardIcon />
                    </IconButton>
                </Box>

                {/* Breadcrumb */}
                <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
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
                            href={`/vocabulary/study-mode/decks/${deckId}`}
                            color="inherit"
                            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                        >
                            <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Chế độ học
                        </Link>
                        <Typography
                            color="text.primary"
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Đoán và Gõ Từ
                        </Typography>
                    </Breadcrumbs>
                </Box>

                {/* Header with Progress */}
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '60px' }}>
                            {currentCardIndex + 1}/{session.cardsToStudy.length}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                flex: 1,
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: '#9c27b0'
                                }
                            }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '50px', textAlign: 'right' }}>
                            {Math.round(progress)}%
                        </Typography>
                    </Box>
                </Box>

                {/* Main Quiz Card */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Card sx={{ width: '100%', maxWidth: 640, minHeight: 420, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            {/* Card Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', mb: 1, position: 'absolute', top: 10, right: 10 }}>
                                <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => {
                                        if (audio) {
                                            const audioElement = new Audio(audio);
                                            audioElement.play().catch(() => undefined);
                                        }
                                    }}
                                    disabled={!audio}
                                >
                                    <VolumeUpIcon />
                                </IconButton>
                            </Box>

                            {/* Prompt */}
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 2 }}>

                                {!submitted ? (
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                                        {masked}
                                    </Typography>
                                ) : (
                                    <Box sx={{ mt: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                                            {charFeedback.map((c, idx) => (
                                                <Typography
                                                    key={idx}
                                                    component="span"
                                                    variant='h4'
                                                    sx={{
                                                        px: 0.3,
                                                        borderRadius: 0.5,
                                                        color: c.status === 'neutral' ? 'text.secondary' : c.status === 'correct' ? 'success.main' : 'error.main',
                                                        bgcolor: c.status === 'neutral' ? 'transparent' : c.status === 'correct' ? 'success.light' : 'error.light',
                                                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                                                    }}
                                                >
                                                    {c.char || ' '}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                                {phonetic ? (
                                    <Typography variant="body1" color="text.secondary">{phonetic}</Typography>
                                ) : null}
                                {pos ? (
                                    <Typography variant="body1" color="text.secondary">{pos}</Typography>
                                ) : null}

                                {!submitted ? (
                                    <TextField
                                        autoFocus
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Nhập từ của bạn..."
                                        sx={{ mt: 2, width: '100%', maxWidth: 420 }}
                                    />
                                ) : (
                                    <>
                                        <Box
                                            sx={{
                                                width: 140,
                                                height: 100,
                                                borderRadius: 2,
                                                mb: 1.5,
                                                overflow: 'hidden',
                                                border: '2px solid #e0e0e0',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                position: 'relative',
                                                mx: 'auto'
                                            }}
                                        >
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={word}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        objectPosition: 'center'
                                                    }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                                        if (nextElement) {
                                                            nextElement.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    bgcolor: '#f8f9fa',
                                                    display: image ? 'none' : 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexDirection: 'column',
                                                    gap: 1
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Illustration
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ opacity: 0.7 }}
                                                >
                                                    {word}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {/* Meaning */}
                                        {meaning && (
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    mb: 1,
                                                    color: 'text.primary',
                                                    fontSize: { xs: '1.15rem', md: '1.25rem' }
                                                }}
                                            >
                                                {meaning}
                                            </Typography>
                                        )}

                                        {/* Example */}
                                        {example && (
                                            <Box sx={{ mb: 1 }}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontStyle: 'italic',
                                                        mb: 1,
                                                        color: 'text.primary',
                                                        fontSize: { xs: '1.05rem', md: '1.15rem' }
                                                    }}
                                                >
                                                    {example}
                                                </Typography>
                                                {translation && (
                                                    <Typography
                                                        variant="body1"
                                                        color="primary.main"
                                                        sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' } }}
                                                    >
                                                        {translation}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </>

                                )}

                            </Box>

                            {/* Actions */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, pb: 1 }}>
                                {!submitted && (
                                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!answer.trim()}>
                                        Nộp đáp án
                                    </Button>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                    {submitted && (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<ErrorIcon />}
                                onClick={() => onReview('AGAIN')}
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                ! Khó
                            </Button>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<AccessTimeIcon />}
                                onClick={() => onReview('HARD')}
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 6px 16px rgba(255, 152, 0, 0.4)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                Trung bình
                            </Button>
                            <Button
                                variant="contained"
                                color="info"
                                startIcon={<SchoolIcon />}
                                onClick={() => onReview('GOOD')}
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                Đã biết
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => onReview('EASY')}
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                Dễ
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Shortcuts Dialog */}
                <Dialog open={showShortcuts} onClose={() => setShowShortcuts(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <KeyboardIcon color="error" />
                        Phím tắt
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            {shortcuts.map((shortcut, index) => (
                                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        bgcolor: '#f5f5f5',
                                        borderRadius: 2
                                    }}>
                                        <Typography variant="body2" fontWeight="bold">
                                            {shortcut.key}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {shortcut.action}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowShortcuts(false)}>Đóng</Button>
                    </DialogActions>
                </Dialog>

                {/* Guide Dialog */}
                <Dialog open={showGuide} onClose={() => setShowGuide(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoIcon color="primary" />
                        Hướng dẫn
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" paragraph>
                            <strong>Đoán và Gõ Từ:</strong> Nghe phát âm, gõ lại chính xác từ vựng.
                        </Typography>
                        <Typography variant="body2">
                            - Nhấn biểu tượng loa hoặc phím R để nghe lại âm thanh.
                        </Typography>
                        <Typography variant="body2">
                            - Nhập câu trả lời và nhấn Enter hoặc nút Nộp.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowGuide(false)}>Đóng</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default GuessType;
