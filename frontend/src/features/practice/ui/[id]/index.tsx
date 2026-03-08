import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  X,
  Check,
  Loader2,
  Clock,
} from "lucide-react";
import { useDeviceType } from "@/shared/utilities/useDeviceType";
import { useParagraphHints, useUserPracticeData } from "../../hooks/useUserPractice";
import { formatElapsed, splitIntoSentences } from "@/utils/utils";
import type { HintContent } from "@/entities/hints/schema";
import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";
import { useSubmitUserSentence } from "../../hooks/useSubmitUserSentence";
import { Aside } from "./Aside";
import { showApiError } from "@/shared/api/showApiError";
import { useAnswerPreviewFeedbackStream } from "../../hooks/useAnswerPreviewFeedbackStream";
import { AxiosError } from "axios";

function normalizeSentence(text: string, originalText?: string): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  let result = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

  if (!/[.!?]["']?$/.test(result)) {
    result = `${result}.`;
  }

  if (originalText && originalText.includes("\n\n")) {
    result = `${result}\n\n`;
  }

  return result;
}

export type RenderAsideType = "hints" | "markdownFeedback" | null;

/**
 * Trang luyện dịch từng câu trong một đoạn văn.
 * Cho phép nhập bản dịch, xem gợi ý, kiểm tra phản hồi và chuyển câu tiếp theo.
 */
const SentencePracticePage = () => {
  // --- Router & device ---
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDeviceType();

  // --- State: practice (câu hiện tại, bản dịch, gợi ý, feedback) ---
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [translation, setTranslation] = useState("");
  const [vietNameseSentences, setVietNameseSentences] = useState<string[]>([]);
  const [englishTranslations, setEnglishTranslations] = useState<string[]>([]);
  const [translationHints, setTranslationHints] = useState<HintContent | null>(null);
  const [lastCheckedTranslation, setLastCheckedTranslation] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // --- State: UI (sidebar, nội dung aside) ---
  const [renderAsideType, setRenderAsideType] = useState<RenderAsideType>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // --- Refs ---
  /** Thời điểm bắt đầu luyện (ms), dùng để tính elapsed và learningTime. */
  const startedAtRef = useRef<number | null>(null);

  // --- Data hooks ---
  const { data, error: errorUserPracticeData } = useUserPracticeData(Number(id));

  const answerPreviewPayload = useMemo(
    () => ({
      translatedSentence: normalizeSentence(translation, vietNameseSentences[orderIndex]),
      orderIndex,
    }),
    [translation, orderIndex, vietNameseSentences]
  );

  const {
    feedback,
    isStreaming,
    start: startFeedbackStream,
    reset: resetFeedbackStream,
    error: errorFeedbackStream,
  } = useAnswerPreviewFeedbackStream(Number(id), answerPreviewPayload);

  const submitPayload = useMemo(
    () => ({
      vietnameseSentence: normalizeSentence(translation, vietNameseSentences[orderIndex]),
      orderIndex,
      feedback: feedback as SentenceFeedback,
      ...(startedAtRef.current != null
        ? { learningTime: Date.now() - startedAtRef.current }
        : {}),
    }),
    [translation, orderIndex, feedback]
  );

  const { mutateAsync: getTranslationHints, isPending: isLoadingTranslationHints } =
    useParagraphHints(Number(id), orderIndex);
  const { mutateAsync: submitUserSentence, isPending: isLoadingSubmitUserSentence } =
    useSubmitUserSentence(Number(id), submitPayload);

  // --- Effects ---

  /** Đồng bộ paragraph data: câu tiếng Việt, bản dịch đã nộp, orderIndex, learningTime. */
  useEffect(() => {
    if (data && !errorUserPracticeData) {
      const vnSentences = splitIntoSentences(data.paragraph.content);
      if (data?.sentenceAnswers?.length === vnSentences.length) {
        navigate(`/practice/${id}/result`);
        return;
      }
      setVietNameseSentences(vnSentences);
      setEnglishTranslations(data.sentenceAnswers?.map((a) => a.userTranslation) ?? []);
      setOrderIndex(data.sentenceAnswers?.length ?? 0);
      if (startedAtRef.current === null) {
        const baseMs = Number(data.learningTime ?? 0);
        startedAtRef.current = Date.now() - baseMs;
        setElapsedSeconds(Math.floor(baseMs / 1000));
      }
    }
    if (errorUserPracticeData) {
      showApiError(errorUserPracticeData);
      if ((errorUserPracticeData as AxiosError)?.response?.status === 404) {
        navigate("/dashboard");
        return;
      }
    }
  }, [id, data, errorUserPracticeData]);

  /** Hiển thị lỗi khi stream feedback thất bại; đóng sidebar mobile. */
  useEffect(() => {
    if (errorFeedbackStream != null) {
      showApiError(errorFeedbackStream);
      setShowMobileSidebar(false);
    }
  }, [errorFeedbackStream]);

  /** Cập nhật elapsed mỗi giây khi đã có data và đã bắt đầu. */
  useEffect(() => {
    if (startedAtRef.current === null) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current!) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [data, errorUserPracticeData]);

  /** Trên desktop thì tắt sidebar mobile (chỉ dùng trên mobile/tablet). */
  useEffect(() => {
    if (!isMobile) {
      setShowMobileSidebar(false);
    }
  }, [isMobile]);

  // --- Handlers ---

  const handleCloseMobileSidebar = useCallback(() => setShowMobileSidebar(false), []);
  const handleBackToSetup = useCallback(() => navigate("/setup"), [navigate]);

  /** Mở sidebar và load/hiển thị gợi ý dịch cho câu hiện tại. */
  const handleGetTranslationHints = useCallback(async () => {
    setShowMobileSidebar(true);
    setRenderAsideType("hints");
    if (translationHints) return;
    try {
      const res = await getTranslationHints();
      setTranslationHints(res);
    } catch (error) {
      setShowMobileSidebar(false);
      setRenderAsideType(null);
      showApiError(error);
    }
  }, [translationHints, getTranslationHints]);

  /** Chuẩn hóa bản dịch, gửi lên để xem feedback (stream), mở aside markdown. */
  const handleGetAnswerPreview = useCallback(async () => {
    if (!translation.trim() || isStreaming) return;
    setRenderAsideType("markdownFeedback");
    if (isMobile || isTablet) setShowMobileSidebar(true);

    const normalized = normalizeSentence(translation, vietNameseSentences[orderIndex]);
    if (normalized !== translation) setTranslation(normalized);
    setLastCheckedTranslation(normalized);

    resetFeedbackStream();
    try {
      await startFeedbackStream();
    } catch {
      setShowMobileSidebar(false);
    }
  }, [translation]);

  /** Nộp câu đã kiểm tra, chuyển sang câu tiếp theo hoặc sang trang result nếu hết. */
  const handleNextSentence = useCallback(async () => {
    if (isLoadingSubmitUserSentence || !feedback) return;
    if (!lastCheckedTranslation || lastCheckedTranslation !== translation) return;

    const normalized = normalizeSentence(translation);
    if (normalized !== translation) setTranslation(normalized);

    try {
      const userSentenceAnswer = await submitUserSentence();
      if (orderIndex === vietNameseSentences.length - 1) {
        navigate(`/practice/${id}/result`);
        return;
      }
      setEnglishTranslations((prev) => [...prev, userSentenceAnswer.userTranslation]);
      setOrderIndex((i) => i + 1);
      setTranslation("");
      setTranslationHints(null);
      setRenderAsideType(null);
      setLastCheckedTranslation(null);
      resetFeedbackStream();
    } catch (error) {
      showApiError(error);
    }
  }, [translation]);

  // --- Derived (cho UI) ---
  const progressPercent = useMemo(
    () => Math.round((orderIndex / (vietNameseSentences.length || 1)) * 100),
    [orderIndex, vietNameseSentences.length]
  );
  /** Chỉ có trong chế độ SINGLE_SENTENCE; dùng cho block nguồn. */
  const singleSentenceText = useMemo(
    () => (data?.paragraph?.type === "SINGLE_SENTENCE" ? vietNameseSentences[orderIndex] ?? null : null),
    [data?.paragraph?.type, vietNameseSentences, orderIndex]
  );

  return (
    <div className="max-w-screen-2xl mx-auto h-[calc(100vh-130px+4rem)] -mt-4 sm:-mt-6 md:-mt-8 -mb-4 sm:-mb-6 md:-mb-8 flex flex-col overflow-hidden">
      {/* Top Bar for Task Info */}
      <div className="flex items-center justify-between py-3 md:py-4 mb-2 shrink-0 px-1 sm:px-0 gap-4">
        <div className="flex-[10] flex flex-row items-center justify-between gap-4">
          {data?.paragraph.type !== "BASIC" && data?.paragraph.type !== "SINGLE_SENTENCE" && (
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
            {data && (
              <div className="h-8 w-px bg-slate-100"></div>
            )}
            {data && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Clock size={14} className="text-slate-500" />
                  {formatElapsed(elapsedSeconds)}
                </span>
              </div>
            )}
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
          {singleSentenceText != null ? (
            <div className="bg-slate-50/50 rounded-lg bg-white sm:rounded-xl border border-slate-200 shadow-sm overflow-hidden p-3 md:px-6 text-slate-800 font-medium leading-6 sm:leading-7 space-y-3 sm:space-y-4">
              <span className="relative inline whitespace-pre-line text-sm py-2 text-blue-600 font-bold">
                {singleSentenceText}
              </span>
            </div>
          ) : (
            <div className="flex-[10] min-h-0 bg-slate-50/50 rounded-lg bg-white sm:rounded-xl border border-slate-200 shadow-sm overflow-hidden p-3 md:px-6 text-slate-800 font-medium h-full overflow-y-auto leading-6 sm:leading-7 space-y-3 sm:space-y-4">
              {
                vietNameseSentences.map((sentence, index) => (
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
                ))
              }

            </div>
          )}

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
                  onClick={handleBackToSetup}
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
                  disabled={isStreaming || !translation}
                  onClick={handleGetAnswerPreview}
                  className="inline-flex items-center gap-2 rounded-lg border-0 bg-blue-600 px-4 py-1.5 font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed sm:px-5 sm:py-2 sm:text-sm md:px-6 text-xs"
                >
                  {isStreaming ? (
                    <Loader2 size={16} className="size-4 shrink-0 animate-spin" />
                  ) : (
                    <Check size={16} className="size-4 shrink-0" />
                  )}
                  Kiểm tra
                </button>
                {feedback && (
                  <button
                    disabled={
                      isLoadingSubmitUserSentence ||
                      !feedback ||
                      !lastCheckedTranslation ||
                      lastCheckedTranslation !== translation
                    }
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
            onClick={handleCloseMobileSidebar}
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
                onClick={handleCloseMobileSidebar}
                className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <Aside
              renderAsideType={renderAsideType}
              isLoadingAnswerPreview={isStreaming}
              isLoadingTranslationHints={isLoadingTranslationHints}
              translationHints={translationHints as HintContent | null}
              feedback={feedback}
              userTranslation={translation}
              isStreaming={isStreaming}
            />
          </div>
        </aside>
      </main>
    </div>
  );
};

export default SentencePracticePage;