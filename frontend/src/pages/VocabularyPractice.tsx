import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Fade,
  Slide,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  NavigateNext as NavigateNextIcon,
  PlayArrow as PlayArrowIcon,
  LibraryBooks as LibraryBooksIcon,
  Add as AddIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';

const VocabularyPractice = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <PlayArrowIcon sx={{ fontSize: 40 }} />,
      title: "Bắt đầu học",
      description: "Chọn deck và bắt đầu phiên học với flashcard thông minh",
      buttonText: "Chọn Deck",
      route: "/vocabulary/decks",
      color: "#9C27B0", // Purple
      gradient: "linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)"
    },
    {
      icon: <LibraryBooksIcon sx={{ fontSize: 40 }} />,
      title: "Quản lý bộ thẻ",
      description: "Tạo và quản lý các bộ thẻ từ vựng",
      buttonText: "Quản lý",
      route: "/vocabulary/decks",
      color: "#2196F3", // Blue
      gradient: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)"
    },
    {
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      title: "Thêm từ vựng",
      description: "Thêm từ vựng mới vào bộ thẻ",
      buttonText: "Thêm từ",
      route: "/vocabulary/notes",
      color: "#4CAF50", // Green
      gradient: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)"
    },
  ];

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
        <Typography
          color="text.primary"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Luyện từ vựng
        </Typography>
      </Breadcrumbs>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {features.map((feature, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Fade in={true} timeout={600 + index * 200}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  border: 'none',
                  borderRadius: 3,
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => navigate(feature.route)}
              >
                <CardContent sx={{
                  textAlign: 'center',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Box sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: feature.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}>
                      <Box sx={{ color: 'white' }}>
                        {feature.icon}
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{
                      fontWeight: 'bold',
                      mb: 1.5,
                      color: 'text.primary',
                    }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      mb: 2,
                      lineHeight: 1.5,
                      minHeight: '2.5em', // Đảm bảo chiều cao tối thiểu cho description
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {feature.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      width: '100%',
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      background: feature.gradient,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(feature.route);
                    }}
                  >
                    {feature.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Information Card */}
      <Slide direction="up" in={true} timeout={1200}>
        <Card sx={{
          border: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
              }}>
                <PsychologyIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Phương pháp học thông minh
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
              Hệ thống luyện từ vựng sử dụng thuật toán spaced repetition (SM2) để tối ưu hóa việc ghi nhớ
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  p: 1.5,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}>
                  <TrendingUpIcon sx={{ color: 'primary.main', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '0.85rem' }}>
                      Spaced Repetition
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Ôn tập từ vựng vào đúng thời điểm để tối ưu hóa trí nhớ dài hạn
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  p: 1.5,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}>
                  <StarIcon sx={{ color: 'warning.main', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '0.85rem' }}>
                      AI Phân tích
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Theo dõi tiến độ học tập và điều chỉnh lịch ôn tập
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  p: 1.5,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}>
                  <LibraryBooksIcon sx={{ color: 'info.main', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '0.85rem' }}>
                      Flashcard Thông minh
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Tạo thẻ học từ nhiều loại nội dung khác nhau
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  p: 1.5,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}>
                  <EmojiEventsIcon sx={{ color: 'success.main', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '0.85rem' }}>
                      Theo dõi Tiến độ
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Thống kê chi tiết về số từ đã học và độ thành thạo
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Slide>
    </Container>
  );
};

export default VocabularyPractice; 