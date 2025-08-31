import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  Button,
  Alert
} from '@mui/material';
import { Send, Email, Phone, LocationOn } from '@mui/icons-material';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Paper elevation={3} className="p-8 h-full bg-gradient-to-br from-primary-50 to-primary-100">
          <Typography variant="h3" component="h1" gutterBottom className="text-primary-800 mb-6">
            Liên hệ với chúng tôi
          </Typography>
          
          <Typography variant="body1" paragraph className="text-primary-700 mb-6">
            Hãy để lại thông tin và tin nhắn của bạn, chúng tôi sẽ phản hồi sớm nhất có thể.
          </Typography>
          
          <Box className="space-y-4">
            <Box className="flex items-center space-x-3">
              <Email className="text-primary-500" />
              <Typography className="text-primary-700">contact@writing-app-fe.com</Typography>
            </Box>
            <Box className="flex items-center space-x-3">
              <Phone className="text-primary-500" />
              <Typography className="text-primary-700">+84 123 456 789</Typography>
            </Box>
            <Box className="flex items-center space-x-3">
              <LocationOn className="text-primary-500" />
              <Typography className="text-primary-700">Hà Nội, Việt Nam</Typography>
            </Box>
          </Box>
        </Paper>
        
        <Paper elevation={3} className="p-8 bg-white">
          {submitted && (
            <Alert severity="success" className="mb-4 bg-primary-50 text-primary-800 border border-primary-200">
              Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Họ và tên"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
              className="text-primary-700"
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
              className="text-primary-700"
            />
            
            <TextField
              fullWidth
              label="Tin nhắn"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              multiline
              rows={4}
              variant="outlined"
              className="text-primary-700"
            />
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Send />}
              className="bg-primary-500 hover:bg-primary-600 text-white w-full"
            >
              Gửi tin nhắn
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Contact; 