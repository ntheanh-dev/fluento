import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Help as HelpIcon,
    TrendingUp as TrendingUpIcon,
    Refresh as RefreshIcon,
    School as SchoolIcon,
    LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';
import { type StudySession, type ReviewCardRequest } from './vocabulary';
import { vocabularyStudyApi } from './vocabularyApi';
import { notify } from '../../utils/notify';

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
    const [studySession, setStudySession] = useState<StudySession | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [openStatsDialog, setOpenStatsDialog] = useState(false);

    useEffect(() => {
        loadStudySession();
    }, []);

    const loadStudySession = async () => {
        try {
            setLoading(true);
            const session = await vocabularyStudyApi.getStudySession();
            setStudySession(session);
            setCurrentCardIndex(0);
            setShowAnswer(false);
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
                await loadStudySession();
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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!studySession) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">
                    Không có phiên học nào hiện tại.
                </Alert>
            </Box>
        );
    }

    if (studySession.cardsToStudy.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Không có card nào cần học
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Tất cả cards đã được học hoặc chưa đến thời gian review
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={loadStudySession}
                        >
                            Làm mới
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Phiên Học
                </Typography>
                <Box display="flex" gap={1}>
                    <Tooltip title="Thống kê">
                        <IconButton onClick={() => setOpenStatsDialog(true)}>
                            <LibraryBooksIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Làm mới">
                        <IconButton onClick={loadStudySession}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Progress */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            Tiến độ: {currentCardIndex + 1} / {studySession.cardsToStudy.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {Math.round(progress)}%
                        </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                                {studySession.stats.dueToday}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Cần học hôm nay
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main">
                                {studySession.stats.newToday}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Mới
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main">
                                {studySession.stats.reviewToday}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Ôn tập
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                                {studySession.stats.learnedCards}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Đã học
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Study Card */}
            <Card sx={{ mb: 3, minHeight: 400 }}>
                <CardContent sx={{ p: 4 }}>
                    {currentCard && (
                        <Box>
                            {/* Front of card */}
                            <Box
                                sx={{
                                    minHeight: 200,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    mb: 3,
                                }}
                            >
                                <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                                    {renderTemplate(currentCard.frontTemplate, currentCard.fieldValues)}
                                </Typography>

                                {showAnswer && (
                                    <>
                                        <Box sx={{ width: '100%', height: 1, bgcolor: 'divider', my: 2 }} />
                                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                                            {renderTemplate(currentCard.backTemplate, currentCard.fieldValues)}
                                        </Typography>
                                    </>
                                )}
                            </Box>

                            {/* Action buttons */}
                            <Box display="flex" justifyContent="center" gap={2}>
                                {!showAnswer ? (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleShowAnswer}
                                        sx={{ px: 4 }}
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
                                                    sx={{ minWidth: 120 }}
                                                >
                                                    {getRatingLabel(rating)}
                                                </Button>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Stats Dialog */}
            <Dialog open={openStatsDialog} onClose={() => setOpenStatsDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Thống kê học tập</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary">
                                        {studySession.stats.totalCards}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng cards
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="success.main">
                                        {studySession.stats.learnedCards}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Đã học
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="warning.main">
                                        {studySession.stats.dueToday}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Cần học hôm nay
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="info.main">
                                        {studySession.stats.newToday}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Cards mới
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenStatsDialog(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudySessionPage;
