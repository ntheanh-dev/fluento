import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { FaHeadphones } from 'react-icons/fa';

const ListeningPractice = () => {
  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FaHeadphones className="text-4xl text-red-600" />
          <Typography variant="h3" component="h1" className="font-bold text-gray-800">
            Luyện nghe
          </Typography>
          <FaHeadphones className="text-2xl text-red-600" />
        </div>
        <Typography variant="h6" className="text-gray-600 max-w-2xl mx-auto">
          Phát triển kỹ năng nghe hiểu với audio clips và transcript
        </Typography>
      </Box>

      <Paper className="p-8 bg-gradient-to-br from-red-50 to-orange-50">
        <Typography variant="h5" className="mb-4 font-semibold text-gray-800">
          Tính năng sắp tới
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Trang luyện nghe sẽ được phát triển với các tính năng:
        </Typography>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• Audio clips theo chủ đề</li>
          <li>• Transcript chi tiết</li>
          <li>• Bài tập nghe hiểu</li>
          <li>• Điều chỉnh tốc độ phát</li>
          <li>• Theo dõi tiến độ nghe</li>
        </ul>
      </Paper>
    </Container>
  );
};

export default ListeningPractice; 