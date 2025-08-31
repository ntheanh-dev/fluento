import {
  Box,
  Typography,
  Button,
  Container,
  TextField,
  MenuItem,
  ListSubheader,
} from "@mui/material";
import { Flag, Layers } from "@mui/icons-material";
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

  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [sentenceCount, setSentenceCount] = useState<number>(0);
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

  // Render level options from API data
  const renderLevelOptions = () => {
    return levels.map((level) => (
      <MenuItem key={level.id} value={level.name}>
        <Box className="flex items-center justify-between w-full">
          <Box className="flex items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>
              {level.name === "A2" ? "🌱" :
                level.name === "B1" ? "🌿" :
                  level.name === "B2" ? "🧠" :
                    level.name === "C1" ? "🎯" :
                      level.name === "C2" ? "🏆" : "⭐"}
            </span>
            <Typography variant="body2" style={{ color: COLOR_BLACK, fontWeight: 500 }}>
              {level.description} {`(${level.name})`}
            </Typography>
          </Box>
        </Box>
      </MenuItem>
    ));
  };

  // Render sentence count options from API data
  const renderSentenceCountOptions = () => {
    return sentenceCounts.map((count) => (
      <MenuItem key={count.id} value={count.size}>
        <Box className="flex items-center justify-between w-full">
          <Box className="flex items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>
              {count.size === 10 ? "🌿" :
                count.size === 15 ? "🧠" :
                  count.size === 20 ? "🎯" : "⭐"}
            </span>
            <Typography variant="body2" style={{ color: COLOR_BLACK, fontWeight: 500 }}>
              {count.size} câu
            </Typography>
          </Box>
        </Box>
      </MenuItem>
    ));
  };

  return (
    <Container className="py-10">
      {/* Hero header */}
      <Box className="text-center mb-8 animate-fade-in-up">
        <Typography
          variant="h4"
          className="font-bold tracking-tight"
          style={{ color: COLOR_NAVY }}
        >
          ✨ Tạo bài luyện viết mới
        </Typography>
        <Typography variant="body1" className="mt-2 text-gray-600">
          Chọn chủ đề, mức độ và số câu để bắt đầu luyện tập hiệu quả.
        </Typography>
      </Box>
      {/* Topic-only form */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* Chủ đề luyện tập */}
        <Box
          className="rounded-2xl p-6 shadow-sm flex flex-col gap-3 border bg-white"
          style={{ background: COLOR_GRAY, borderColor: COLOR_GRAY }}
        >
          <Typography
            variant="subtitle1"
            className="font-bold flex items-center gap-2"
            style={{ color: COLOR_NAVY }}
          >
            <Layers fontSize="small" style={{ color: COLOR_ORANGE }} /> Chủ đề
            luyện tập
          </Typography>
          <TextField
            select
            SelectProps={{ displayEmpty: true }}
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-white rounded-lg"
            InputProps={{
              style: {
                background: COLOR_WHITE,
                borderRadius: 8,
                color: COLOR_BLACK,
              },
            }}
            fullWidth
            disabled={isLoadingTopics || topicsError !== null}
            placeholder={isLoadingTopics ? "Đang tải..." : topicsError ? "Lỗi tải dữ liệu" : "Chọn chủ đề"}
          >
            {renderTopicOptions()}
          </TextField>
        </Box>

        {/* Mức độ khó */}
        <Box
          className="rounded-2xl p-6 shadow-sm flex flex-col gap-3 border bg-white"
          style={{ background: COLOR_GRAY, borderColor: COLOR_GRAY }}
        >
          <Typography
            variant="subtitle1"
            className="font-bold flex items-center gap-2"
            style={{ color: COLOR_NAVY }}
          >
            <Flag fontSize="small" style={{ color: COLOR_ORANGE }} /> Mức độ
            khó
          </Typography>
          <TextField
            select
            SelectProps={{ displayEmpty: true }}
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white rounded-lg"
            InputProps={{
              style: {
                background: COLOR_WHITE,
                borderRadius: 8,
                color: COLOR_BLACK,
              },
            }}
            fullWidth
            disabled={isLoadingLevels || levelsError !== null}
            placeholder={isLoadingLevels ? "Đang tải..." : levelsError ? "Lỗi tải dữ liệu" : "Chọn mức độ"}
          >
            {renderLevelOptions()}
          </TextField>
          <Typography variant="body2" className="text-gray-700">
            Lựa chọn số câu AI sẽ tạo ra:
          </Typography>
          <TextField
            select
            SelectProps={{ displayEmpty: true }}
            value={sentenceCount}
            onChange={(e) => setSentenceCount(Number(e.target.value))}
            className="bg-white rounded-lg"
            InputProps={{
              style: {
                background: COLOR_WHITE,
                borderRadius: 8,
                color: COLOR_BLACK,
              },
            }}
            fullWidth
            disabled={isLoadingSentenceCounts || sentenceCountsError !== null}
            placeholder={isLoadingSentenceCounts ? "Đang tải..." : sentenceCountsError ? "Lỗi tải dữ liệu" : "Chọn số câu"}
          >
            {renderSentenceCountOptions()}
          </TextField>
        </Box>
      </Box>

      {/* Nút bắt đầu luyện viết */}
      <Box className="flex justify-center">
        <Button
          variant="contained"
          style={{
            background: `linear-gradient(90deg, ${COLOR_ORANGE} 0%, ${COLOR_NAVY} 100%)`,
            color: COLOR_WHITE,
            borderRadius: 8,
            paddingLeft: 40,
            paddingRight: 40,
            fontWeight: 700,
            fontSize: 18,
            boxShadow: "none",
          }}
          onClick={handleStartWriting}
          disabled={isSubmitting || (!selectedTopic || !selectedLevel || !sentenceCount)}
        >
          Bắt đầu luyện viết
        </Button>
      </Box>

      {/* global overlay handled via App-level Backdrop */}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Writing;
