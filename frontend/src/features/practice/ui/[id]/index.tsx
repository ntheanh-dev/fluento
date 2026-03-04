import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
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
import { useSubmitUserSentence } from "../../hooks/useSubmitUserSentence";
import { Aside } from "./Aside";
import type { ApiError } from "@/shared/api/type";
import { AxiosError } from "axios";
import { useAnswerPreviewFeedbackStream } from "../../hooks/useAnswerPreviewFeedbackStream";

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

export type RenderAsideType = "hints" | "markdownFeedback" | null;

const SentencePracticePage = () => {
  const { id } = useParams();
  const { isMobile, isTablet } = useDeviceType();
  const navigate = useNavigate();

  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [translation, setTranslation] = useState("");
  const [vietNameseSentences, setVietNameseSentences] = useState<string[]>([]);
  const [englishTranslations, setEnglishTranslations] = useState<string[]>([]);
  const [translationHints, setTranslationHints] =
    useState<HintContent | null>(null);
  const [renderAsideType, setRenderAsideType] = useState<RenderAsideType>(null);
  const { data, error: errorUserPracticeData } = useUserPracticeData(Number(id));

  const answerPreviewPayload = useMemo(
    () => ({ translatedSentence: translation, orderIndex }),
    [translation, orderIndex]
  );

  const {
    feedback,
    isStreaming,
    start: startFeedbackStream,
    reset: resetFeedbackStream,
  } = useAnswerPreviewFeedbackStream(Number(id), answerPreviewPayload);

  const submitPayload = useMemo(
    () => ({
      vietnameseSentence: translation,
      orderIndex,
      feedback: feedback as SentenceFeedback,
    }),
    [translation, orderIndex, feedback]
  );

  const { mutateAsync: getTranslationHints, isPending: isLoadingTranslationHints } = useParagraphHints(Number(id), orderIndex);
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

  const isLoadingAnswerPreview = isStreaming;

  const handleGetAnswerPreview = async () => {
    if (!translation.trim()) return;
    if (isStreaming) return;
    setRenderAsideType("markdownFeedback");
    if (isMobile || isTablet) {
      setShowMobileSidebar(true);
    }
    resetFeedbackStream();
    try {
      await startFeedbackStream();
    } catch (error) {
      setShowMobileSidebar(false);
      showApiError(error);
    }
  };

  const handleNextSentence = async () => {
    if (isLoadingSubmitUserSentence || !feedback) return;

    try {
      const userSentenceAnswer = await submitUserSentence();
      setEnglishTranslations([...englishTranslations, userSentenceAnswer.userTranslation]);
      setOrderIndex(orderIndex + 1);
      setTranslation("");
      setTranslationHints(null);
      setRenderAsideType(null);
      resetFeedbackStream();
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
    <div className="max-w-screen-2xl mx-auto h-[calc(100vh-130px+4rem)] -mt-4 sm:-mt-6 md:-mt-8 -mb-4 sm:-mb-6 md:-mb-8 flex flex-col overflow-hidden">
      {/* Top Bar for Task Info */}
      <div className="flex items-center justify-between py-3 md:py-4 mb-2 shrink-0 px-1 sm:px-0 gap-4">
        <div className="flex-[10] flex flex-row items-center justify-between gap-4">
          {data?.paragraph.type !== "BASIC" && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{data?.paragraph.type}</h1>
              <p className="text-slate-600 text-sm max-w-xl">
                {data?.paragraph.title}
              </p>
            </div>
          )}
          <div className="flex flex-row items-center gap-1.5 sm:gap-4">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Topic</span>
              <span className="text-xs font-semibold text-slate-700">{data?.paragraph.topic.toLowerCase()}</span>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tone</span>
              <span className="text-xs font-semibold text-slate-700">{data?.paragraph.tone.toLowerCase()}</span>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Level</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">{data?.paragraph.level}</span>
            </div>
          </div>
        </div>
        <div className="flex-[2] hidden md:flex items-center gap-4 lg:gap-6 w-full">
          <span className="text-xs md:text-sm font-medium text-slate-500 whitespace-nowrap">
            Câu {orderIndex}/{vietNameseSentences.length}
          </span>
          <div className="w-36 md:w-44 lg:w-48 h-2 md:h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-blue-600">{progressPercent}%</span>
        </div>
      </div>



      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden sm:pb-4 sm:px-0">
        {/* Left Column: Workspace (Source & Input) */}
        <section className="lg:col-span-8 flex flex-col gap-3 sm:gap-4 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
          {/* Source Context View */}
          <div className="flex-[10] min-h-0 bg-slate-50/50 rounded-lg bg-white sm:rounded-xl border border-slate-200 shadow-sm overflow-hidden p-3 md:px-6 text-slate-800 font-medium h-full overflow-y-auto leading-6 sm:leading-7 space-y-3 sm:space-y-4">
            {vietNameseSentences.map((sentence, index) => (
              <React.Fragment key={index}>
                {index <= englishTranslations.length - 1 ? (
                  // Completed sentences - show English translation
                  <span className="relative inline text-black py-1 whitespace-pre-line text-sm">
                    {" " + englishTranslations[index]}
                  </span>
                ) : // Current and upcoming sentences
                  index === englishTranslations.length ? (
                    // Current sentence to translate
                    <span className="relative inline whitespace-pre-line text-sm py-2 text-blue-600 font-bold">
                      {" " + sentence}
                    </span>
                  ) : (
                    // Upcoming sentences
                    <span className="relative inline whitespace-pre-line text-sm text-gray-600 opacity-60">
                      {" " + sentence}
                    </span>
                  )}
              </React.Fragment>
            ))}
          </div>

          {/* English Translation Flow (Input) */}
          <div className="flex-[2] flex flex-col flex-1">
            <textarea
              className="w-full p-4 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm sm:text-sm transition-all resize-none min-h-[72px] sm:min-h-[80px]"
              placeholder="Nhập câu dịch của bạn ở đây..."
              rows={2}
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
            />

            <div className="flex justify-between items-center mt-2 sm:mt-3 gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/setup")}
                  className="shrink-0 group p-2 sm:p-2.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg sm:rounded-xl text-slate-400 hover:text-slate-700 transition-all border border-slate-200 shadow-sm bg-white touch-manipulation"
                >
                  <ArrowLeft
                    size={20}
                    className="group-hover:-translate-x-0.5 transition-transform w-5 h-5"
                  />
                </button>
                <button
                  onClick={handleGetTranslationHints}
                  disabled={isLoadingTranslationHints}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-1.5 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed sm:px-5 sm:py-2 sm:text-sm md:px-6 text-xs"
                >
                  <Lightbulb size={16} className="size-4 shrink-0" />
                  Xem gợi ý
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={isLoadingAnswerPreview || !translation}
                  onClick={handleGetAnswerPreview}
                  className="inline-flex items-center gap-2 rounded-lg border-0 bg-blue-600 px-4 py-1.5 font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed sm:px-5 sm:py-2 sm:text-sm md:px-6 text-xs"
                >
                  {isLoadingAnswerPreview ? (
                    <Loader2 size={16} className="size-4 shrink-0 animate-spin" />
                  ) : (
                    <Check size={16} className="size-4 shrink-0" />
                  )}
                  Kiểm tra
                </button>
                {feedback && (
                  <button
                    disabled={isLoadingSubmitUserSentence || !feedback}
                    onClick={handleNextSentence}
                    className="inline-flex items-center gap-2 rounded-lg border-0 bg-blue-600 px-4 py-1.5 font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed sm:px-5 sm:py-2 sm:text-sm md:px-6 text-xs"
                  >
                    {isLoadingSubmitUserSentence ? (
                      <Loader2 size={16} className="size-4 shrink-0 animate-spin" />
                    ) : (
                      <ArrowRight size={16} className="size-4 shrink-0" />
                    )}
                    Tiếp theo
                  </button>
                )}

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
              lg:col-span-4 flex flex-col transition-all duration-300 ease-in-out overflow-hidden
              ${showMobileSidebar
              ? "fixed inset-x-0 bottom-0 top-20 z-50 bg-white rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] p-3 sm:p-4 lg:static lg:p-0 lg:shadow-none lg:bg-transparent lg:rounded-none"
              : "hidden lg:flex"
            }
          `}
        >

          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
            {/* Mobile Close Button */}
            <div className="lg:hidden absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <Aside
              renderAsideType={renderAsideType}
              isLoadingAnswerPreview={isLoadingAnswerPreview}
              isLoadingTranslationHints={isLoadingTranslationHints}
              translationHints={translationHints as HintContent | null}
              feedback={feedback}
              isStreaming={isStreaming}
            />
          </div>
        </aside>
      </main>
    </div>
  );
};

export default SentencePracticePage;