import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BookmarkBorder,
  Description,
  Star,
  TrendingUp,
  KeyboardArrowUp,
  KeyboardArrowDown,
  NavigateNext,
  NavigateBefore,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../configs/API';
import type { ApiResponse } from '../types';

// Define the data structure based on the API response
interface WritingHistory {
  id: number;
  conversationId: string;
  user: any;
  sentences: string[]; // Array of Vietnamese sentences
  englishTranslations: Array<{ englishSentence: string }>; // Array of objects with stringified JSON
  topic: {
    id: number;
    name: string;
    description: string;
    writing: any[];
  };
  level: {
    id: number;
    name: string;
    description: string;
    writings: any[];
  };
  sentenceCount: {
    id: number;
    size: number;
    writings: any[];
  };
  createdAt: string;
  updatedAt: string;
}

interface WritingHistoryResponse {
  content: WritingHistory[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Analytic = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // API uses 0-based indexing

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [sortColumn, setSortColumn] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // API data state
  const [writingHistory, setWritingHistory] = useState<WritingHistory[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for statistics (will be replaced with API data later)
  const writingSessionsData = [
    {
      id: 1,
      topic: 'Nhà hàng và đặt món',
      difficulty: 'Trung bình',
      questionCount: 15,
      score: 7.6,
      time: '41 phút 29 giây',
      date: '22/6/2025'
    },
    {
      id: 2,
      topic: 'Giao tiếp trong công việc',
      difficulty: 'Khó',
      questionCount: 20,
      score: 8.2,
      time: '35 phút 15 giây',
      date: '21/6/2025'
    },
    {
      id: 3,
      topic: 'Du lịch và khám phá',
      difficulty: 'Dễ',
      questionCount: 12,
      score: 7.8,
      time: '28 phút 42 giây',
      date: '20/6/2025'
    },
    {
      id: 4,
      topic: 'Học tập và nghiên cứu',
      difficulty: 'Khó',
      questionCount: 25,
      score: 8.5,
      time: '52 phút 18 giây',
      date: '19/6/2025'
    },
    {
      id: 5,
      topic: 'Thể thao và giải trí',
      difficulty: 'Trung bình',
      questionCount: 18,
      score: 7.2,
      time: '38 phút 55 giây',
      date: '18/6/2025'
    }
  ];

  // Fetch writing history data
  const fetchWritingHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get<ApiResponse<WritingHistoryResponse>>('/writings', {
        params: {
          page: currentPage,
          size: rowsPerPage,
          sortBy: sortColumn,
          direction: sortDirection,
          search: debouncedSearchQuery // Add search parameter
        }
      });

      if (response.data.code === 1000 && response.data.result) {
        const data = response.data.result;
        setWritingHistory(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      } else {
        setError('Dữ liệu không hợp lệ từ API');
      }
    } catch (error: any) {
      console.error('Error fetching writing history:', error);
      setError(error?.response?.data?.message || 'Không thể tải dữ liệu lịch sử');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts or parameters change
  useEffect(() => {
    fetchWritingHistory();
  }, [currentPage, rowsPerPage, sortColumn, sortDirection]);

  // Trigger search when debounced search query changes
  useEffect(() => {
    setCurrentPage(0); // Reset to first page when searching
    fetchWritingHistory();
  }, [debouncedSearchQuery]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />;
  };

  const handleRowsPerPageChange = (event: any) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0); // Reset to first page when changing rows per page
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleRowClick = (conversationId: string) => {
    // Navigate to writing detail page
    navigate(`/sentence-writing/${conversationId}`);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'A2':
        return { bg: '#D1FAE5', color: '#065F46' };
      case 'B1':
        return { bg: '#FEF3C7', color: '#92400E' };
      case 'B2':
        return { bg: '#FEE2E2', color: '#991B1B' };
      case 'C1':
        return { bg: '#FCE7F3', color: '#9D174D' };
      case 'C2':
        return { bg: '#E0E7FF', color: '#3730A3' };
      default:
        return { bg: '#F3F4F6', color: '#374151' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter data based on debounced search query (for client-side filtering if needed)
  const filteredData = writingHistory.filter(item =>
    item.topic.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    item.topic.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  // Calculate statistics
  const totalSessions = totalElements;
  const averageScore = writingHistory.length > 0
    ? (writingHistory.reduce((sum, item) => sum + (item.sentences.length || 0), 0) / writingHistory.length).toFixed(1)
    : 0;
  const maxScore = writingHistory.length > 0
    ? Math.max(...writingHistory.map(item => item.sentences.length || 0))
    : 0;

  // Mock data for charts (will be replaced with API data later)
  const practiceFrequencyData = [
    { day: 'CN', value: 1 },
    { day: 'T2', value: 0 },
    { day: 'T3', value: 0 },
    { day: 'T4', value: 0 },
    { day: 'T5', value: 0 },
    { day: 'T6', value: 0 },
    { day: 'T7', value: 0 }
  ];

  const scoreProgressData = [
    { date: '22-06', score: 7.6 }
  ];

  if (error) {
    return (
      <Container maxWidth="lg" className="h-full py-8">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchWritingHistory}
          startIcon={<Refresh />}
        >
          Thử lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="h-full py-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <Typography
        variant="h4"
        component="h1"
        align="center"
        className="font-bold mb-8 text-3xl"
        sx={{
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #8B5CF6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'gradientShift 3s ease-in-out infinite alternate',
          '@keyframes gradientShift': {
            '0%': { filter: 'hue-rotate(0deg)' },
            '100%': { filter: 'hue-rotate(10deg)' }
          }
        }}
      >
        Lịch sử luyện viết
      </Typography>

      {/* Progress Statistics Section */}
      <Box
        className="mb-8 p-6 rounded-2xl shadow-2xl"
        sx={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 25%, #C084FC 50%, #DDD6FE 75%, #EDE9FE 100%)',
          color: 'white',
          boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Typography
          variant="h5"
          className="mb-6 font-bold text-center relative z-10"
          sx={{
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            fontSize: '1.75rem',
            letterSpacing: '0.02em'
          }}
        >
          Thống kê tiến bộ
        </Typography>

        {/* Top Row - Statistic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card
            className="bg-white bg-opacity-95 hover:bg-opacity-100 transition-all duration-500 transform hover:scale-105 hover:-rotate-1"
            sx={{
              boxShadow: '0 15px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(20px)',
              '&:hover': {
                boxShadow: '0 20px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.5)',
                transform: 'translateY(-3px)'
              }
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mr-4 shadow-lg">
                  <Description className="text-purple-600 text-2xl" />
                </div>
                <div>
                  <Typography variant="h3" className="text-purple-800 font-black mb-1 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    {totalSessions}
                  </Typography>
                  <Typography variant="body1" className="text-purple-600 font-semibold text-sm">
                    Tổng bài luyện viết
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white bg-opacity-95 hover:bg-opacity-100 transition-all duration-500 transform hover:scale-105 hover:rotate-1"
            sx={{
              boxShadow: '0 15px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(20px)',
              '&:hover': {
                boxShadow: '0 20px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.5)',
                transform: 'translateY(-3px)'
              }
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mr-4 shadow-lg">
                  <TrendingUp className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <Typography variant="h3" className="text-blue-800 font-black mb-1 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {averageScore}
                  </Typography>
                  <Typography variant="body1" className="text-blue-600 font-semibold text-sm">
                    Số câu trung bình
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white bg-opacity-95 hover:bg-opacity-100 transition-all duration-500 transform hover:scale-105 hover:-rotate-1"
            sx={{
              boxShadow: '0 15px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(20px)',
              '&:hover': {
                boxShadow: '0 20px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.5)',
                transform: 'translateY(-3px)'
              }
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl mr-4 shadow-lg">
                  <Star className="text-yellow-600 text-2xl" />
                </div>
                <div>
                  <Typography variant="h3" className="text-yellow-800 font-black mb-1 bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                    {maxScore}
                  </Typography>
                  <Typography variant="body1" className="text-yellow-600 font-semibold text-sm">
                    Số câu cao nhất
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Paper
            className="p-6 bg-white bg-opacity-25 backdrop-blur-md"
            sx={{
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
                background: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            <Typography variant="h6" className="mb-4 font-bold text-center">
              Tần suất luyện tập
            </Typography>
            <div className="flex items-end justify-between h-36 px-4">
              {practiceFrequencyData.map((item, index) => (
                <div key={index} className="flex flex-col items-center group">
                  <div
                    className="w-10 bg-gradient-to-t from-white to-purple-100 rounded-t-xl transition-all duration-700 hover:bg-gradient-to-t hover:from-purple-200 hover:to-white cursor-pointer"
                    style={{
                      height: `${Math.max(item.value * 100, 8)}px`,
                      minHeight: '8px'
                    }}
                  />
                  <Typography variant="body2" className="mt-3 font-medium group-hover:text-purple-200 transition-colors duration-300">
                    {item.day}
                  </Typography>
                </div>
              ))}
            </div>
          </Paper>

          <Paper
            className="p-6 bg-white bg-opacity-25 backdrop-blur-md"
            sx={{
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
                background: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            <Typography variant="h6" className="mb-4 font-bold text-center">
              Tiến bộ điểm số
            </Typography>
            <div className="flex items-end justify-center h-36 px-4">
              {scoreProgressData.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-white to-purple-200 rounded-full mb-3 shadow-lg animate-pulse" />
                  <Typography variant="body2" className="font-medium">
                    {item.date}
                  </Typography>
                </div>
              ))}
            </div>
          </Paper>
        </div>
      </Box>

      {/* Data Table Section */}
      <Paper
        className="rounded-2xl shadow-lg overflow-hidden"
        sx={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Top Control Bar */}
        <Box className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Search Input */}
              <TextField
                placeholder="Tìm theo chủ đề..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-96"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#7C3AED',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#7C3AED',
                      borderWidth: '2px',
                    },
                  },
                }}
              />

              {/* Refresh Button */}
              <Button
                variant="outlined"
                onClick={fetchWritingHistory}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} /> : <Refresh />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: '#7C3AED',
                  color: '#7C3AED',
                  '&:hover': {
                    borderColor: '#6D28D9',
                    backgroundColor: '#F3F4F6'
                  }
                }}
              >
                {isLoading ? 'Đang tải...' : 'Làm mới'}
              </Button>
            </div>
          </div>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell
                  className="font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('topic')}
                >
                  <div className="flex items-center gap-2">
                    <span>Chủ đề</span>
                    {getSortIcon('topic')}
                  </div>
                </TableCell>

                <TableCell
                  className="font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('level')}
                >
                  <div className="flex items-center gap-2">
                    <span>Độ khó</span>
                    {getSortIcon('level')}
                  </div>
                </TableCell>

                <TableCell
                  className="font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('sentenceCount')}
                >
                  <div className="flex items-center gap-2">
                    <span>Số câu</span>
                    {getSortIcon('sentenceCount')}
                  </div>
                </TableCell>

                <TableCell className="font-semibold">
                  <div className="flex items-center gap-2">
                    <span>Tiến độ</span>
                  </div>
                </TableCell>

                <TableCell
                  className="font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    <span>Ngày tạo</span>
                    {getSortIcon('createdAt')}
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="py-8">
                    <CircularProgress />
                    <Typography className="mt-2">Đang tải dữ liệu...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="py-8">
                    <Typography color="textSecondary">
                      {searchQuery ? 'Không tìm thấy kết quả nào' : 'Không có dữ liệu luyện viết'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => {
                  const difficultyColors = getDifficultyColor(row.level.name);
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => handleRowClick(row.conversationId)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#F1F5F9',
                          transform: 'scale(1.01)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        },
                        borderBottom: '1px solid #E5E7EB',
                        transition: 'all 0.2s ease',
                        '&:active': {
                          transform: 'scale(0.99)',
                          backgroundColor: '#E2E8F0'
                        }
                      }}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{row.topic.description}</div>
                          <div className="text-sm text-gray-500">{row.topic.name}</div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={`${row.level.name} - ${row.level.description}`}
                          size="small"
                          sx={{
                            backgroundColor: difficultyColors.bg,
                            color: difficultyColors.color,
                            fontWeight: 600
                          }}
                        />
                      </TableCell>

                      <TableCell className="font-semibold text-center">
                        {row.sentenceCount.size}
                      </TableCell>

                      <TableCell className="px-4">
                        <Box className="flex flex-col gap-2">
                          <Box className="flex justify-between items-center text-xs text-gray-600">
                            <span>Tiếng Việt: {row.sentences.length}</span>
                            <span>Tiếng Anh: {row.englishTranslations.length}</span>
                          </Box>
                          <Box className="w-full bg-gray-200 rounded-full h-2">
                            <Box
                              className="h-2 rounded-full transition-all duration-300"
                              sx={{
                                width: `${Math.min((row.englishTranslations.length / row.sentences.length) * 100, 100)}%`,
                                background: (() => {
                                  const progress = (row.englishTranslations.length / row.sentences.length) * 100;
                                  if (progress >= 80) return 'linear-gradient(90deg, #10B981 0%, #059669 100%)';
                                  if (progress >= 60) return 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)';
                                  if (progress >= 40) return 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)';
                                  return 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)';
                                })(),
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            className="text-center font-medium"
                            sx={{
                              color: (() => {
                                const progress = (row.englishTranslations.length / row.sentences.length) * 100;
                                if (progress >= 80) return '#059669';
                                if (progress >= 60) return '#D97706';
                                if (progress >= 40) return '#EA580C';
                                return '#DC2626';
                              })()
                            }}
                          >
                            {Math.round((row.englishTranslations.length / row.sentences.length) * 100)}% Hoàn thành
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell className="text-sm">
                        <div>
                          <div>{formatDate(row.createdAt)}</div>
                          <div className="text-gray-500">{formatTime(row.createdAt)}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Bottom Control Bar */}
        <Box className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            {/* Rows per page selector */}
            <div className="flex items-center gap-3">
              <Typography variant="body2" className="text-gray-600">
                Số dòng hiển thị:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#7C3AED',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#7C3AED',
                    },
                  }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" className="text-gray-600">
                {`${currentPage * rowsPerPage + 1}-${Math.min((currentPage + 1) * rowsPerPage, totalElements)} of ${totalElements}`}
              </Typography>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-6">
              <Button
                variant="outlined"
                disabled={currentPage === 0}
                startIcon={<NavigateBefore />}
                onClick={() => setCurrentPage(currentPage - 1)}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: currentPage === 0 ? '#D1D5DB' : '#7C3AED',
                  color: currentPage === 0 ? '#9CA3AF' : '#7C3AED'
                }}
              >
                Trang trước
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-3">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage + 1 ? 'contained' : 'text'}
                      onClick={() => setCurrentPage(page - 1)}
                      sx={{
                        minWidth: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        ...(page === currentPage + 1 && {
                          backgroundColor: '#7C3AED',
                          '&:hover': { backgroundColor: '#6D28D9' }
                        })
                      }}
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    {totalPages > 6 && <span className="px-2">...</span>}
                    <Button
                      variant="text"
                      onClick={() => setCurrentPage(totalPages - 1)}
                      sx={{
                        minWidth: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outlined"
                disabled={currentPage === totalPages - 1}
                endIcon={<NavigateNext />}
                onClick={() => setCurrentPage(currentPage + 1)}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: currentPage === totalPages - 1 ? '#D1D5DB' : '#7C3AED',
                  color: currentPage === totalPages - 1 ? '#9CA3AF' : '#7C3AED'
                }}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </Box>
      </Paper>
    </Container>
  );
};

export default Analytic; 