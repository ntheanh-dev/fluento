import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lightbulb,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useDeviceType } from "@/shared/utilities/useDeviceType";
import { useParagraphHints, useUserPracticeData } from "../../hooks/useUserPractice";
import { splitIntoSentences } from "@/utils/utils";
import type { HintContent } from "@/entities/hints/schema";
import { message } from "antd";
import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";
import { useAnswerPreviewData } from "../../hooks/useAnswerPreviewData";
import { useSubmitUserSentence } from "../../hooks/useSubmitUserSentence";
import { Aside } from "./Aside";
import type { ApiError } from "@/shared/api/type";
import { AxiosError } from "axios";

const DEFAULT_ERROR_MESSAGE =
  "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.";

function showApiError(error: unknown, fallback = DEFAULT_ERROR_MESSAGE) {
  const appError = (error as AxiosError)?.response?.data as ApiError | undefined;
  if (appError?.message) {
    message.error(appError.message, 5);
  } else {
    message.error(fallback);
  }
}

export type RenderAsideType = "hints" | "sentenceFeedback" | null;

const SentencePracticePage = () => {
  const { id } = useParams();
  const { isMobile, isTablet } = useDeviceType();
  const navigate = useNavigate();

  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [translation, setTranslation] = useState("");
  const [vietNameseSentences, setVietNameseSentences] = useState<string[]>([]);
  const [sentenceFeedback, setSentenceFeedback] = useState<SentenceFeedback | null>();
  const [englishTranslations, setEnglishTranslations] = useState<string[]>([]);
  const [translationHints, setTranslationHints] =
    useState<HintContent | null>(null);
  const [renderAsideType, setRenderAsideType] = useState<RenderAsideType>(null);
  const { data, error: errorUserPracticeData } = useUserPracticeData(Number(id));

  const answerPreviewPayload = useMemo(
    () => ({ translatedSentence: translation, orderIndex }),
    [translation, orderIndex]
  );
  const submitPayload = useMemo(
    () => ({
      vietnameseSentence: translation,
      orderIndex,
      feedback: sentenceFeedback as SentenceFeedback,
    }),
    [translation, orderIndex, sentenceFeedback]
  );

  const { mutateAsync: getTranslationHints, isPending: isLoadingTranslationHints } = useParagraphHints(Number(id), orderIndex);
  const { mutateAsync: getAnswerPreview, isPending: isLoadingAnswerPreview } = useAnswerPreviewData(Number(id), answerPreviewPayload);
  const { mutateAsync: submitUserSentence, isPending: isLoadingSubmitUserSentence } = useSubmitUserSentence(Number(id), submitPayload);

  useEffect(() => {
    if (data && !errorUserPracticeData) {
      setVietNameseSentences(splitIntoSentences(data.paragraph.content));
      setEnglishTranslations(data.sentenceAnswers?.map((a) => a.userTranslation));
      setOrderIndex(data.sentenceAnswers?.length || 0);
    }
    if (errorUserPracticeData) {
      message.error((errorUserPracticeData as unknown as ApiError).message);
    }
  }, [id, data, errorUserPracticeData]);

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const handleGetTranslationHints = async () => {
    setShowMobileSidebar(true);
    setRenderAsideType("hints");
    if (translationHints) {
      return;
    }
    try {
      const res = await getTranslationHints();
      setTranslationHints(res);
    } catch (error) {
      setShowMobileSidebar(false);
      setRenderAsideType(null);
      showApiError(error);
    }
  };

  const handleGetAnswerPreview = async () => {
    if (!translation.trim()) return;
    if (isLoadingAnswerPreview) return;
    setRenderAsideType("sentenceFeedback");
    if (isMobile || isTablet) {
      setShowMobileSidebar(true);
    }
    if (translation.trim() === sentenceFeedback?.learnerEnglish) return;
    try {
      const answerPreview = await getAnswerPreview();
      setSentenceFeedback(answerPreview);
    } catch (error) {
      setShowMobileSidebar(false);
      showApiError(error);
    }
  };

  const handleNextSentence = async () => {
    if (isLoadingSubmitUserSentence || !sentenceFeedback) return;

    try {
      const userSentenceAnswer = await submitUserSentence();
      setEnglishTranslations([...englishTranslations, userSentenceAnswer.userTranslation]);
      setOrderIndex(orderIndex + 1);
      setTranslation("");
      setSentenceFeedback(null);
      setTranslationHints(null);
      setRenderAsideType(null);
    } catch (error) {
      showApiError(error);
    }
  };

  const totalSentences = vietNameseSentences.length || 1;
  const progressPercent = useMemo(
    () => Math.round((orderIndex / totalSentences) * 100),
    [orderIndex, totalSentences]
  );

  useEffect(() => {
    if (!isMobile) {
      setShowMobileSidebar(false);
    }
  }, [isMobile]);
  return (
    <div className="max-w-screen-2xl mx-auto max-h-[calc(100vh-130px+4rem)] -mt-4 sm:-mt-6 md:-mt-8 -mb-4 sm:-mb-6 md:-mb-8 flex flex-col overflow-hidden">
      {/* Top Bar for Task Info */}
      <div className="flex items-center justify-between py-3 md:py-4 mb-2 shrink-0 px-1 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={() => navigate("/setup")}
            className="shrink-0 group p-2 sm:p-2.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg sm:rounded-xl text-slate-400 hover:text-slate-700 transition-all border border-slate-200 shadow-sm bg-white touch-manipulation"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform w-5 h-5"
            />
          </button>
          <div className="min-w-0 flex-1">
            {data?.paragraph.type !== "BASIC" && (
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate sm:whitespace-normal">
                {data?.paragraph.type} : {data?.paragraph.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 sm:mt-2">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] md:text-xs font-medium bg-slate-100 text-slate-600 sm:text-slate-700 border border-slate-200">
                Chủ đề: {data?.paragraph.topic}
              </span>
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] md:text-xs font-medium bg-purple-50 text-purple-600 sm:text-purple-700 border border-purple-100">
                Độ khó: {data?.paragraph.level}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-4 lg:gap-6">
            <span className="text-xs md:text-sm font-medium text-slate-500">
              Câu {orderIndex}/{vietNameseSentences.length}
            </span>
            <div className="w-36 md:w-44 lg:w-48 h-2 md:h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-blue-600">{progressPercent}%</span>
          </div>
        </div>
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden pb-3 sm:pb-4 px-1 sm:px-0">
        {/* Left Column: Workspace (Source & Input) */}
        <section className="lg:col-span-8 flex flex-col gap-3 sm:gap-4 h-full overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
          {/* Source Context View */}
          <div className="flex-[10] min-h-0 bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0">
            <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 flex justify-between items-center">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                <img
                  src="https://flagcdn.com/w20/vn.png"
                  className="w-4 sm:w-5 rounded-sm shadow-sm"
                  alt="VN"
                />
                Nội dung dịch
              </span>
              <button
                onClick={handleGetTranslationHints}
                className="text-blue-600 hover:text-blue-700 hover:cursor-pointer text-xs sm:text-sm font-bold flex items-center gap-1 ml-auto sm:ml-0"
              >
                <Lightbulb size={14} className="sm:w-4 sm:h-4" /> Xem gợi ý
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-5 bg-slate-50/50 h-full overflow-y-auto">
              <div className="text-base sm:text-lg leading-relaxed text-slate-800 font-medium space-y-3 sm:space-y-4 px-2 sm:px-3 md:px-4">
                <div className="leading-6 sm:leading-7 text-sm sm:text-base text-gray-800">
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
          <div className="flex-[2] bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col flex-1">
            <div className="bg-white border-b border-slate-200 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 flex justify-between items-center rounded-t-lg sm:rounded-t-xl">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                <img
                  src="https://flagcdn.com/w20/us.png"
                  className="w-4 sm:w-5 rounded-sm shadow-sm"
                  alt="US"
                />
                Dịch câu tiếp theo
              </span>
            </div>
            <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
              <div className="mt-auto">
                <textarea
                  className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm sm:text-base transition-all resize-none min-h-[72px] sm:min-h-[80px]"
                  placeholder="Nhập câu dịch của bạn ở đây..."
                  rows={2}
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                />
                <div className="flex justify-end items-center mt-2 sm:mt-3 gap-2">
                  <button
                    disabled={isLoadingAnswerPreview || !translation}
                    onClick={handleGetAnswerPreview}
                    className={`text-slate-700 border-slate-300 transition-colors border px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 ${isLoadingAnswerPreview || !translation ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    Kiểm tra
                    {isLoadingAnswerPreview ? (
                      <Loader2 className="animate-spin w-4 h-4" size={16} />
                    ) : (
                      <Check className="w-4 h-4" size={16} />
                    )}
                  </button>
                  {sentenceFeedback && (
                    <button disabled={isLoadingSubmitUserSentence || translation.trim() !== sentenceFeedback?.learnerEnglish} onClick={handleNextSentence}
                      className={`bg-blue-600 text-white px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2 ${isLoadingSubmitUserSentence || translation.trim() !== sentenceFeedback?.learnerEnglish ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      Tiếp theo
                      {isLoadingSubmitUserSentence ? <Loader2 className="animate-spin w-4 h-4" size={16} /> : <ArrowLeft size={16} className="rotate-180 w-4 h-4" />}
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
              ? "fixed inset-x-0 bottom-0 top-20 z-50 bg-white rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] p-3 sm:p-4 lg:static lg:p-0 lg:shadow-none lg:bg-transparent lg:rounded-none"
              : "hidden lg:flex"
            }
          `}
        >

          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden relative">
            {/* Mobile Close Button */}
            <div className="lg:hidden absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <Aside renderAsideType={renderAsideType} isLoadingAnswerPreview={isLoadingAnswerPreview} isLoadingTranslationHints={isLoadingTranslationHints} sentenceFeedback={sentenceFeedback as SentenceFeedback | null} translationHints={translationHints as HintContent | null} />
          </div>
        </aside>
      </main>
    </div>
  );
};

export default SentencePracticePage;