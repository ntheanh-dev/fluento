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
} from '@mui/material';
import {
    Home as HomeIcon,
    School as SchoolIcon,
    NavigateNext as NavigateNextIcon,
    Style as FlashcardIcon,
    Keyboard as KeyboardIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { vocabularyStudyApi } from '../vocabularyApi';
import { type StudyMode, type StudyModeStats } from '../vocabulary';

const StudyModeSelection: React.FC = () => {
    const navigate = useNavigate();
    const { deckId } = useParams<{ deckId: string }>();
    const [stats, setStats] = useState<StudyModeStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (deckId) {
            loadStudyModeStats();
        }
    }, [deckId]);

    const loadStudyModeStats = async () => {
        if (!deckId) return;

        try {
            setLoading(true);
            const stats = await vocabularyStudyApi.getStudyModeStats(parseInt(deckId));
            setStats(stats);
        } catch (error) {
            console.error('Error loading study mode stats:', error);
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
            description: 'Ôn tập từ vựng với thẻ ghi nhớ (Flashcard) tương tác.',
            icon: <FlashcardIcon sx={{ fontSize: 40 }} />,
            color: '#4CAF50', // Green
        },
        {
            id: 'GUESS_TYPE' as StudyMode,
            title: 'Đoán và Gõ Từ',
            description: 'Nghe audio, đoán và gõ lại từ vựng.',
            icon: <KeyboardIcon sx={{ fontSize: 40 }} />,
            color: '#9C27B0', // Purple
        },
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!stats) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h6" color="error">
                    Không thể tải thống kê học tập cho deck {deckId}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.
                </Typography>
            </Container>
        );
    }

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
                    Chế độ học
                </Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Tiến độ của bạn
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Chọn phương pháp học phù hợp nhất với bạn. Theo dõi tiến độ và thành thạo từ vựng theo tốc độ của riêng bạn.
                </Typography>
            </Box>

            {/* Progress Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                {stats.totalVocabulary}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tổng từ vựng
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                                {stats.mastered}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Đã thành thạo
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                {stats.dueForReview}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Đến hạn ôn tập
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={4}>
                {/* Left Side - Vocabulary Mastery Progress */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                                Tiến độ Thành thạo Từ vựng
                            </Typography>

                            {/* Mastery Percentage */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {stats.masteryPercentage.toFixed(1)}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Thành thạo
                                </Typography>
                            </Box>

                            {/* Difficulty Distribution */}
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Phân bố Độ khó
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="body2">Đã biết</Typography>
                                    <Typography variant="body2" fontWeight="bold">{stats.difficultyDistribution.known}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="body2">Dễ</Typography>
                                    <Typography variant="body2" fontWeight="bold">{stats.difficultyDistribution.easy}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="body2">Trung bình</Typography>
                                    <Typography variant="body2" fontWeight="bold">{stats.difficultyDistribution.medium}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="body2">Khó</Typography>
                                    <Typography variant="body2" fontWeight="bold">{stats.difficultyDistribution.hard}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="body2">Chưa bắt đầu</Typography>
                                    <Typography variant="body2" fontWeight="bold">{stats.difficultyDistribution.notStarted}</Typography>
                                </Box>
                            </Box>

                            {/* Progress Bar */}
                            <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                                <Box
                                    sx={{
                                        width: `${stats.masteryPercentage}%`,
                                        bgcolor: 'primary.main',
                                        borderRadius: 1,
                                        height: '100%',
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Side - Study Modes */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                                <SchoolIcon sx={{ mr: 1, fontSize: 24 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Chế độ Học
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                {studyModes.map((mode) => (
                                    <Grid key={mode.id} size={{ xs: 12, sm: 6 }}>
                                        <Card
                                            sx={{
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4,
                                                },
                                                border: `2px solid ${mode.color}`,
                                                backgroundColor: `${mode.color}10`,
                                            }}
                                            onClick={() => handleModeSelection(mode.id)}
                                        >
                                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                                                <Box sx={{ color: mode.color, mb: 1 }}>
                                                    {mode.icon}
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {mode.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {mode.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StudyModeSelection;
