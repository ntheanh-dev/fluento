import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Check,
  Loader2,
  Volume2,
  GraduationCap,
} from "lucide-react";
import { useDeviceType } from "@/shared/utilities/useDeviceType";
import { useParagraphHints, useUserPracticeData } from "../../hooks/useUserPractice";
import { splitIntoSentences } from "@/utils/utils";
import type { HintContent } from "@/entities/hints/schema";
import { message } from "antd";
import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";
import { useAnswerPreviewData } from "../../hooks/useAnswerPreviewData";
import { SentenceFeedbackAside } from "./SentenceFeedbackAside";
import { Analyzing } from "./Analyzing";
import { HintsAside } from "./HintsAside";
import { useSubmitUserSentence } from "../../hooks/useSubmitUserSentence";
import { Aside } from "./Aside";


export const sentenceFeedbackData: SentenceFeedback = {
  originalVietnamese:
    "Tôi viết thư này để bày tỏ ý kiến của mình về lịch trình xe buýt công cộng mới được đưa ra gần đây tại thành phố của chúng ta.",

  learnerEnglish:
    "Them are writing this letters to expres my option on the new public bus schedule recently introduced in city.",

  corrections: {
    spellingMistakes: [
      { word: "Them", suggestion: "I" },
      { word: "letters", suggestion: "letter" },
      { word: "expres", suggestion: "express" },
      { word: "option", suggestion: "opinion" }
    ],

    vocabularyIssues: [
      { word: "option", suggestion: ["opinion"] }
    ],

    grammarErrors: [
      {
        issue: "Sai chủ ngữ và động từ",
        suggestion: "Them are → I am"
      },
      {
        issue: "Sai số lượng danh từ",
        suggestion: "letters → letter"
      },
      {
        issue: "Thiếu mạo từ",
        suggestion: "in city → in our city"
      }
    ],

    sentenceStructure: [
      {
        problem: "Cấu trúc câu còn lủng củng, thiếu tự nhiên",
        suggestion:
          "Sắp xếp lại câu theo cấu trúc: I am writing this letter to express..."
      }
    ]
  },

  feedback: {
    weaknesses: [
      "Bạn cần chú ý hơn đến việc chia chủ ngữ và động từ cho phù hợp.",
      "Hãy cẩn thận với lỗi chính tả, đặc biệt là các từ dễ nhầm lẫn như 'expres' và 'option'.",
      "Việc sử dụng mạo từ (articles) 'a', 'an', 'the' rất quan trọng trong tiếng Anh.",
      "Cấu trúc câu còn mang tính dịch từng từ từ tiếng Việt."
    ]
  },

  improvedTranslation:
    "I am writing this letter to express my opinion on the new public bus schedule recently introduced in our city.",

  score: 5.0
};

const SentencePracticePage = () => {
  const { id } = useParams();
  const { isMobile } = useDeviceType();
  const navigate = useNavigate();

  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [translation, setTranslation] = useState("");
  const [vietNameseSentences, setVietNameseSentences] = useState<string[]>([]);
  const [sentenceFeedback, setSentenceFeedback] = useState<SentenceFeedback | null>();
  const [englishTranslations, setEnglishTranslations] = useState<string[]>([]);
  const [translationHints, setTranslationHints] =
    useState<HintContent | null>(null);

  const { data, error: errorUserPracticeData } = useUserPracticeData(Number(id));
  const { mutateAsync: getTranslationHints, isPending: isLoadingTranslationHints } = useParagraphHints(Number(id), orderIndex);
  const { mutateAsync: getAnswerPreview, isPending: isLoadingAnswerPreview } = useAnswerPreviewData(Number(id), { translatedSentence: translation, orderIndex: orderIndex });
  const { mutateAsync: submitUserSentence, isPending: isLoadingSubmitUserSentence } = useSubmitUserSentence(Number(id), { vietnameseSentence: translation, orderIndex: orderIndex, feedback: sentenceFeedback as SentenceFeedback });

  useEffect(() => {
    if (data && !errorUserPracticeData) {
      setVietNameseSentences(splitIntoSentences(data.paragraph.content));
      const englishTranslations = data.sentenceAnswers.map((answer) => (answer.userTranslation));
      setEnglishTranslations(englishTranslations);
      setOrderIndex(data.sentenceAnswers.length);
      setOrderIndex(0)
    }
    if (errorUserPracticeData) {
      message.error(errorUserPracticeData.message);
    }
  }, [data, errorUserPracticeData]);

  // Handle Enter key events for buttons
  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     // Only handle Enter key
  //     if (event.key !== "Enter") return;

  //     // Don't trigger if user is typing in the translation input
  //     const activeElement = document.activeElement;
  //     if (activeElement && activeElement.tagName === "TEXTAREA") {
  //       return;
  //     }



  //     // Determine which button should be triggered based on current state
  //     if (showCheck && translationCheck) {
  //       // Check if there are no errors in corrections
  //       const hasErrors =
  //         translationCheck.corrections.spellingMistakes.length > 0 ||
  //         translationCheck.corrections.grammarErrors.length > 0 ||
  //         translationCheck.corrections.sentenceStructure.length > 0 ||
  //         translationCheck.corrections.vocabularyIssues.length > 0;

  //       if (hasErrors) {
  //         // Has errors - trigger "Viết lại" button
  //         handleCheckTranslation();
  //       } else {
  //         // No errors - trigger "Câu tiếp" button
  //         handleNextSentence();
  //       }
  //     } else {
  //       // Default state - trigger "Kiểm tra" button
  //       handleCheckTranslation();
  //     }
  //   };

  //   // Add event listener
  //   document.addEventListener("keydown", handleKeyDown);

  //   // Cleanup
  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [showCheck, translationCheck, showDetailModal]);

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  // Function to call translation hints API
  const handleGetTranslationHints = async () => {
    setShowMobileSidebar(true);
    if (translationHints) {
      return;
    }
    try {
      const translationHints = await getTranslationHints();
      setTranslationHints(translationHints);
    } catch (error) {
      message.error((error as Error).message);
    }
  };


  // Function to call translation check API
  const handleCheckTranslation = async () => {
    if (isLoadingAnswerPreview || !translation) {
      return;
    }
    try {
      const answerPreview = await getAnswerPreview();
      setSentenceFeedback(answerPreview);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleNextSentence = async () => {
    if (isLoadingSubmitUserSentence || !sentenceFeedback) {
      return;
    }
    try {
      const userSentenceAnswer = await submitUserSentence();
      setEnglishTranslations([...englishTranslations, userSentenceAnswer.userTranslation]);
      setOrderIndex(orderIndex + 1);
      setTranslation("");
      setSentenceFeedback(null);
      setTranslationHints(null);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

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
            <h1 className="text-xl md:text-xl font-bold text-slate-900 leading-tight">
              {data?.paragraph.type} - {data?.paragraph.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Chủ đề: {data?.paragraph.topic}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                Độ khó: {data?.paragraph.level}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-500">
              Câu {orderIndex}/{vietNameseSentences.length}
            </span>
            <div className="w-48 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.round((orderIndex / vietNameseSentences.length) * 100)}%` }}></div>
            </div>
            <span className="text-xs font-bold text-blue-600">{Math.round((orderIndex / vietNameseSentences.length) * 100)}%</span>
          </div>
        </div>
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden pb-4">
        {/* Left Column: Workspace (Source & Input) */}
        <section className="lg:col-span-8 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
          {/* Source Context View */}
          <div className="flex-[10] min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <img
                  src="https://flagcdn.com/w20/vn.png"
                  className="w-5 rounded-sm shadow-sm"
                  alt="VN"
                />
                Nội dung dịch
              </span>
              <button
                onClick={handleGetTranslationHints}
                className="text-blue-600 hover:text-blue-700 hover:cursor-pointer text-sm font-bold flex items-center gap-1 ml-auto sm:ml-0"
              >
                <Lightbulb size={16} /> Xem gợi ý
              </button>
            </div>
            <div className="p-4 bg-slate-50/50 h-full overflow-y-auto">
              <div className="text-lg leading-relaxed text-slate-800 font-medium space-y-4 px-4 ">
                <div className="leading-7 text-base text-gray-800">
                  {vietNameseSentences.map((sentence, index) => (
                    <React.Fragment key={index}>
                      {index <= englishTranslations.length - 1 ? (
                        // Completed sentences - show English translation
                        <span key={index} className="relative inline">
                          <span className="text-black py-1 font-bold whitespace-pre-line">
                            {" " + englishTranslations[index]}
                          </span>
                        </span>
                      ) : (
                        // Current and upcoming sentences
                        index === englishTranslations.length ? (
                          // Current sentence to translate
                          <span key={index} className="relative inline whitespace-pre-line">
                            <span className="py-2 text-blue-600 font-bold">
                              {" " + sentence}
                            </span>
                          </span>
                        ) : (
                          // Upcoming sentences
                          <span key={index} className="relative inline whitespace-pre-line">
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
                Dịch câu tiếp theo
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="mt-auto">
                <textarea
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-base transition-all resize-none"
                  placeholder="Nhập câu dịch của bạn ở đây..."
                  rows={2}
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                />
                <div className="flex justify-end items-center mt-3 gap-2">
                  <button
                    disabled={isLoadingAnswerPreview || !translation}
                    onClick={handleCheckTranslation}
                    className={`text-slate-700 border-slate-300 transition-colors border px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${isLoadingAnswerPreview || !translation ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    Kiểm tra
                    {isLoadingAnswerPreview ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Check size={16} />
                    )}
                  </button>
                  {sentenceFeedback && (
                    <button disabled={isLoadingSubmitUserSentence} onClick={handleNextSentence} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
                      Tiếp theo
                      {isLoadingSubmitUserSentence ? <Loader2 className="animate-spin" size={16} /> : <ArrowLeft size={16} className="rotate-180" />}
                    </button>
                  )}
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
        <aside
          className={`
              lg:col-span-4 flex flex-col lg:h-full transition-all duration-300 ease-in-out overflow-hidden
              ${showMobileSidebar
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
            <Aside isLoadingAnswerPreview={isLoadingAnswerPreview} isLoadingTranslationHints={isLoadingTranslationHints} sentenceFeedback={sentenceFeedback as SentenceFeedback | null} translationHints={translationHints as HintContent | null} />
          </div>
        </aside>
      </main>
    </div>
  );
};

export default SentencePracticePage;