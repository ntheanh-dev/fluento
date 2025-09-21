import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Breadcrumbs,
    Link,
    Switch,
    FormControlLabel,
    Divider,
    Container,
} from '@mui/material';
import {
    VolumeUp as VolumeUpIcon,
    CheckCircle as CheckCircleIcon,
    AccessTime as AccessTimeIcon,
    Error as ErrorIcon,
    School as SchoolIcon,
    Keyboard as KeyboardIcon,
    Info as InfoIcon,
    NavigateNext as NavigateNextIcon,
    Settings as SettingsIcon,
    Home as HomeIcon,
} from '@mui/icons-material';
import { type StudySession } from '../vocabulary';

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

interface FlashcardProps {
    session: StudySession;
    currentCardIndex: number;
    showAnswer: boolean;
    onShowAnswer: () => void;
    onReview: (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
    session,
    currentCardIndex,
    showAnswer,
    onShowAnswer,
    onReview,
}) => {
    const [searchParams] = useSearchParams();
    const deckId = searchParams.get('deckId');
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Settings state with localStorage
    const [settings, setSettings] = useState({
        showPartOfSpeech: true,
        showWordFamily: true,
        showExample: true,
        showExampleTranslation: true,
        showIllustrationImage: true,
    });

    // Load settings from localStorage on component mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('flashcard-settings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                setSettings(prevSettings => ({ ...prevSettings, ...parsedSettings }));
            } catch (error) {
                console.error('Error parsing settings from localStorage:', error);
            }
        }
    }, []);


    // Save settings to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('flashcard-settings', JSON.stringify(settings));
    }, [settings]);

    // Handle settings change
    const handleSettingChange = (settingKey: keyof typeof settings) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [settingKey]: !prevSettings[settingKey]
        }));
    };

    const currentCard = session.cardsToStudy[currentCardIndex];
    const progress = ((currentCardIndex + 1) / session.cardsToStudy.length) * 100;
    const sessionProgress = ((currentCardIndex + 1) / session.cardsToStudy.length) * 100;

    // Extract data from the card using template rendering
    const frontContent = currentCard ? renderTemplate(currentCard.frontTemplate, currentCard.fieldValues) : '';

    // Extract specific fields from fieldValues
    const fieldValues = currentCard?.fieldValues || {};
    const word = fieldValues.word || frontContent;
    const phonetic = fieldValues.phonetic || '';
    const meaning = fieldValues.meaning || '';
    const translation = fieldValues.translation || '';
    const example = fieldValues.example || '';
    const pos = fieldValues.pos || '';
    const audio = fieldValues.audio || '';
    const image = fieldValues.image || '';

    // Auto-play audio when card loads or flips
    useEffect(() => {
        if (audio) {
            const audioElement = new Audio(audio);
            audioElement.play().catch(console.error);
        }
    }, [audio, showAnswer]);

    const handleKeyPress = (event: KeyboardEvent) => {
        if (showShortcuts) return; // Don't handle shortcuts when dialog is open

        switch (event.key) {
            case ' ':
            case 'Enter':
                event.preventDefault();
                if (!showAnswer) {
                    onShowAnswer();
                }
                break;
            case 'r':
            case 'R':
                event.preventDefault();
                if (audio) {
                    const audioElement = new Audio(audio);
                    audioElement.play().catch(console.error);
                }
                break;
            case '1':
                event.preventDefault();
                if (showAnswer) onReview('AGAIN');
                break;
            case '2':
                event.preventDefault();
                if (showAnswer) onReview('HARD');
                break;
            case '3':
                event.preventDefault();
                if (showAnswer) onReview('GOOD');
                break;
            case '4':
                event.preventDefault();
                if (showAnswer) onReview('EASY');
                break;
            case 's':
            case 'S':
                event.preventDefault();
                setShowSettings(true);
                break;
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [showAnswer, showShortcuts]);

    const shortcuts = [
        { key: 'Space/Enter', action: 'Lật thẻ' },
        { key: 'R', action: 'Phát âm từ' },
        { key: '1', action: 'Đánh dấu Đã biết' },
        { key: '2', action: 'Đánh dấu Dễ' },
        { key: '3', action: 'Đánh dấu Trung bình' },
        { key: '4', action: 'Đánh dấu Khó' },
        { key: 'S', action: 'Cài đặt hiển thị' },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5', position: 'relative' }}>
                {/* Floating Action Buttons */}
                <Box sx={{
                    position: 'absolute',
                    top: 180,
                    right: 16,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}>
                    <IconButton
                        size="small"
                        onClick={() => setShowGuide(true)}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.9)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,1)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }
                        }}
                    >
                        <InfoIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => setShowShortcuts(true)}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.9)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,1)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }
                        }}
                    >
                        <KeyboardIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => setShowSettings(true)}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.9)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,1)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }
                        }}
                    >
                        <SettingsIcon />
                    </IconButton>
                </Box>

                {/* Breadcrumb */}
                <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
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
                            Flashcard
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
                                    backgroundColor: '#4caf50'
                                }
                            }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '50px', textAlign: 'right' }}>
                            {Math.round(sessionProgress)}%
                        </Typography>
                    </Box>
                </Box>


                {/* Main Flashcard */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                    <Card
                        sx={{
                            width: '100%',
                            maxWidth: 450,
                            minHeight: 280,
                            borderRadius: 2,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                            cursor: !showAnswer ? 'pointer' : 'default',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': !showAnswer ? {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            } : {},
                        }}
                        onClick={!showAnswer ? onShowAnswer : undefined}
                    >
                        <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {/* Card Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', mb: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => {
                                            if (audio) {
                                                const audioElement = new Audio(audio);
                                                audioElement.play().catch(console.error);
                                            }
                                        }}
                                        disabled={!audio}
                                    >
                                        <VolumeUpIcon />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Main Content */}
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                {!showAnswer ? (
                                    // Front of card
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 'bold',
                                                mb: 1,
                                                fontSize: { xs: '1.25rem', md: '1.5rem' }
                                            }}
                                        >
                                            {word}
                                        </Typography>
                                        {phonetic && (
                                            <Typography
                                                variant="h6"
                                                color="text.secondary"
                                                sx={{ mb: 1.5 }}
                                            >
                                                {phonetic}
                                            </Typography>
                                        )}

                                        {/* Image/illustration */}
                                        {settings.showIllustrationImage && (
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
                                        )}

                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                            Nhấn để lật thẻ
                                        </Typography>
                                    </Box>
                                ) : (
                                    // Back of card
                                    <Box sx={{ textAlign: 'center', width: '100%' }}>
                                        {/* Word and POS */}
                                        <Box sx={{ mb: 1 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    mb: 0.5,
                                                    color: 'primary.main'
                                                }}
                                            >
                                                {word}
                                            </Typography>
                                            {phonetic && (
                                                <Typography
                                                    variant="body1"
                                                    color="text.secondary"
                                                    sx={{ mb: 0.5 }}
                                                >
                                                    {phonetic}
                                                </Typography>
                                            )}
                                            {pos && settings.showPartOfSpeech && (
                                                <Typography
                                                    variant="body1"
                                                    color="text.secondary"
                                                    sx={{ fontStyle: 'italic' }}
                                                >
                                                    {pos}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Image/illustration */}
                                        {settings.showIllustrationImage && (
                                            <Box
                                                sx={{
                                                    width: 160,
                                                    height: 120,
                                                    borderRadius: 2,
                                                    mb: 1,
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
                                        )}

                                        {/* Meaning */}
                                        {meaning && (
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    mb: 0.5,
                                                    color: 'text.primary'
                                                }}
                                            >
                                                {meaning}
                                            </Typography>
                                        )}

                                        {/* Example */}
                                        {example && settings.showExample && (
                                            <Box sx={{ mb: 1 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontStyle: 'italic',
                                                        mb: 0.5,
                                                        color: 'text.primary'
                                                    }}
                                                >
                                                    {example}
                                                </Typography>
                                                {translation && settings.showExampleTranslation && (
                                                    <Typography
                                                        variant="body2"
                                                        color="primary.main"
                                                    >
                                                        {translation}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                    </Box>
                                )}
                            </Box>

                        </CardContent>
                    </Card>
                </Box>

                {/* Rating Buttons */}
                {showAnswer && (
                    <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
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
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<AccessTimeIcon />}
                                onClick={() => onReview('GOOD')}
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
                                color="error"
                                startIcon={<ErrorIcon />}
                                onClick={() => onReview('HARD')}
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
                                color="info"
                                startIcon={<SchoolIcon />}
                                onClick={() => onReview('AGAIN')}
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
                        </Box>
                    </Box>
                )}


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
                            <strong>Flashcard Mode:</strong> Học từ vựng với thẻ ghi nhớ tương tác.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <strong>Cách sử dụng:</strong>
                        </Typography>
                        <Typography variant="body2" component="div">
                            <ul>
                                <li>Nhấn vào thẻ hoặc phím Space/Enter để lật thẻ</li>
                                <li>Xem nghĩa và ví dụ của từ</li>
                                <li>Đánh giá mức độ khó của từ</li>
                                <li>Hệ thống sẽ lên lịch ôn tập phù hợp</li>
                            </ul>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowGuide(false)}>Đóng</Button>
                    </DialogActions>
                </Dialog>

                {/* Settings Dialog */}
                <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon color="primary" />
                        Cài đặt hiển thị
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ py: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showPartOfSpeech}
                                        onChange={() => handleSettingChange('showPartOfSpeech')}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            Hiển thị từ loại
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị loại từ (danh từ, động từ, tính từ...) trên flashcard
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Divider sx={{ my: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showWordFamily}
                                        onChange={() => handleSettingChange('showWordFamily')}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            Hiển thị họ từ
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị danh sách các từ cùng họ với nghĩa khác nhau
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Divider sx={{ my: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showExample}
                                        onChange={() => handleSettingChange('showExample')}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            Hiển thị ví dụ
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị câu ví dụ sử dụng từ vựng
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Divider sx={{ my: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showExampleTranslation}
                                        onChange={() => handleSettingChange('showExampleTranslation')}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            Hiển thị dịch ví dụ
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị bản dịch tiếng Việt của câu ví dụ
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Divider sx={{ my: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showIllustrationImage}
                                        onChange={() => handleSettingChange('showIllustrationImage')}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            Hiển thị ảnh minh họa
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị ảnh minh họa cho từ vựng trên flashcard
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowSettings(false)}>Đóng</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>

    );
};

export default Flashcard;
