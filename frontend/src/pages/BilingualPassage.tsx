import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../configs/API';
import { showOverlay, hideOverlay } from '../utils/overlay';
import { notify } from '../utils/notify';
import { FaPen, FaLightbulb, FaCheck, FaComment, FaThumbsUp, FaHome, FaChartBar, FaHeadphones } from 'react-icons/fa';
import type { TranslationHintsResponse, TranslationCheckResponse, ApiResponse, SentenceCreationResponse, Sentence } from '../types/api';

const BilingualPassage = () => {
  const [translation, setTranslation] = useState('');
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [vietNameseSentences, setVietNameseSentences] = useState<string[]>([]);
  const [englishTranslations, setEnglishTranslations] = useState<Sentence[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>('');
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentTone, setCurrentTone] = useState<string>('');

  // New state for translation hints
  const [translationHints, setTranslationHints] = useState<TranslationHintsResponse | null>(null);
  const [showHints, setShowHints] = useState(false);

  // New state for translation check
  const [translationCheck, setTranslationCheck] = useState<TranslationCheckResponse | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Calculate average score from englishTranslations
  const calculateAverageScore = () => {
    if (englishTranslations.length === 0) return 0;
    const totalScore = englishTranslations.reduce((sum, sentence) => sum + sentence.score, 0);
    return Math.round(totalScore / englishTranslations.length);
  };

  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) return;
      try {
        showOverlay({ message: 'Đang tải dữ liệu...' });
        const response = await api.get(`/writings/${conversationId}`);
        const data = response.data?.result || {};

        setVietNameseSentences(data.vietNamesesentences || []);
        setEnglishTranslations(data.englishSentences || []);
        setCurrentLevel(data.level?.name || '');
        setCurrentTopic(data.topic?.description || '');
        setCurrentTone(data.tone?.name || '');

        if (data.englishSentences.length === data.vietNamesesentences.length) {
          setShowCompletionOverlay(true);
        }

      } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.';
        notify(message, 'error');
      } finally {
        hideOverlay();
      }
    };
    fetchConversation();
  }, [conversationId]);

  // Function to call translation hints API
  const handleGetTranslationHints = async () => {
    showOverlay({ message: 'Đang tải gợi ý dịch thuật...' });
    try {
      const response = await api.post(`/writings/${conversationId}/translation-hints`, {
        vietnameseSentence: vietNameseSentences[englishTranslations.length]
      });

      if (response.data?.code === 1000) {
        setTranslationHints(response.data.result);
        setShowHints(true);
        setShowCheck(false); // Hide check results when showing hints
      } else {
        notify('Không thể tải gợi ý dịch thuật. Vui lòng thử lại.', 'error');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể tải gợi ý dịch thuật. Vui lòng thử lại.';
      notify(message, 'error');
    } finally {
      hideOverlay();
    }
  };

  // Function to clean and format translation text
  const formatTranslationText = (text: string): string => {
    let cleaned = text.trim();

    // Remove multiple spaces between words
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Add punctuation if missing
    if (cleaned && !/[.!?]$/.test(cleaned)) {
      cleaned = cleaned + ".";
    }

    // Capitalize first letter of each sentence
    cleaned = cleaned.replace(/(^|\.\s+)([a-z])/g, (match, p1, p2) => {
      return p1 + p2.toUpperCase();
    });

    return cleaned;
  };

  // Function to call translation check API
  const handleCheckTranslation = async () => {
    if (!translation.trim()) {
      return;
    }

    showOverlay({ message: 'Đang kiểm tra bản dịch...' });
    try {
      // Clean and format the translation text
      const cleanedTranslation = formatTranslationText(translation);

      const response = await api.post<ApiResponse<TranslationCheckResponse>>(`/writings/${conversationId}/translate`, {
        vietnameseSentence: vietNameseSentences[englishTranslations.length],
        englishSentence: cleanedTranslation
      });

      console.log(response.data.result);

      if (response.data?.code === 1000) {
        setTranslationCheck(response.data.result);
        setShowCheck(true);
        setShowHints(false); // Hide hints when showing check results

      } else {
        notify('Không thể kiểm tra bản dịch. Vui lòng thử lại.', 'error');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể kiểm tra bản dịch. Vui lòng thử lại.';
      notify(message, 'error');
    } finally {
      hideOverlay();
    }
  };

  const handleNextSentence = async () => {

    showOverlay({ message: '' });

    try {
      // Clean and format the translation text
      const cleanedTranslation = formatTranslationText(translation);

      // Get feedback and score
      const strengths = translationCheck?.feedback?.strengths ?? [];
      const weaknesses = translationCheck?.feedback?.weaknesses ?? [];
      const feedback = [...strengths, ...weaknesses].join(' ');
      const score = translationCheck?.score || 0;

      const payload: SentenceCreationResponse = {
        englishTranslation: cleanedTranslation,
        vietnamese: vietNameseSentences[englishTranslations.length],
        conversationId: conversationId || '',
        score: score,
        feedback: feedback,
        orderIndex: englishTranslations.length
      };

      await api.post("/sentences", payload);

      setShowCheck(false);
      setShowHints(false);
      setEnglishTranslations(sentences => [...sentences, { englishTranslation: cleanedTranslation, vietnamese: vietNameseSentences[englishTranslations.length], score: score, feedback: feedback }]);
      setTranslation('');

      // Check if this was the last sentence
      if (englishTranslations.length + 1 >= vietNameseSentences.length) {
        setShowCompletionOverlay(true);
      }

    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể lưu bản dịch. Vui lòng thử lại.';
      notify(message, 'error');
    } finally {
      hideOverlay();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex gap-4 h-full">
          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-200 flex-shrink-0 shadow-lg">
              {/* Main Content Row */}
              <div className="flex items-center justify-between mb-4">
                {/* Main Title - Left Side */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-blue-700 leading-tight max-w-2xl">
                    {currentTopic || 'Loading topic...'}
                  </h1>
                  <div className="text-lg font-medium text-blue-600/80 mt-1">
                    Level: {currentLevel || 'Loading level...'} - Tone: {currentTone || 'Loading tone...'}
                  </div>
                </div>

                {/* Metrics - Right Side */}
                <div className="flex items-center gap-6">


                  {/* Progress */}
                  <div className="text-right">
                    <div className="text-gray-700 text-sm font-medium">
                      Tiến độ: {englishTranslations.length}/{vietNameseSentences.length} câu
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar - Below */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700 ease-out rounded-full shadow-sm relative"
                  style={{
                    width: `${vietNameseSentences.length > 0 ? ((englishTranslations.length / vietNameseSentences.length) * 100) : 0}%`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Vietnamese Text */}
            <div className="p-4 flex-1 overflow-hidden">
              <div className=" p-4 h-full overflow-y-auto relative">
                <div className="leading-7 text-base text-gray-800">
                  {vietNameseSentences.map((sentence, index) => (
                    <React.Fragment key={index}>
                      {index <= englishTranslations.length - 1 ? (
                        // Completed sentences - show English translation
                        <span key={index} className="relative inline">
                          <span className="text-black py-1 font-bold">
                            {" " + englishTranslations[index]?.englishTranslation}
                          </span>
                        </span>
                      ) : (
                        // Current and upcoming sentences
                        index === englishTranslations.length ? (
                          // Current sentence to translate
                          <span key={index} className="relative inline">
                            <span className="py-2 text-blue-600 font-bold">
                              {" " + sentence}
                            </span>
                          </span>
                        ) : (
                          // Upcoming sentences
                          <span key={index} className="relative inline">
                            <span className="text-gray-600 opacity-60">
                              {" " + sentence}
                            </span>
                          </span>
                        )
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Translation Input */}
            <div className="px-4 mb-4">
              <div className="relative">
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  variant="outlined"
                  placeholder="Nhập bản dịch của bạn..."
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="bg-white"
                  InputProps={{
                    style: {
                      borderRadius: 16,
                      borderColor: '#E5E7EB',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      padding: '16px',
                      paddingRight: '48px',
                      overflow: 'auto',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-line',
                    }
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4">
              <div className="flex gap-4 justify-center">
                <button
                  className="w-52 py-3.5 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base border-0"
                  onClick={handleGetTranslationHints}
                >
                  💡 Xem gợi ý
                </button>

                {showCheck && translationCheck ? (
                  // Check if there are no errors in corrections
                  (translationCheck.corrections.spellingMistakes.length === 0 &&
                    translationCheck.corrections.grammarErrors.length === 0 &&
                    translationCheck.corrections.sentenceStructure.length === 0) ? (
                    // No errors - show "Tiếp tục" button
                    <button
                      className="w-52 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base border-0"
                      onClick={handleNextSentence}
                    >
                      ✓ Tiếp tục
                    </button>
                  ) : (
                    // Has errors - show "Viết lại" button
                    <button
                      className="w-52 py-3.5 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base border-0"
                      onClick={handleCheckTranslation}
                    >
                      ✏️ Viết lại
                    </button>
                  )
                ) : (
                  // Default state - show "Kiểm tra" button
                  <button
                    className="w-52 py-3.5 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base border-0"
                    onClick={handleCheckTranslation}
                  >
                    🔍  Kiểm tra
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          <div className="w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
              <Typography variant="h6" className="font-bold text-gray-800 text-base">
                Trợ lý học tập AI của bạn
              </Typography>
              <Button
                variant="outlined"
                size="small"
                className="text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-3 py-1 rounded-lg text-sm font-medium"
                startIcon={<FaComment className="text-sm" />}
                onClick={() => {
                  window.open('https://www.facebook.com/share/g/1PMDRoCfK7/?mibextid=wwXIfr', '_blank');
                }}
              >
                Góp ý
              </Button>
            </div>

            {/* Content Area - Shows either instructions, translation hints, or translation check */}
            <div className="p-4 flex-1 overflow-y-auto">
              {showCheck && translationCheck ? (
                // Translation Check Display
                <div className="space-y-4">
                  {/* Header with gradient background */}
                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 p-3 text-white shadow-md">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                        <FaCheck className="text-lg text-white" />
                      </div>
                      <div>
                        <Typography variant="h6" className="font-bold text-white text-base mb-0.5">
                          Kết quả kiểm tra
                        </Typography>
                        <Typography variant="body2" className="text-white/90 text-xs">
                          AI đã đánh giá và đưa ra gợi ý cải thiện
                        </Typography>
                      </div>
                      {translationCheck.score && (
                        <div className="rounded-xl text-center">
                          <Typography variant="h6" className="font-bold text-white">
                            {translationCheck.score} điểm
                          </Typography>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Corrections */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-6 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
                      <Typography variant="h6" className="font-bold text-gray-800 text-sm">
                        Sửa lỗi
                      </Typography>
                    </div>

                    {/* Spelling Mistakes */}
                    {translationCheck?.corrections.spellingMistakes.length > 0 && (
                      <div className="relative rounded-lg border border-red-200 bg-white p-3 shadow-sm">
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                            <Typography variant="body2" className="font-semibold text-red-800 text-sm">
                              Lỗi chính tả
                            </Typography>
                          </div>
                          <div className="space-y-1.5">
                            {translationCheck?.corrections.spellingMistakes.map((mistake, index) => (
                              <div key={index} className="flex items-center gap-2 p-1.5 bg-white rounded-md border border-red-100">
                                <span className="text-red-600 font-semibold text-xs px-1.5 py-0.5 bg-red-100 rounded">{mistake.word}</span>
                                <span className="text-gray-400 text-sm">→</span>
                                <span className="text-green-600 font-semibold text-xs px-1.5 py-0.5 bg-green-100 rounded">{mistake.suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Grammar Errors */}
                    {translationCheck?.corrections.grammarErrors.length > 0 && (
                      <div className="relative rounded-lg border border-orange-200 bg-white p-3 shadow-sm">
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                            <Typography variant="body2" className="font-semibold text-orange-800 text-sm">
                              Lỗi ngữ pháp
                            </Typography>
                          </div>
                          <div className="space-y-1.5">
                            {translationCheck.corrections.grammarErrors.map((error, index) => (
                              <div key={index} className="p-2 bg-white rounded-md border border-orange-100">
                                <div className="text-orange-700 font-semibold text-xs mb-1">{error.issue}</div>
                                <div className="text-orange-600 text-xs bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 font-mono">{error.example}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sentence Structure */}
                    {translationCheck.corrections.sentenceStructure.length > 0 && (
                      <div className="relative rounded-lg border border-yellow-200 bg-white p-3 shadow-sm">
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                            <Typography variant="body2" className="font-semibold text-yellow-800 text-sm">
                              Cấu trúc câu
                            </Typography>
                          </div>
                          <div className="space-y-1.5">
                            {translationCheck?.corrections?.sentenceStructure.map((structure, index) => (
                              <div key={index} className="p-2 bg-white rounded-md border border-yellow-100">
                                <div className="text-yellow-700 font-semibold text-xs mb-1">{structure.problem}</div>
                                <div className="text-yellow-600 text-xs bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">{structure.suggestion}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {(translationCheck?.feedback?.strengths.length > 0 || translationCheck?.feedback?.weaknesses.length > 0) && (
                    <div className="space-y-3">

                      <div className="flex items-center gap-2">
                        <div className="h-0.5 w-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500"></div>
                        <Typography variant="h6" className="font-bold text-gray-800 text-sm">
                          Chi tiết đánh giá
                        </Typography>
                      </div>

                      {/* Strengths */}
                      {translationCheck?.feedback.strengths?.length > 0 && (
                        <div className="relative rounded-lg border border-green-200 bg-white p-3 shadow-sm">
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                              <Typography variant="body2" className="font-semibold text-green-800 text-sm">
                                Điểm mạnh
                              </Typography>
                            </div>
                            <ul className="space-y-1.5">
                              {translationCheck?.feedback?.strengths.map((strength, index) => (
                                <li key={index} className="text-green-700 text-xs flex items-start gap-2 p-1.5 bg-white rounded-md border border-green-100">
                                  <span className="text-green-500 mt-0.5 text-sm">✓</span>
                                  <span className="flex-1">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {translationCheck?.feedback.weaknesses.length > 0 && (
                        <div className="relative rounded-lg border border-red-200 bg-white p-3 shadow-sm">
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                              <Typography variant="body2" className="font-semibold text-red-800 text-sm">
                                Cần cải thiện
                              </Typography>
                            </div>
                            <ul className="space-y-1.5">
                              {translationCheck?.feedback.weaknesses.map((weakness, index) => (
                                <li key={index} className="text-red-700 text-xs flex items-start gap-2 p-1.5 bg-white rounded-md border border-red-100">
                                  <span className="text-red-500 mt-0.5 text-sm">⚠</span>
                                  <span className="flex-1">{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}


                  {/* Improved Translation */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                      <Typography variant="h6" className="font-bold text-gray-800 text-sm">
                        Bản dịch cải thiện
                      </Typography>
                    </div>
                    <div className="relative rounded-lg border border-emerald-200 bg-white p-3 shadow-sm">
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <Typography variant="body2" className="text-emerald-800 text-sm font-medium leading-relaxed">
                            {translationCheck?.improvedTranslation}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : showHints && translationHints ? (
                // Translation Hints Display
                <div className="space-y-4">
                  {/* Header with gradient background */}
                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 p-3 text-white shadow-md">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <FaComment className="text-lg text-white" />
                      </div>
                      <div>
                        <Typography variant="h6" className="font-bold text-white text-base mb-0.5">
                          Gợi ý dịch thuật
                        </Typography>
                        <Typography variant="body2" className="text-white/90 text-xs">
                          AI đã phân tích và đưa ra gợi ý cho bạn
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Vocabulary Hints */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <Typography variant="h6" className="font-bold text-gray-800 text-sm">
                        Gợi ý từ vựng
                      </Typography>
                    </div>
                    <div className="space-y-2">
                      {translationHints.vocabularyHints.map((hint, index) => (
                        <div
                          key={index}
                          className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                          <div className="relative">
                            <div className="flex items-start justify-between gap-3">
                              <Typography variant="body2" className="font-semibold text-gray-800 text-base flex-shrink-0">
                                {hint.vietnamese}
                              </Typography>
                              <div className="flex flex-wrap gap-1.5 justify-end flex-1">
                                {hint.english.map((eng, engIndex) => (
                                  <span
                                    key={engIndex}
                                    className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium shadow-sm transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                  >
                                    {eng}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Structure Hints */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                      <Typography variant="h6" className="font-bold text-gray-800 text-sm">
                        Gợi ý cấu trúc
                      </Typography>
                    </div>

                    {/* Sentence Type */}
                    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:border-green-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                          <Typography variant="body2" className="font-semibold text-gray-800 text-sm">
                            Loại câu
                          </Typography>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <Typography variant="body2" className="text-gray-700 font-medium text-sm">
                            {translationHints.structureHints.kindsOfSentencesAccordingToStructure.vietnamese}
                          </Typography>
                          <Typography variant="body2" className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-md border border-green-200">
                            {translationHints.structureHints.kindsOfSentencesAccordingToStructure.english}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* Tense */}
                    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:border-purple-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                          <Typography variant="body2" className="font-semibold text-gray-800 text-sm">
                            Thì ngữ pháp
                          </Typography>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <Typography variant="body2" className="text-gray-700 font-medium text-sm">
                              {translationHints.structureHints.tenses.vietnamese}
                            </Typography>
                            <Typography variant="body2" className="text-purple-600 text-xs font-medium bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                              {translationHints.structureHints.tenses.english}
                            </Typography>
                          </div>
                          <div className="flex justify-end">
                            <div className="inline-block rounded-md bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-1.5 border border-purple-200">
                              <Typography variant="body2" className="text-purple-800 text-xs font-mono font-semibold">
                                {translationHints.structureHints.tenses.form}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                // Instructions Display
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <FaThumbsUp className="text-green-500 text-xl" />
                    <Typography variant="h6" className="font-bold text-gray-800 text-lg">
                      Hướng dẫn luyện tập
                    </Typography>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <FaLightbulb className="text-blue-500 mt-1 flex-shrink-0 text-lg" />
                      <Typography variant="body2" className="text-gray-700 leading-6">
                        Các câu đã dịch sẽ hiển thị bản dịch tiếng Anh với font đậm
                      </Typography>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <FaCheck className="text-green-500 mt-1 flex-shrink-0 text-lg" />
                      <Typography variant="body2" className="text-gray-700 leading-6">
                        Hãy click vào button "Kiểm tra" để AI review và đánh giá câu dịch của bạn
                      </Typography>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <FaPen className="text-purple-500 mt-1 flex-shrink-0 text-lg" />
                      <Typography variant="body2" className="text-gray-700 leading-6">
                        Câu hiện tại cần dịch sẽ có viền xanh dương
                      </Typography>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <FaComment className="text-orange-500 mt-1 flex-shrink-0 text-lg" />
                      <Typography variant="body2" className="text-gray-700 leading-6">
                        Click vào button "Xem gợi ý" để nhận gợi ý dịch thuật từ AI
                      </Typography>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Completion Overlay */}
      {showCompletionOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-6 text-white text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                  <span className="text-3xl">🎉</span>
                </div>
              </div>

              <Typography variant="h4" className="font-bold text-white text-2xl mb-2">
                Chúc mừng!
              </Typography>
              <Typography variant="body1" className="text-white/90 text-lg">
                Bạn đã hoàn thành bài tập dịch thuật
              </Typography>

              {/* Success indicator */}
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full border border-white/30">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/90 text-sm font-medium">Hoàn thành xuất sắc!</span>
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 text-center">
              <div className="mb-6">
                <Typography variant="h5" className="font-bold text-gray-800 text-xl mb-4">
                  Thành tích của bạn
                </Typography>

                <div className="grid grid-cols-2 gap-4">
                  {/* Achievement cards */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-4xl font-bold text-blue-600 mb-1">
                      {vietNameseSentences.length}
                    </div>
                    <div className="text-sm text-gray-800 font-medium">
                      Câu đã dịch
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-4xl font-bold text-emerald-600 mb-1">
                      {calculateAverageScore()}/10
                    </div>
                    <div className="text-sm text-gray-800 font-medium">
                      Điểm trung bình
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-4">
                <button
                  className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg border-0 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    navigate('/');
                  }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <FaHome className="text-xl" />
                    <span>VỀ TRANG CHỦ</span>
                  </span>
                </button>

                <button
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-lg border-0 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    setShowDetailModal(true);
                  }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <FaChartBar className="text-xl" />
                    <span>XEM CHI TIẾT</span>
                  </span>
                </button>

                <button
                  className="w-full py-4 px-6 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-lg bg-white cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    navigate('/listening-practice');
                  }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <FaHeadphones className="text-xl" />
                    <span>LUYỆN TẬP KHÁC</span>
                  </span>
                </button>
              </div>

              {/* Additional text */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Typography variant="body2" className="text-gray-500 font-medium">
                  🎯 Tiếp tục phát triển kỹ năng của bạn!
                </Typography>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-xl">📊</span>
                    </div>
                    <Typography variant="h4" className="font-bold text-white text-3xl">
                      Chi tiết lịch sử luyện tập
                    </Typography>
                  </div>
                </div>
                <button
                  className="text-white border border-white hover:border-white hover:bg-white/20 px-4 py-3 rounded-full text-sm font-bold shadow-2xl hover:shadow-2xl bg-white/10 backdrop-blur-sm cursor-pointer transition-colors duration-200"
                  onClick={() => setShowDetailModal(false)}
                >
                  <span className="text-2xl font-black">✕</span>
                </button>
              </div>

              {/* Summary */}
              <div className="relative mt-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                  <span className="text-lg">🎯</span>
                  <span className="text-white/90 font-medium">Topic: {currentTopic}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                  <span className="text-lg">📚</span>
                  <span className="text-white/90 font-medium">Level: {currentLevel}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                  <span className="text-lg">🎭</span>
                  <span className="text-white/90 font-medium">Tone: {currentTone}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                  <span className="text-lg">⭐</span>
                  <span className="text-white/90 font-medium">{calculateAverageScore()}/10</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                  <span className="text-lg">📅</span>
                  <span className="text-white/90 font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[65vh] bg-gradient-to-b from-gray-50 to-white">
              <div className="space-y-8">
                {englishTranslations.map((sentence, index) => (
                  <div key={index} className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl"></div>

                    {/* Header with score */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold ${sentence.score >= 9
                        ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200'
                        : sentence.score >= 7
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                        }`}>
                        {sentence.score}/10
                      </div>
                    </div>

                    {/* Original Vietnamese sentence */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">

                        <Typography variant="body2" className="font-bold text-gray-700 text-lg">
                          CÂU GỐC
                        </Typography>
                      </div>
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                        <Typography variant="body1" className="text-gray-800 leading-relaxed text-lg font-medium">
                          {sentence.vietnamese}
                        </Typography>
                      </div>
                    </div>

                    {/* User's translation */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">

                        <Typography variant="body2" className="font-bold text-gray-700 text-lg">
                          BẢN DỊCH CỦA BẠN
                        </Typography>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                        <Typography variant="body1" className="text-gray-800 leading-relaxed text-lg font-medium">
                          {sentence.englishTranslation}
                        </Typography>
                      </div>
                    </div>

                    {/* Feedback */}
                    {sentence.feedback && sentence.score < 9 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs">💡</span>
                          </div>
                          <Typography variant="body2" className="font-bold text-gray-700 text-lg">
                            NHẬN XÉT
                          </Typography>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 shadow-sm">
                          <Typography variant="body1" className="text-gray-800 leading-relaxed text-lg">
                            {sentence.feedback}
                          </Typography>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-gray-600 text-sm">
                  <span className="font-medium">Tổng cộng:</span> {englishTranslations.length} câu đã dịch
                </div>
                <div className="flex gap-4">
                  <button
                    className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-xl cursor-pointer transition-colors duration-200"
                    onClick={() => {
                      setShowDetailModal(false);
                      navigate('/');
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <FaHome className="text-lg" />
                      <span>Về Trang Chủ</span>
                    </span>
                  </button>
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl cursor-pointer transition-colors duration-200"
                    onClick={() => {
                      setShowDetailModal(false);
                      navigate('/listening-practice');
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <FaHeadphones className="text-lg" />
                      <span>Luyện Tập Khác</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BilingualPassage;

