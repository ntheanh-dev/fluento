import React, { useState, useEffect } from "react";
import { Typography, TextField } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPen,
  FaLightbulb,
  FaCheck,
  FaComment,
  FaThumbsUp,
  FaHome,
  FaHeadphones,
} from "react-icons/fa";
import {
  ArrowLeft,
  ChevronRight,
  Send,
  BookOpen,
  TrendingUp,
  Settings,
  Menu,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import { useDeviceType } from "@/shared/utilities/useDeviceType";
// Common API response interface
export interface ApiResponse<T = any> {
  code: number;
  result: T;
}

// Common API error interface
export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

// Generic API response wrapper
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Common pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

// Common paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationParams;
}

// Translation hints response types
export interface VocabularyHint {
  vietnamese: string;
  english: string[];
}

export interface StructureHint {
  kindsOfSentencesAccordingToStructure: {
    vietnamese: string;
    english: string;
  };
  tenses: {
    vietnamese: string;
    english: string;
    form: string;
  };
}

export interface TranslationHintsResponse {
  vocabularyHints: VocabularyHint[];
  structureHints: StructureHint;
}

// Translation check response types
export interface SpellingMistake {
  word: string;
  suggestion: string;
}

export interface GrammarError {
  issue: string;
  example: string;
}

export interface VocabularyIssue {
  word: string;
  suggestion: string[];
}

export interface SentenceStructure {
  problem: string;
  suggestion: string;
}

export interface TranslationFeedback {
  weaknesses: string[];
}

export interface TranslationCheckResponse {
  originalVietnamese: string;
  learnerEnglish: string;
  corrections: {
    spellingMistakes: SpellingMistake[];
    vocabularyIssues: VocabularyIssue[];
    grammarErrors: GrammarError[];
    sentenceStructure: SentenceStructure[];
  };
  feedback: TranslationFeedback;
  score: number;
  improvedTranslation: string;
}

export interface SentenceCreationResponse {
  vietnamese: string;
  englishTranslation: string;
  orderIndex: number;
  score: number;
  feedback: string;
  conversationId: string;
}

export interface Sentence {
  englishTranslation: string;
  vietnamese: string;
  score: number;
  feedback: string;
}

const SentencePracticePage = () => {
  const [translation, setTranslation] = useState("");
  const { conversationId } = useParams();
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  const navigate = useNavigate();

  const [vietNameseSentences, setVietNameseSentences] = useState<string[]>([]);
  const [englishTranslations, setEnglishTranslations] = useState<Sentence[]>(
    [],
  );
  const [currentLevel, setCurrentLevel] = useState<string>("");
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [currentTone, setCurrentTone] = useState<string>("");
  const [type, setType] = useState<string>("");

  // New state for translation hints
  const [translationHints, setTranslationHints] =
    useState<TranslationHintsResponse | null>(null);
  const [showHints, setShowHints] = useState(false);

  // New state for translation check
  const [translationCheck, setTranslationCheck] =
    useState<TranslationCheckResponse | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Calculate average score from englishTranslations
  const calculateAverageScore = () => {
    if (englishTranslations.length === 0) return 0;
    const totalScore = englishTranslations.reduce(
      (sum, sentence) => sum + sentence.score,
      0,
    );
    return Math.round(totalScore / englishTranslations.length);
  };

  // Handle Enter key events for buttons
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Enter key
      if (event.key !== "Enter") return;

      // Don't trigger if user is typing in the translation input
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === "TEXTAREA") {
        return;
      }

      // Don't trigger if modals are open
      if (showDetailModal) {
        return;
      }

      // Determine which button should be triggered based on current state
      if (showCheck && translationCheck) {
        // Check if there are no errors in corrections
        const hasErrors =
          translationCheck.corrections.spellingMistakes.length > 0 ||
          translationCheck.corrections.grammarErrors.length > 0 ||
          translationCheck.corrections.sentenceStructure.length > 0 ||
          translationCheck.corrections.vocabularyIssues.length > 0;

        if (hasErrors) {
          // Has errors - trigger "Viết lại" button
          handleCheckTranslation();
        } else {
          // No errors - trigger "Câu tiếp" button
          handleNextSentence();
        }
      } else {
        // Default state - trigger "Kiểm tra" button
        handleCheckTranslation();
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCheck, translationCheck, showDetailModal]);

  // Function to call translation hints API
  const handleGetTranslationHints = async () => {};

  // Function to clean and format translation text
  const formatTranslationText = (text: string): string => {
    let cleaned = text.trim();

    // Remove multiple spaces between words
    cleaned = cleaned.replace(/\s+/g, " ");

    // Add punctuation if missing
    if (cleaned && !/[.!?]$/.test(cleaned)) {
      cleaned = cleaned + ".";
    }

    // Capitalize first letter of each sentence
    cleaned = cleaned.replace(/(^|\.\s+)([a-z])/g, (_, p1, p2) => {
      return p1 + p2.toUpperCase();
    });

    return cleaned;
  };

  // Function to call translation check API
  const handleCheckTranslation = async () => {};

  const handleNextSentence = async () => {};

  const [input, setInput] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setShowMobileSidebar(false);
    }
  }, [isMobile]);
  return (
    <div className="max-w-screen-2xl mx-auto max-h-[calc(100vh-130px+4rem)] -mt-8 -mb-8 flex flex-col overflow-hidden">
      {/* Top Bar for Task Info */}
      <div className="flex items-center justify-between py-4 mb-2 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/setup")}
            className="group p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all border border-slate-200 shadow-sm bg-white"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
              Project Status Inquiry
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Topic: Business
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                Tone: Formal
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                Level: B2
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                Type: Paragraph
              </span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-500">
              Section 2/5
            </span>
            <div className="w-48 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[40%] rounded-full"></div>
            </div>
            <span className="text-xs font-bold text-blue-600">40%</span>
          </div>
        </div>
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden pb-4">
        {/* Left Column: Workspace (Source & Input) */}
        <section className="lg:col-span-8 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
          {/* Source Context View */}
          <div className="flex-[10] min-h-0 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <img
                  src="https://flagcdn.com/w20/vn.png"
                  className="w-5 rounded-sm shadow-sm"
                  alt="VN"
                />
                Vietnamese Source
              </span>
            </div>
            <div className="p-4 bg-slate-50/50">
              <div className="text-lg leading-relaxed text-slate-800 font-medium space-y-4">
                <div className="opacity-50 text-slate-500 text-base">
                  Tôi viết thư này để hỏi về tiến độ của dự án trang web mới.
                </div>

                <div className="relative pl-4 border-l-4 border-blue-500 py-1">
                  <p className="text-slate-900 font-bold">
                    Chúng tôi cần{" "}
                    <span className="text-blue-600 underline decoration-blue-300 decoration-2 underline-offset-2">
                      đảm bảo
                    </span>{" "}
                    rằng mọi thứ đang diễn ra đúng kế hoạch.
                  </p>
                  <div className="absolute -right-2 top-0">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                  </div>
                </div>

                <div className="opacity-50 text-slate-500 text-base">
                  Ngoài ra, hãy cho tôi biết nếu bạn cần thêm bất kỳ nguồn lực
                  nào để hoàn thành công việc đúng hạn.
                </div>
              </div>
            </div>
          </div>

          {/* English Translation Flow (Input) */}
          <div className="flex-[2] bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col flex-1">
            <div className="bg-white border-b border-slate-200 px-5 py-3 flex justify-between items-center rounded-t-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <img
                  src="https://flagcdn.com/w20/us.png"
                  className="w-5 rounded-sm shadow-sm"
                  alt="US"
                />
                English Translation Flow
              </span>
            </div>
            <div className="p-2 flex-1 flex flex-col">
              <div className="mt-auto">
                <textarea
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-base transition-all resize-none"
                  placeholder="Type your translation here..."
                  rows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex justify-between items-center mt-3">
                  <button className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center gap-1">
                    <RefreshCw size={14} /> Reset
                  </button>
                  <button
                    onClick={() => setShowMobileSidebar(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1 ml-auto sm:ml-0"
                  >
                    <Lightbulb size={16} /> Hints & Answer
                  </button>
                  <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
                    Confirm Sentence{" "}
                    <ArrowLeft size={16} className="rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Sidebar (Hints & Analysis) */}
        {showMobileSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}
        {(isDesktop || isTablet) && (
          <aside
            className={`
              lg:col-span-4 flex flex-col lg:h-full transition-all duration-300 ease-in-out
              ${
                showMobileSidebar
                  ? "fixed inset-x-0 bottom-0 top-20 z-50 bg-white rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] p-4 lg:static lg:p-0 lg:shadow-none lg:bg-transparent lg:rounded-none"
                  : "hidden lg:flex"
              }
          `}
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden relative">
              {/* Mobile Close Button */}
              <div className="lg:hidden absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-white">
                {/* Score Card */}
                <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl py-6 border border-blue-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-white shadow-sm bg-blue-600 text-white relative mb-3">
                    <span className="text-xl font-bold">85</span>
                  </div>
                  <h4 className="font-bold text-slate-800">Quality Score</h4>
                  <p className="text-xs text-slate-500 px-8 mt-1">
                    Your translation is professional and clear with minor areas
                    for natural improvement.
                  </p>
                </div>

                {/* Polished Model */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    Polished Model
                  </h4>
                  <div className="space-y-3">
                    {/* Hint 1 */}
                    <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-green-500 text-[10px] text-white font-bold">
                          GRAMMAR
                        </span>
                        <span className="text-xs font-bold text-green-700">
                          Good Usage
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Sử dụng cấu trúc "We need to..." rất chính xác cho văn
                        phong công việc.
                      </p>
                    </div>

                    {/* Hint 2 */}
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500 text-[10px] text-white font-bold">
                          VOCABULARY
                        </span>
                        <span className="text-xs font-bold text-amber-700">
                          Refinement Needed
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-bold text-amber-600/60 uppercase">
                            Your word:
                          </span>
                          <span className="text-xs font-medium line-through decoration-amber-500/50 text-slate-500">
                            ensure everything
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-bold text-green-600/60 uppercase">
                            Better:
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            "ensure all aspects", "guarantee every detail"
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-amber-200/50">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Trong văn phong công việc,{" "}
                            <span className="font-bold text-amber-700">
                              "all aspects"
                            </span>{" "}
                            tạo cảm giác chuyên nghiệp hơn là{" "}
                            <span className="italic">"everything"</span>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hint 3 */}
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500 text-[10px] text-white font-bold">
                          STRUCTURE
                        </span>
                        <span className="text-xs font-bold text-blue-700">
                          Strength
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Sự kết nối giữa hai câu rất mạch lạc, giữ được giọng
                        điệu của email gốc.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-500" />
                    Correct Answer
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-lg italic text-sm text-slate-700 leading-relaxed border border-slate-100">
                    "We must ensure that everything is proceeding according to
                    plan."
                  </div>
                </div>
              </div>

              {/* Sidebar Bottom Nav */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3 shrink-0">
                <button className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-white transition-colors flex items-center justify-center gap-2">
                  <BookOpen size={14} />
                  Review Vocab
                </button>
                <button className="flex-1 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors">
                  Previous Task
                </button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default SentencePracticePage;
