import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Breadcrumbs,
    Link,
    Container,
    CircularProgress,
    Chip,
    Fade,
    Slide,
    Button,
} from '@mui/material';
import {
    Home as HomeIcon,
    School as SchoolIcon,
    Article as ArticleIcon,
    NavigateNext as NavigateNextIcon,
    Style as FlashcardIcon,
    Keyboard as KeyboardIcon,
    TrendingUp as TrendingUpIcon,
    EmojiEvents as EmojiEventsIcon,
    Schedule as ScheduleIcon,
    Refresh as RefreshIcon,
    Psychology as PsychologyIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { vocabularyStudyApi, vocabularyDeckApi } from '../vocabularyApi';
import { type StudyMode, type StudyModeStats, type Deck } from '../vocabulary';

const StudyModeSelection: React.FC = () => {
    const navigate = useNavigate();
    const { deckId } = useParams<{ deckId: string }>();
    const [stats, setStats] = useState<StudyModeStats | null>(null);
    const [deck, setDeck] = useState<Deck | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (deckId) {
            loadData();
        }
    }, [deckId]);

    const loadData = async () => {
        if (!deckId) return;

        try {
            setLoading(true);
            // Load both deck info and stats in parallel
            const [deckData, statsData] = await Promise.all([
                vocabularyDeckApi.getDeckById(parseInt(deckId)),
                vocabularyStudyApi.getStudyModeStats(parseInt(deckId))
            ]);
            setDeck(deckData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModeSelection = (mode: StudyMode) => {
        // Navigate to study session with selected mode and deck ID
        navigate(`/vocabulary/study?mode=${mode}&deckId=${deckId}`);
    };

    const studyModes = [
        {
            id: 'FLASHCARD' as StudyMode,
            title: 'Flashcard',
            description: 'Ôn tập từ vựng với thẻ ghi nhớ tương tác.',
            icon: <FlashcardIcon />,
            color: '#4CAF50', // Green
        },
        {
            id: 'GUESS_TYPE' as StudyMode,
            title: 'Đoán và Gõ Từ',
            description: 'Nghe audio, đoán và gõ lại từ vựng.',
            icon: <KeyboardIcon />,
            color: '#9C27B0', // Purple
        },
    ];


    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 2 }}>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="40vh"
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 3,
                        color: 'white',
                        p: 4,
                    }}
                >
                    <CircularProgress
                        size={50}
                        sx={{ color: 'white', mb: 2 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Đang tải thống kê học tập...
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'center' }}>
                        Vui lòng chờ trong giây lát
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (!stats) {
        return (
            <Container maxWidth="lg" sx={{ py: 2 }}>
                {/* Breadcrumb */}
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
                    <Typography
                        color="text.primary"
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <ArticleIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        Chế độ học
                    </Typography>
                </Breadcrumbs>

                <Card sx={{
                    textAlign: 'center',
                    py: 4,
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}>
                    <CardContent>
                        <PsychologyIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                            Không thể tải thống kê học tập
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Deck {deckId} không tồn tại hoặc có lỗi xảy ra khi tải dữ liệu
                        </Typography>
                        <Box display="flex" gap={2} justifyContent="center">
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                }}
                                onClick={() => loadData()}
                            >
                                Thử lại
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<SchoolIcon />}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                }}
                                onClick={() => window.location.href = '/vocabulary'}
                            >
                                Quay lại từ vựng
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 1 }}>
            {/* Breadcrumb */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 1.5 }}
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
                    <ArticleIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Chế độ học
                </Typography>
            </Breadcrumbs>

            {/* Header */}
            <Card sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                color: 'text.primary',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                        <Box display="flex" alignItems="center">
                            <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1,
                            }}>
                                <SchoolIcon sx={{ color: 'white', fontSize: 16 }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    {deck ? deck.name : 'Tiến độ học tập'}
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/vocabulary/notes?deckId=${deckId}`)}
                            size="small"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                borderColor: 'warning.main',
                                color: 'warning.main',
                                px: 2,
                                py: 0.5,
                                '&:hover': {
                                    backgroundColor: 'warning.main',
                                    color: 'white',
                                    borderColor: 'warning.main',
                                },
                            }}
                        >
                            Quản lý từ vựng
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Progress Summary Cards */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Fade in={true} timeout={600}>
                        <Card sx={{
                            textAlign: 'center',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderRadius: 2,
                        }}>
                            <CardContent sx={{ p: 1.5 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1,
                                }}>
                                    <TrendingUpIcon sx={{ color: 'white', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.25, color: 'primary.main' }}>
                                    {stats.totalVocabulary}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                    Tổng từ vựng
                                </Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Fade in={true} timeout={800}>
                        <Card sx={{
                            textAlign: 'center',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderRadius: 2,
                        }}>
                            <CardContent sx={{ p: 1.5 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'success.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1,
                                }}>
                                    <EmojiEventsIcon sx={{ color: 'white', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.25, color: 'success.main' }}>
                                    {stats.mastered}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                    Đã thành thạo
                                </Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Fade in={true} timeout={1000}>
                        <Card sx={{
                            textAlign: 'center',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderRadius: 2,
                        }}>
                            <CardContent sx={{ p: 1.5 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'warning.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1,
                                }}>
                                    <ScheduleIcon sx={{ color: 'white', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.25, color: 'warning.main' }}>
                                    {stats.dueForReview}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                    Đến hạn ôn tập
                                </Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
            </Grid>

            {/* Study Modes Section */}
            <Card sx={{
                border: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }}>
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1,
                        }}>
                            <SchoolIcon sx={{ color: 'white', fontSize: 16 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            Chế độ Học Tập
                        </Typography>
                    </Box>

                    <Grid container spacing={1.5}>
                        {studyModes.map((mode, index) => (
                            <Grid key={mode.id} size={{ xs: 12, sm: 6 }}>
                                <Slide direction="up" in={true} timeout={1200 + index * 200}>
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            border: 'none',
                                            borderRadius: 2,
                                            background: 'white',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                                            },
                                        }}
                                        onClick={() => handleModeSelection(mode.id)}
                                    >
                                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                                            <Box sx={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: '50%',
                                                backgroundColor: `${mode.color}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 1.5,
                                                border: `2px solid ${mode.color}`,
                                            }}>
                                                <Box sx={{ color: mode.color, fontSize: 32 }}>
                                                    {mode.icon}
                                                </Box>
                                            </Box>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 'bold',
                                                mb: 1,
                                                color: 'text.primary',
                                            }}>
                                                {mode.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{
                                                mb: 1.5,
                                                lineHeight: 1.4,
                                            }}>
                                                {mode.description}
                                            </Typography>
                                            <Chip
                                                label="Bắt đầu học"
                                                size="small"
                                                sx={{
                                                    backgroundColor: mode.color,
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    px: 1.5,
                                                    py: 0.25,
                                                    fontSize: '0.8rem',
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </Slide>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

        </Container>
    );
};

export default StudyModeSelection;
