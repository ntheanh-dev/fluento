import {
  Box,
  Typography,
  Button,
  Container,
  TextField,
  MenuItem,
  ListSubheader,
  CircularProgress,
  Slider,
} from "@mui/material";
import { Flag, Layers, Settings, PlayArrow, MenuBook } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import { api } from "../configs/API";
import { useNavigate } from "react-router-dom";
import { showOverlay, hideOverlay } from "../utils/overlay";
import type {
  ApiResponse,
  TopicGroup,
  Level,
  SentenceCount,
  WritingGenerationRequest,
  WritingGenerationResponse
} from "../types";

const COLOR_BLACK = "#000000";
const COLOR_NAVY = "#131f38";
const COLOR_ORANGE = "#ffaa13";
const COLOR_GRAY = "#e7e7e7";
const COLOR_WHITE = "#ffffff";

const Writing = () => {
  const navigate = useNavigate();

  const [selectedLevel, setSelectedLevel] = useState<string>("Trung bình");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [sentenceCount, setSentenceCount] = useState<number>(5);
  const [selectedTone, setSelectedTone] = useState<string>("Hội thoại");
  const [selectedTextType, setSelectedTextType] = useState<string>("Tự sự");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  // New state for API data
  const [topicGroups, setTopicGroups] = useState<TopicGroup[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  // New state for levels API data
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState(true);
  const [levelsError, setLevelsError] = useState<string | null>(null);

  // New state for sentence counts API data
  const [sentenceCounts, setSentenceCounts] = useState<SentenceCount[]>([]);
  const [isLoadingSentenceCounts, setIsLoadingSentenceCounts] = useState(true);
  const [sentenceCountsError, setSentenceCountsError] = useState<string | null>(null);

  // Fetch topic groups from API
  useEffect(() => {
    const fetchTopicGroups = async () => {
      try {
        setIsLoadingTopics(true);
        setTopicsError(null);

        const response = await api.get<ApiResponse<TopicGroup[]>>("/topicGroups");

        if (response.data.code === 1000 && response.data.result) {
          setTopicGroups(response.data.result);

          // Set default selected topic if available
          if (response.data.result.length > 0 && response.data.result[0].topics.length > 0) {
            setSelectedTopic(response.data.result[0].topics[0].name);
          }
        } else {
          setTopicsError("Dữ liệu không hợp lệ từ API");
        }
      } catch (error: any) {
        console.error("Error fetching topic groups:", error);
        setTopicsError(error?.response?.data?.message || "Không thể tải danh sách chủ đề");
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchTopicGroups();
  }, []);

  // Fetch levels from API
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setIsLoadingLevels(true);
        setLevelsError(null);

        const response = await api.get<ApiResponse<Level[]>>("/levels");

        if (response.data.code === 1000 && response.data.result) {
          setLevels(response.data.result);

          // Set default selected level if available
          if (response.data.result.length > 0) {
            setSelectedLevel(response.data.result[0].name);
          }
        } else {
          setLevelsError("Dữ liệu không hợp lệ từ API");
        }
      } catch (error: any) {
        console.error("Error fetching levels:", error);
        setLevelsError(error?.response?.data?.message || "Không thể tải danh sách mức độ");
      } finally {
        setIsLoadingLevels(false);
      }
    };

    fetchLevels();
  }, []);

  // Fetch sentence counts from API
  useEffect(() => {
    const fetchSentenceCounts = async () => {
      try {
        setIsLoadingSentenceCounts(true);
        setSentenceCountsError(null);

        const response = await api.get<ApiResponse<SentenceCount[]>>("/sentenceCounts");

        if (response.data.code === 1000 && response.data.result) {
          setSentenceCounts(response.data.result);

          // Set default selected sentence count if available
          if (response.data.result.length > 0) {
            setSentenceCount(response.data.result[0].size);
          }
        } else {
          setSentenceCountsError("Dữ liệu không hợp lệ từ API");
        }
      } catch (error: any) {
        console.error("Error fetching sentence counts:", error);
        setSentenceCountsError(error?.response?.data?.message || "Không thể tải danh sách số câu");
      } finally {
        setIsLoadingSentenceCounts(false);
      }
    };

    fetchSentenceCounts();
  }, []);

  // Topic-only flow: no custom input

  const handleStartWriting = async () => {
    try {
      setIsSubmitting(true);
      showOverlay({ message: "Đang tạo bài luyện viết..." });

      const payload: WritingGenerationRequest = {
        level: selectedLevel,
        topic: selectedTopic,
        language: "vietnamese",
        sentenceCount: sentenceCount
      };

      const response = await api.post<ApiResponse<WritingGenerationResponse>>("/writings/generate", payload);

      const conversationId = response.data.result?.conversationId;
      if (conversationId) {
        navigate(`/sentence-writing/${conversationId}`);
      } else {
        setSnackbar({ open: true, message: "Có lỗi xảy ra. Vui lòng thử lại.", severity: "error" });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setIsSubmitting(false);
      hideOverlay();
    }
  };

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  // Render topic options from API data
  const renderTopicOptions = () => {
    return topicGroups.map((group) => [
      <ListSubheader key={group.id} style={{
        backgroundColor: COLOR_GRAY,
        color: COLOR_NAVY,
        fontWeight: 600,
        fontSize: '0.875rem'
      }}>
        {group.name}
      </ListSubheader>,
      group.topics.map((topic) => (
        <MenuItem key={topic.id} value={topic.name}>
          <Box className="flex flex-col">
            <Typography variant="body2" style={{ color: COLOR_BLACK, fontWeight: 500 }}>
              {topic.description}
            </Typography>
            <Typography variant="caption" style={{ color: "#666", fontStyle: 'italic' }}>
              {topic.name}
            </Typography>
          </Box>
        </MenuItem>
      )),
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <Container maxWidth="lg">
        {/* Hero Header */}
        <Box className="text-center mb-16">
          {/* Icon with enhanced styling */}
          <Box className="flex justify-center mb-8">
            <Box className="w-20 h-20 bg-gradient-to-br from-white to-blue-50 rounded-full shadow-xl flex items-center justify-center border border-blue-100 transform hover:scale-105 transition-all duration-300">
              <MenuBook className="text-blue-600 text-4xl drop-shadow-sm" />
            </Box>
          </Box>

          {/* Main Title with enhanced typography */}
          <Typography
            variant="h3"
            className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 mb-6 text-5xl md:text-6xl lg:text-7xl tracking-tight"
          >
            AI English Learning
          </Typography>

          {/* Subtitle with enhanced styling */}
          <Typography
            variant="h6"
            className="text-gray-600 font-medium mx-auto leading-relaxed text-lg md:text-xl px-4"
            sx={{
              background: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Luyện tập dịch tiếng Anh với sự hỗ trợ của AI. Chọn cấu hình bài luyện tập
            phù hợp với trình độ của bạn.
          </Typography>
        </Box>

        {/* Main Configuration Card */}
        <Box className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto">
          {/* Card Header */}
          <Box className="flex items-center gap-3 mb-8">
            <Settings className="text-blue-600 text-2xl" />
            <Typography variant="h5" className="font-bold text-gray-800">
              Cấu hình bài luyện
            </Typography>
          </Box>

          <Box className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <Box className="space-y-6">
              {/* Topic Selection */}
              <Box>
                <Typography variant="h6" className="font-semibold text-gray-800 mb-3">
                  Chủ đề
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  placeholder="Chọn chủ đề..."
                  className="bg-gray-50 rounded-xl"
                  InputProps={{
                    style: { borderRadius: 12 }
                  }}
                >
                  {renderTopicOptions()}
                </TextField>
              </Box>

              {/* Sentence Count Slider */}
              <Box>
                <Typography variant="h6" className="font-semibold text-gray-800 mb-3">
                  Số câu
                </Typography>
                {isLoadingSentenceCounts ? (
                  <Box className="flex justify-center py-8">
                    <CircularProgress size={24} />
                  </Box>
                ) : sentenceCountsError ? (
                  <Typography variant="body2" className="text-red-500 text-center py-4">
                    {sentenceCountsError}
                  </Typography>
                ) : sentenceCounts.length > 0 ? (
                  <>
                    <Box className="px-4">
                      <Slider
                        value={sentenceCount}
                        onChange={(_, value) => setSentenceCount(value as number)}
                        min={Math.min(...sentenceCounts.map(s => s.size))}
                        max={Math.max(...sentenceCounts.map(s => s.size))}
                        step={1}
                        marks={sentenceCounts.map(count => ({
                          value: count.size,
                          label: `${count.size} câu`
                        }))}
                        sx={{
                          '& .MuiSlider-markLabel': {
                            color: sentenceCounts.some(s => s.size === sentenceCount) ? '#3b82f6' : '#6b7280',
                            fontWeight: sentenceCounts.some(s => s.size === sentenceCount) ? 600 : 400
                          },
                          '& .MuiSlider-track': {
                            backgroundColor: '#3b82f6'
                          },
                          '& .MuiSlider-thumb': {
                            backgroundColor: '#3b82f6'
                          }
                        }}
                      />
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" className="text-gray-500 text-center py-4">
                    Không có dữ liệu số câu
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Right Column */}
            <Box className="space-y-6">
              {/* Difficulty Level */}
              <Box>
                <Typography variant="h6" className="font-semibold text-gray-800 mb-3">
                  Độ khó
                </Typography>
                {isLoadingLevels ? (
                  <Box className="flex justify-center py-8">
                    <CircularProgress size={24} />
                  </Box>
                ) : levelsError ? (
                  <Typography variant="body2" className="text-red-500 text-center py-4">
                    {levelsError}
                  </Typography>
                ) : levels.length > 0 ? (
                  <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {levels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedLevel(level.name)}
                        className={`py-4 px-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${selectedLevel === level.name
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Typography variant="body2" className="font-medium text-center">
                          {level.description}
                        </Typography>
                      </button>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" className="text-gray-500 text-center py-4">
                    Không có dữ liệu mức độ
                  </Typography>
                )}
              </Box>

              {/* Tone/Style Selection */}
              <Box>
                <Typography variant="h6" className="font-semibold text-gray-800 mb-3">
                  Ngữ điệu
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="bg-gray-50 rounded-xl"
                  InputProps={{
                    style: { borderRadius: 12 }
                  }}
                >
                  {["Hội thoại", "Trang trọng", "Thân thiện", "Chuyên nghiệp"].map((tone) => (
                    <MenuItem key={tone} value={tone}>
                      {tone}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          </Box>

          {/* Text Type Selection - Full Width */}
          <Box className="mt-8">
            <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
              Loại văn bản
            </Typography>
            <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "Tự sự", label: "Tự sự", subtitle: "Kể chuyện, tường thuật" },
                { value: "Mô tả", label: "Mô tả", subtitle: "Miêu tả sự vật, hiện tượng" },
                { value: "Nghị luận", label: "Nghị luận", subtitle: "Tranh luận, thuyết phục" },
                { value: "Thông tin", label: "Thông tin", subtitle: "Cung cấp thông tin" }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedTextType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${selectedTextType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <Typography variant="body2" className="font-semibold text-gray-800 mb-1">
                    {type.label}
                  </Typography>
                  <Typography variant="caption" className="text-gray-600">
                    {type.subtitle}
                  </Typography>
                </button>
              ))}
            </Box>
          </Box>

          {/* Action Button */}
          <Box className="flex justify-center mt-10">
            <button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
              onClick={handleStartWriting}
              disabled={isSubmitting || (!selectedTopic || !selectedLevel || !sentenceCount)}
            >
              <PlayArrow className="text-xl" />
              Bắt đầu luyện tập
            </button>
          </Box>
        </Box>
      </Container>

      {/* global overlay handled via App-level Backdrop */}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Writing;
