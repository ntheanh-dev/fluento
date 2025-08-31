import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { FaBook, FaBrain } from 'react-icons/fa';

const VocabularyPractice = () => {
  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FaBook className="text-4xl text-purple-600" />
          <Typography variant="h3" component="h1" className="font-bold text-gray-800">
            Luyện từ vựng
          </Typography>
          <FaBrain className="text-2xl text-purple-600" />
        </div>
        <Typography variant="h6" className="text-gray-600 max-w-2xl mx-auto">
          Ghi nhớ từ vựng thông minh với AI phân tích tiến độ học tập
        </Typography>
      </Box>

      <Paper className="p-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <Typography variant="h5" className="mb-4 font-semibold text-gray-800">
          Tính năng sắp tới
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Trang luyện từ vựng sẽ được phát triển với các tính năng:
        </Typography>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• Học từ vựng theo chủ đề</li>
          <li>• AI phân tích tiến độ học tập</li>
          <li>• Ôn tập thông minh</li>
          <li>• Theo dõi số từ đã học</li>
          <li>• Bài kiểm tra định kỳ</li>
        </ul>
      </Paper>
    </Container>
  );
};

export default VocabularyPractice; 