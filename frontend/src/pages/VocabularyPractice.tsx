import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent, Breadcrumbs, Link } from '@mui/material';
import { FaBook, FaBrain, FaPlay, FaCog, FaPlus, FaList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, School as SchoolIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';

const VocabularyPractice = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaPlay className="text-2xl text-purple-600" />,
      title: "Bắt đầu học",
      description: "Bắt đầu phiên học với flashcard thông minh",
      buttonText: "Học ngay",
      route: "/vocabulary/study",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <FaList className="text-2xl text-blue-600" />,
      title: "Quản lý bộ thẻ",
      description: "Tạo và quản lý các bộ thẻ từ vựng",
      buttonText: "Quản lý",
      route: "/vocabulary/decks",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FaPlus className="text-2xl text-green-600" />,
      title: "Thêm từ vựng",
      description: "Thêm từ vựng mới vào bộ thẻ",
      buttonText: "Thêm từ",
      route: "/vocabulary/notes",
      color: "from-green-500 to-green-600"
    },
  ];

  return (
    <Container maxWidth="lg" className="py-8">
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
      <Grid container spacing={3} className="mb-8">
        {features.map((feature, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card
              className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
              onClick={() => navigate(feature.route)}
            >
              <CardContent className="text-center p-6">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <Typography variant="h6" className="font-semibold mb-2 text-gray-800">
                  {feature.title}
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(feature.route);
                  }}
                >
                  {feature.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Information Card */}
      <Paper className="p-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <Typography variant="h5" className="mb-4 font-semibold text-gray-800">
          Phương pháp học thông minh
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-4">
          Hệ thống luyện từ vựng sử dụng thuật toán spaced repetition (SM2) để tối ưu hóa việc ghi nhớ:
        </Typography>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• <strong>Spaced Repetition:</strong> Ôn tập từ vựng vào đúng thời điểm để tối ưu hóa trí nhớ dài hạn</li>
          <li>• <strong>AI Phân tích:</strong> Theo dõi tiến độ học tập và điều chỉnh lịch ôn tập</li>
          <li>• <strong>Flashcard Thông minh:</strong> Tạo thẻ học từ nhiều loại nội dung khác nhau</li>
          <li>• <strong>Theo dõi Tiến độ:</strong> Thống kê chi tiết về số từ đã học và độ thành thạo</li>
          <li>• <strong>Tùy chỉnh Linh hoạt:</strong> Tạo bộ thẻ theo chủ đề và sở thích cá nhân</li>
        </ul>
      </Paper>
    </Container>
  );
};

export default VocabularyPractice; 