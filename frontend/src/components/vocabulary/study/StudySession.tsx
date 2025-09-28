import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    IconButton,
    Tooltip,
    Breadcrumbs,
    Link,
    Container,
    Chip,
    Fade,
    Slide,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Help as HelpIcon,
    TrendingUp as TrendingUpIcon,
    Refresh as RefreshIcon,
    School as SchoolIcon,
    LibraryBooks as LibraryBooksIcon,
    Home as HomeIcon,
    NavigateNext as NavigateNextIcon,
    Psychology as PsychologyIcon,
    Schedule as ScheduleIcon,
    Star as StarIcon,
    EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import { type StudySession, type ReviewCardRequest, type StudyMode } from '../vocabulary';
import { vocabularyStudyApi } from '../vocabularyApi';
import { notify } from '../../../utils/notify';
import { useSearchParams } from 'react-router-dom';
import Flashcard from './Flashcard';
import GuessType from './GuessType';

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

const StudySessionPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [studySession, setStudySession] = useState<StudySession | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [openStatsDialog, setOpenStatsDialog] = useState(false);

    useEffect(() => {
        const mode = searchParams.get('mode') as StudyMode;
        const deckId = searchParams.get('deckId');
        loadStudySession(mode, deckId ? parseInt(deckId) : undefined);
    }, [searchParams]);

    const loadStudySession = async (mode?: StudyMode, deckId?: number) => {
        try {
            setLoading(true);
            const session = await vocabularyStudyApi.getStudySession(mode, deckId);
            setStudySession(session);
            setCurrentCardIndex(0);
            setShowAnswer(false);
            setStartTime(Date.now());
        } catch (error) {
            notify('Lỗi khi tải phiên học', 'error');
        } finally {
            setLoading(false);
        }
    };


    const handleShowAnswer = () => {
        setShowAnswer(true);
    };

    const handleReview = async (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
        if (!studySession || !studySession.cardsToStudy[currentCardIndex]) return;

        try {
            setReviewing(true);
            const reviewTime = Date.now() - startTime;

            const reviewRequest: ReviewCardRequest = {
                cardId: studySession.cardsToStudy[currentCardIndex].id,
                rating,
                reviewTimeMs: Math.round(reviewTime),
            };

            await vocabularyStudyApi.reviewCard(reviewRequest);

            // Move to next card or finish session
            if (currentCardIndex < studySession.cardsToStudy.length - 1) {
                setCurrentCardIndex(currentCardIndex + 1);
                setShowAnswer(false);
                setStartTime(Date.now());
            } else {
                // Session completed
                notify('Hoàn thành phiên học!', 'success');
                const mode = searchParams.get('mode') as StudyMode;
                const deckId = searchParams.get('deckId');
                await loadStudySession(mode, deckId ? parseInt(deckId) : undefined);
            }
        } catch (error) {
            notify('Lỗi khi review card', 'error');
        } finally {
            setReviewing(false);
        }
    };

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'AGAIN': return 'error';
            case 'HARD': return 'warning';
            case 'GOOD': return 'success';
            case 'EASY': return 'info';
            default: return 'default';
        }
    };

    const getRatingLabel = (rating: string) => {
        switch (rating) {
            case 'AGAIN': return 'Quên';
            case 'HARD': return 'Khó';
            case 'GOOD': return 'Tốt';
            case 'EASY': return 'Dễ';
            default: return rating;
        }
    };

    const getRatingIcon = (rating: string) => {
        switch (rating) {
            case 'AGAIN': return <CancelIcon />;
            case 'HARD': return <HelpIcon />;
            case 'GOOD': return <CheckCircleIcon />;
            case 'EASY': return <TrendingUpIcon />;
            default: return null;
        }
    };

    const currentCard = studySession?.cardsToStudy[currentCardIndex];
    const progress = studySession ? ((currentCardIndex + 1) / studySession.cardsToStudy.length) * 100 : 0;

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="60vh"
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 3,
                        color: 'white',
                        p: 4,
                    }}
                >
                    <CircularProgress
                        size={60}
                        sx={{ color: 'white', mb: 2 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Đang tải phiên học...
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Vui lòng chờ trong giây lát
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (!studySession) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Breadcrumb */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 3 }}
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
                    <Typography
                        color="text.primary"
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        Phiên học
                    </Typography>
                </Breadcrumbs>

                <Card sx={{
                    textAlign: 'center',
                    py: 6,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}>
                    <CardContent>
                        <PsychologyIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                            Không có phiên học nào hiện tại
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Hãy tạo một deck từ vựng hoặc thêm cards để bắt đầu học tập
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SchoolIcon />}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                            }}
                            onClick={() => window.location.href = '/vocabulary'}
                        >
                            Đi đến từ vựng
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    if (studySession.cardsToStudy.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Breadcrumb */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 3 }}
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
                    <Typography
                        color="text.primary"
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        Phiên học
                    </Typography>
                </Breadcrumbs>

                <Box sx={{
                    textAlign: 'center',
                    py: 6,
                    border: 'none',
                }}>
                    <EmojiEventsIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                        Tuyệt vời! Bạn đã hoàn thành
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Tất cả cards đã được học hoặc chưa đến thời gian review. Hãy quay lại sau để tiếp tục học tập!
                    </Typography>
                    <Box display="flex" gap={2} justifyContent="center">
                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={<RefreshIcon />}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                            }}
                            onClick={() => {
                                const mode = searchParams.get('mode') as StudyMode;
                                const deckId = searchParams.get('deckId');
                                loadStudySession(mode, deckId ? parseInt(deckId) : undefined);
                            }}
                        >
                            Làm mới
                        </Button>
                        <Button
                            variant="outlined"
                            size="medium"
                            startIcon={<SchoolIcon />}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                            }}
                            onClick={() => window.location.href = '/vocabulary'}
                        >
                            Quay lại từ vựng
                        </Button>
                    </Box>
                </Box>
            </Container>
        );
    }

    // Get current mode from URL params
    const mode = searchParams.get('mode') as StudyMode;

    // Render Flashcard mode if mode is FLASHCARD
    if (mode === 'FLASHCARD') {
        return (
            <Flashcard
                session={studySession}
                currentCardIndex={currentCardIndex}
                showAnswer={showAnswer}
                onShowAnswer={handleShowAnswer}
                onReview={handleReview}
            />
        );
    }

    // Render Guess & Type mode
    if (mode === 'GUESS_TYPE') {
        return (
            <GuessType
                session={studySession}
                currentCardIndex={currentCardIndex}
                onReview={handleReview}
            />
        );
    }

    // Default study session layout for other modes
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumb */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 3 }}
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
                <Typography
                    color="text.primary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Phiên học
                </Typography>
            </Breadcrumbs>

            {/* Header */}
            <Card sx={{
                mb: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Phiên Học
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Học tập hiệu quả với phương pháp spaced repetition
                            </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                            <Tooltip title="Thống kê">
                                <IconButton
                                    onClick={() => setOpenStatsDialog(true)}
                                    sx={{
                                        color: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                    }}
                                >
                                    <LibraryBooksIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Làm mới">
                                <IconButton
                                    onClick={() => {
                                        const mode = searchParams.get('mode') as StudyMode;
                                        const deckId = searchParams.get('deckId');
                                        loadStudySession(mode, deckId ? parseInt(deckId) : undefined);
                                    }}
                                    sx={{
                                        color: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                    }}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Progress */}
            <Card sx={{
                mb: 4,
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: 3,
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <ScheduleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    Tiến độ học tập
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Card {currentCardIndex + 1} / {studySession.cardsToStudy.length}
                                </Typography>
                            </Box>
                        </Box>
                        <Chip
                            label={`${Math.round(progress)}%`}
                            color="primary"
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                px: 2,
                                py: 1,
                            }}
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 6,
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            }
                        }}
                    />
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{
                        textAlign: 'center',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        borderRadius: 3,
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}>
                                <ScheduleIcon sx={{ color: 'white', fontSize: 28 }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                                {studySession.stats.dueToday}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                Cần học hôm nay
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{
                        textAlign: 'center',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        borderRadius: 3,
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                backgroundColor: 'info.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}>
                                <StarIcon sx={{ color: 'white', fontSize: 28 }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'info.main' }}>
                                {studySession.stats.newToday}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                Cards mới
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{
                        textAlign: 'center',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        borderRadius: 3,
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                backgroundColor: 'warning.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}>
                                <PsychologyIcon sx={{ color: 'white', fontSize: 28 }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'warning.main' }}>
                                {studySession.stats.reviewToday}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                Ôn tập
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{
                        textAlign: 'center',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        borderRadius: 3,
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                backgroundColor: 'success.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}>
                                <EmojiEventsIcon sx={{ color: 'white', fontSize: 28 }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>
                                {studySession.stats.learnedCards}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                Đã học
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Study Card */}
            <Card sx={{
                mb: 4,
                minHeight: 500,
                border: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }}>
                <CardContent sx={{ p: 6 }}>
                    {currentCard && (
                        <Fade in={true} timeout={500}>
                            <Box>
                                {/* Front of card */}
                                <Box
                                    sx={{
                                        minHeight: 300,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        mb: 4,
                                        p: 4,
                                        backgroundColor: 'white',
                                        borderRadius: 3,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        component="div"
                                        sx={{
                                            mb: 3,
                                            fontWeight: 'bold',
                                            color: 'text.primary',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {renderTemplate(currentCard.frontTemplate, currentCard.fieldValues)}
                                    </Typography>

                                    {showAnswer && (
                                        <Slide direction="up" in={showAnswer} timeout={300}>
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{
                                                    width: '100%',
                                                    height: 2,
                                                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                    my: 3,
                                                    borderRadius: 1,
                                                }} />
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        mb: 2,
                                                        fontWeight: 'bold',
                                                        color: 'primary.main',
                                                        lineHeight: 1.4,
                                                    }}
                                                >
                                                    {renderTemplate(currentCard.backTemplate, currentCard.fieldValues)}
                                                </Typography>
                                            </Box>
                                        </Slide>
                                    )}
                                </Box>

                                {/* Action buttons */}
                                <Box display="flex" justifyContent="center" gap={3}>
                                    {!showAnswer ? (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={handleShowAnswer}
                                            sx={{
                                                px: 6,
                                                py: 2,
                                                borderRadius: 3,
                                                textTransform: 'none',
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.6)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            Hiển thị đáp án
                                        </Button>
                                    ) : (
                                        <Grid container spacing={2} justifyContent="center">
                                            {['AGAIN', 'HARD', 'GOOD', 'EASY'].map((rating) => (
                                                <Grid key={rating}>
                                                    <Button
                                                        variant="contained"
                                                        color={getRatingColor(rating) as any}
                                                        startIcon={getRatingIcon(rating)}
                                                        onClick={() => handleReview(rating as any)}
                                                        disabled={reviewing}
                                                        sx={{
                                                            minWidth: 140,
                                                            py: 1.5,
                                                            borderRadius: 3,
                                                            textTransform: 'none',
                                                            fontSize: '1rem',
                                                            fontWeight: 'bold',
                                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                            '&:hover': {
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                                            },
                                                            transition: 'all 0.3s ease',
                                                        }}
                                                    >
                                                        {getRatingLabel(rating)}
                                                    </Button>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Box>
                            </Box>
                        </Fade>
                    )}
                </CardContent>
            </Card>

            {/* Stats Dialog */}
            <Dialog
                open={openStatsDialog}
                onClose={() => setOpenStatsDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    py: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                }}>
                    Thống kê học tập
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card sx={{
                                textAlign: 'center',
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                borderRadius: 3,
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        backgroundColor: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                    }}>
                                        <LibraryBooksIcon sx={{ color: 'white', fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                                        {studySession.stats.totalCards}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                        Tổng cards
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card sx={{
                                textAlign: 'center',
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                borderRadius: 3,
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        backgroundColor: 'success.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                    }}>
                                        <EmojiEventsIcon sx={{ color: 'white', fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>
                                        {studySession.stats.learnedCards}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                        Đã học
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card sx={{
                                textAlign: 'center',
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                borderRadius: 3,
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        backgroundColor: 'warning.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                    }}>
                                        <ScheduleIcon sx={{ color: 'white', fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'warning.main' }}>
                                        {studySession.stats.dueToday}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                        Cần học hôm nay
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Card sx={{
                                textAlign: 'center',
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                borderRadius: 3,
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        backgroundColor: 'info.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                    }}>
                                        <StarIcon sx={{ color: 'white', fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'info.main' }}>
                                        {studySession.stats.newToday}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                        Cards mới
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button
                        onClick={() => setOpenStatsDialog(false)}
                        variant="contained"
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                        }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudySessionPage;
