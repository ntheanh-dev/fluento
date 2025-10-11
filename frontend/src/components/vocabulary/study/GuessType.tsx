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
    Switch,
    FormControlLabel,
    Divider,
} from '@mui/material';
import {
    VolumeUp as VolumeUpIcon,
    Keyboard as KeyboardIcon,
    Info as InfoIcon,
    NavigateNext as NavigateNextIcon,
    School as SchoolIcon,
    Home as HomeIcon,
    Settings as SettingsIcon,
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
    const example1 = fieldValues.example1 || '';
    const example2 = fieldValues.example2 || '';
    const example1Translation = fieldValues.example1Translation || fieldValues['ví dụ 1'] || '';
    const example2Translation = fieldValues.example2Translation || fieldValues['ví dụ 2'] || '';
    const pos = fieldValues.pos || '';
    const audio = fieldValues.audio || '';
    const audioExample1 = fieldValues.audioExample1 || '';
    const audioExample2 = fieldValues.audioExample2 || '';
    const image = fieldValues.image || '';

    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Settings state with localStorage
    const [settings, setSettings] = useState({
        showPartOfSpeech: true,
        showWordFamily: true,
        showExample1: true,
        showExample2: true,
        showExample1Translation: true,
        showExample2Translation: true,
        showIllustrationImage: true,
    });

    // Load settings from localStorage on component mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('guess-type-settings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                setSettings(prevSettings => ({ ...prevSettings, ...parsedSettings }));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }, []);

    // Save settings to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('guess-type-settings', JSON.stringify(settings));
    }, [settings]);

    const handleSettingChange = (settingName: keyof typeof settings) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [settingName]: !prevSettings[settingName]
        }));
    };


    // Function to play main audio
    const playMainAudio = () => {
        if (audio) {
            const audioElement = new Audio(audio);
            audioElement.play().catch(console.error);
        }
    };

    // Function to play example audio
    const playExampleAudio = (audioUrl: string) => {
        if (audioUrl) {
            const audioElement = new Audio(audioUrl);
            audioElement.play().catch(console.error);
        }
    };

    // Function to play audio sequence
    const playAudioSequence = async () => {
        // Play main word audio first
        if (audio) {
            const audioElement = new Audio(audio);
            await new Promise<void>((resolve) => {
                audioElement.addEventListener('ended', () => resolve());
                audioElement.addEventListener('error', () => resolve());
                audioElement.play().catch(() => resolve());
            });
        }

        // Play example 1 audio after main audio ends
        if (audioExample1) {
            const audioElement1 = new Audio(audioExample1);
            await new Promise<void>((resolve) => {
                audioElement1.addEventListener('ended', () => resolve());
                audioElement1.addEventListener('error', () => resolve());
                audioElement1.play().catch(() => resolve());
            });
        }

        // Play example 2 audio after example 1 ends
        if (audioExample2) {
            const audioElement2 = new Audio(audioExample2);
            await new Promise<void>((resolve) => {
                audioElement2.addEventListener('ended', () => resolve());
                audioElement2.addEventListener('error', () => resolve());
                audioElement2.play().catch(() => resolve());
            });
        }
    };

    useEffect(() => {
        // reset state when card changes
        setAnswer('');
        setSubmitted(false);
    }, [currentCardIndex]);

    // Global keyboard event listener for shortcuts after submission
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (showShortcuts) return;

            switch (e.key) {
                case 'r':
                case 'R':
                    if (submitted) {
                        e.preventDefault();
                        playAudioSequence().catch(console.error);
                    }
                    break;
                case '1':
                    if (submitted) {
                        e.preventDefault();
                        onReview('AGAIN');
                    }
                    break;
                case '2':
                    if (submitted) {
                        e.preventDefault();
                        onReview('HARD');
                    }
                    break;
                case '3':
                    if (submitted) {
                        e.preventDefault();
                        onReview('GOOD');
                    }
                    break;
                case '4':
                    if (submitted) {
                        e.preventDefault();
                        onReview('EASY');
                    }
                    break;
            }
        };

        // Add global event listener
        document.addEventListener('keydown', handleGlobalKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [submitted, showShortcuts, onReview]);

    // Auto-play audio on card load - DISABLED
    // useEffect(() => {
    //     playAudioSequence().catch(console.error);
    // }, [audio, audioExample1, audioExample2, currentCardIndex]);

    const charFeedback = useMemo(() => buildCharFeedback(word, answer), [word, answer]);
    const masked = useMemo(() => maskWord(word), [word]);

    const handleSubmit = () => {
        if (!submitted) {
            setSubmitted(true);
            // Play audio sequence after submitting answer
            playAudioSequence().catch(console.error);
        }
    };

    const shortcuts = [
        { key: 'Enter', action: 'Nộp đáp án' },
        { key: 'R', action: 'Phát âm từ' },
        { key: '1', action: 'Không biết' },
        { key: '2', action: 'Sai nhưng nhớ' },
        { key: '3', action: 'Tốt' },
        { key: '4', action: 'Hoàn hảo' },
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
                playMainAudio();
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
                    <IconButton
                        size="small"
                        onClick={() => setShowSettings(true)}
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,1)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } }}
                    >
                        <SettingsIcon />
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
                                        playMainAudio();
                                    }}
                                    disabled={!audio && !audioExample1 && !audioExample2}
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
                                        {image && (
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
                                            </Box>
                                        )}

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

                                        {/* Example 1 */}
                                        {example1 && settings.showExample1 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            fontStyle: 'italic',
                                                            color: 'text.primary',
                                                            fontSize: { xs: '1.05rem', md: '1.15rem' },
                                                            flex: 1
                                                        }}
                                                    >
                                                        {example1}
                                                    </Typography>
                                                    {audioExample1 && (
                                                        <IconButton
                                                            onClick={() => playExampleAudio(audioExample1)}
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
                                                    )}
                                                </Box>
                                                {example1Translation && settings.showExample1Translation && (
                                                    <Typography
                                                        variant="body1"
                                                        color="primary.main"
                                                        sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' } }}
                                                    >
                                                        {example1Translation}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        {/* Example 2 */}
                                        {example2 && settings.showExample2 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            fontStyle: 'italic',
                                                            color: 'text.primary',
                                                            fontSize: { xs: '1.05rem', md: '1.15rem' },
                                                            flex: 1
                                                        }}
                                                    >
                                                        {example2}
                                                    </Typography>
                                                    {audioExample2 && (
                                                        <IconButton
                                                            onClick={() => playExampleAudio(audioExample2)}
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
                                                    )}
                                                </Box>
                                                {example2Translation && settings.showExample2Translation && (
                                                    <Typography
                                                        variant="body1"
                                                        color="primary.main"
                                                        sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' } }}
                                                    >
                                                        {example2Translation}
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        Không biết
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                                        {currentCard?.nextIntervals?.againInterval || ''}
                                    </Typography>
                                </Box>
                            </Button>
                            <Button
                                variant="contained"
                                color="warning"
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        Sai nhưng nhớ
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                                        {currentCard?.nextIntervals?.hardInterval || ''}
                                    </Typography>
                                </Box>
                            </Button>
                            <Button
                                variant="contained"
                                color="info"
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        Tốt
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                                        {currentCard?.nextIntervals?.goodInterval || ''}
                                    </Typography>
                                </Box>
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        Hoàn hảo
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                                        {currentCard?.nextIntervals?.easyInterval || ''}
                                    </Typography>
                                </Box>
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
                            - Nhấn biểu tượng loa hoặc Ctrl+R để nghe lại âm thanh.
                        </Typography>
                        <Typography variant="body2">
                            - Nhập câu trả lời và nhấn Enter hoặc nút Nộp.
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
                                            Hiển thị loại từ
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị danh từ, động từ, tính từ...
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
                                            Hiển thị từ cùng họ
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
                                        checked={settings.showExample1}
                                        onChange={() => handleSettingChange('showExample1')}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            Hiển thị ví dụ 1
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị câu ví dụ đầu tiên
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Divider sx={{ my: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showExample2}
                                        onChange={() => handleSettingChange('showExample2')}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            Hiển thị ví dụ 2
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị câu ví dụ thứ hai
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Divider sx={{ my: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showExample1Translation}
                                        onChange={() => handleSettingChange('showExample1Translation')}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            Hiển thị dịch ví dụ 1
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị bản dịch tiếng Việt của ví dụ 1
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Divider sx={{ my: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showExample2Translation}
                                        onChange={() => handleSettingChange('showExample2Translation')}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            Hiển thị dịch ví dụ 2
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị bản dịch tiếng Việt của ví dụ 2
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
                                            Hiển thị hình minh họa
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hiển thị hình ảnh minh họa cho từ vựng
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

export default GuessType;
