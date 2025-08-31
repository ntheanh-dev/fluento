import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { FaMicrophone, FaComment } from 'react-icons/fa';

const SpeakingPractice = () => {
  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FaMicrophone className="text-4xl text-red-600" />
          <Typography variant="h3" component="h1" className="font-bold text-gray-800">
            Luyện nói Shadowing
          </Typography>
          <FaComment className="text-2xl text-red-600" />
        </div>
        <Typography variant="h6" className="text-gray-600 max-w-2xl mx-auto">
          Luyện phát âm và nói tự nhiên với kỹ thuật shadowing
        </Typography>
      </Box>

      <Paper className="p-8 bg-gradient-to-br from-red-50 to-orange-50">
        <Typography variant="h5" className="mb-4 font-semibold text-gray-800">
          Tính năng sắp tới
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Trang luyện nói shadowing sẽ được phát triển với các tính năng:
        </Typography>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• Kỹ thuật shadowing nâng cao</li>
          <li>• Ghi âm và phân tích phát âm</li>
          <li>• So sánh với audio gốc</li>
          <li>• Bài tập phát âm theo chủ đề</li>
          <li>• Đánh giá độ chính xác phát âm</li>
        </ul>
      </Paper>
    </Container>
  );
};

export default SpeakingPractice; 