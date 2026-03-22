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
  Coins,
} from "lucide-react";
import { useDeviceType } from "@/shared/utilities/useDeviceType";
import { useSentenceVocabularyHints, useUserPracticeData } from "../../hooks/useUserPractice";
import { useCredits } from "@/features/credits/query";
import { formatElapsed } from "@/utils/utils";
import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";
import { useSubmitUserSentence } from "../../hooks/useSubmitUserSentence";
import { Aside } from "./Aside";
import { showApiError } from "@/shared/api/showApiError";
import { useAnswerPreviewFeedback } from "../../hooks/useAnswerPreviewFeedbackStream";
import { AxiosError } from "axios";
import type { ParagraphSentence } from "@/entities/paragraphSentence/schema";

export type RenderAsideType = "hints" | "markdownFeedback" | null;

const SentencePracticePage = () => {
  // --- Router & device ---
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDeviceType();

  // --- State: practice (câu hiện tại, bản dịch, gợi ý, feedback) ---
  const [currentVietNameseSentence, setCurrentVietNameseSentence] = useState<ParagraphSentence | null>(null);
  const [translation, setTranslation] = useState("");
  const [vietNameseSentences, setVietNameseSentences] = useState<ParagraphSentence[]>([]);
  const [englishTranslations, setEnglishTranslations] = useState<string[]>([]);
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
  const { data: creditBalance, refetch: refetchCredits } = useCredits();

  const answerPreviewPayload = useMemo(
    () => ({
      translatedSentence: translation,
      orderIndex: currentVietNameseSentence?.orderIndex ?? 0,
    }),
    [translation, currentVietNameseSentence]
  );


  const {
    mutateAsync: getAnswerPreview,
    isPending: isLoadingAnswerPreview,
    error: errorAnswerPreview,
  } = useAnswerPreviewFeedback(Number(id), answerPreviewPayload);

  const [feedback, setFeedback] = useState<SentenceFeedback | null>(null);

  const submitPayload = useMemo(
    () => ({
      vietnameseSentence: translation,
      orderIndex: currentVietNameseSentence?.orderIndex ?? 0,
      feedback: feedback as SentenceFeedback,
      ...(startedAtRef.current != null
        ? { learningTime: Date.now() - startedAtRef.current }
        : {}),
    }),
    [translation, currentVietNameseSentence, feedback]
  );

  const { mutateAsync: getVocabularyHints, isPending: isLoadingVocabularyHints } =
    useSentenceVocabularyHints(currentVietNameseSentence?.id ?? -1);
  const { mutateAsync: submitUserSentence, isPending: isLoadingSubmitUserSentence } =
    useSubmitUserSentence(Number(id), submitPayload);

  // --- Effects ---

  /** Đồng bộ paragraph data: câu tiếng Việt, bản dịch đã nộp, orderIndex, learningTime. */
  useEffect(() => {
    if (data && !errorUserPracticeData) {
      const sentences = data.paragraph.sentences ?? [];
      setVietNameseSentences(sentences);
      setEnglishTranslations(data.sentenceAnswers?.map((a) => a.userTranslation) ?? []);
      setCurrentVietNameseSentence(sentences[data.sentenceAnswers?.length ?? 0] ?? null);
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

  /** Hiển thị lỗi khi lấy feedback thất bại; đóng sidebar mobile. */
  useEffect(() => {
    if (errorAnswerPreview != null) {
      showApiError(errorAnswerPreview);
      setShowMobileSidebar(false);
    }
  }, [errorAnswerPreview]);

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
  const handleGetVocabularyHints = useCallback(async () => {
    if (currentVietNameseSentence == null) return;
    setShowMobileSidebar(true);
    setRenderAsideType("hints");
    if (currentVietNameseSentence?.vocabularyHints) return;
    try {
      const sentenceWithHints = await getVocabularyHints();
      setCurrentVietNameseSentence(sentenceWithHints);
      setVietNameseSentences((prev) =>
        prev.map((sentence) => (sentence.id === sentenceWithHints.id ? sentenceWithHints : sentence))
      );
      await refetchCredits();
    } catch (error) {
      setShowMobileSidebar(false);
      setRenderAsideType(null);
      showApiError(error);
    }
  }, [currentVietNameseSentence, getVocabularyHints, refetchCredits]);

  /** Chuẩn hóa bản dịch, gửi lên để xem feedback, mở aside markdown. */
  const handleGetAnswerPreview = useCallback(async () => {
    if (!translation.trim() || isLoadingAnswerPreview || !currentVietNameseSentence) return;
    setRenderAsideType("markdownFeedback");
    if (isMobile || isTablet) setShowMobileSidebar(true);

    setLastCheckedTranslation(translation);

    try {
      const res = await getAnswerPreview();
      setFeedback(res as SentenceFeedback);
      await refetchCredits();
    } catch {
      setShowMobileSidebar(false);
    }
  }, [translation, isLoadingAnswerPreview, isMobile, isTablet, getAnswerPreview, currentVietNameseSentence, refetchCredits]);

  /** Nộp câu đã kiểm tra, chuyển sang câu tiếp theo hoặc sang trang result nếu hết. */
  const handleNextSentence = useCallback(async () => {
    if (isLoadingSubmitUserSentence || !feedback || !currentVietNameseSentence) return;

    try {
      const userSentenceAnswer = await submitUserSentence();
      // Refresh credits after a successful AI-assisted check & submit
      await refetchCredits();
      if ((currentVietNameseSentence?.orderIndex ?? 0) === vietNameseSentences.length - 1) {
        navigate(`/practice/${id}/result`);
        return;
      }
      setEnglishTranslations((prev) => [...prev, userSentenceAnswer.userTranslation]);
      setCurrentVietNameseSentence(vietNameseSentences[(currentVietNameseSentence?.orderIndex ?? 0) + 1] ?? null);
      setTranslation("");
      setRenderAsideType(null);
      setLastCheckedTranslation(null);
    } catch (error) {
      showApiError(error);
    }
  }, [isLoadingSubmitUserSentence, feedback, currentVietNameseSentence, submitUserSentence, refetchCredits, vietNameseSentences, navigate, id]);

  // --- Derived (cho UI) ---
  const progressPercent = useMemo(
    () => Math.round((((currentVietNameseSentence?.orderIndex ?? 0)) / (vietNameseSentences.length || 1)) * 100),
    [currentVietNameseSentence, vietNameseSentences.length]
  );
  /** Chỉ có trong chế độ SINGLE_SENTENCE; dùng cho block nguồn. */
  const singleSentenceText = useMemo(
    () => (data?.paragraph?.type === "SINGLE_SENTENCE" ? currentVietNameseSentence : null),
    [data?.paragraph?.type, currentVietNameseSentence]
  );

  return (
    <div className="h-[calc(100vh-130px+4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col overflow-hidden dark:text-slate-100">
      {/* Top Bar for Task Info */}
      <div className="flex items-center justify-between md:py-4 mb-2 shrink-0 px-1 sm:px-0 gap-4">
        <div className="flex-[10] flex flex-row items-center justify-between gap-4">
          {data?.paragraph.type !== "BASIC" && data?.paragraph.type !== "SINGLE_SENTENCE" && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{data?.paragraph.type}</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
                {data?.paragraph.title}
              </p>
            </div>
          )}
          <div className="flex flex-row items-center gap-1.5 sm:gap-4">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Topic</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{data?.paragraph.topic.toLowerCase()}</span>
            </div>
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-700"></div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tone</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{data?.paragraph.tone.toLowerCase()}</span>
            </div>
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-700"></div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Level</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">{data?.paragraph.level}</span>
            </div>
            {data && <div className="h-8 w-px bg-slate-100 dark:bg-slate-700"></div>}
            {data && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <Clock size={14} className="text-slate-500 dark:text-slate-400" />
                  {formatElapsed(elapsedSeconds)}
                </span>
              </div>
            )}
            {typeof creditBalance?.credits === "number" && (
              <>
                <div className="h-8 w-px bg-slate-100 dark:bg-slate-700"></div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Credits</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Coins size={14} className="text-amber-500" />
                    {creditBalance.credits}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex-[2] hidden md:flex items-center gap-4 lg:gap-6 w-full">
          <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Câu {currentVietNameseSentence?.orderIndex ?? 0}/{vietNameseSentences.length}
          </span>
          <div className="w-36 md:w-44 lg:w-48 h-2 md:h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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
            <div className="bg-slate-50/50 dark:bg-slate-950/30 rounded-lg bg-white dark:bg-slate-900/90 sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-3 md:px-6 text-slate-800 dark:text-slate-100 font-medium leading-6 sm:leading-7 space-y-3 sm:space-y-4">
              <span className="relative inline whitespace-pre-line text-sm py-2 text-blue-600 font-bold">
                {singleSentenceText.content}
              </span>
            </div>
          ) : (
            <div className="flex-[10] min-h-0 bg-slate-50/50 dark:bg-slate-950/30 rounded-lg bg-white dark:bg-slate-900/90 sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-3 md:px-6 text-slate-800 dark:text-slate-100 font-medium h-full overflow-y-auto leading-6 sm:leading-7 space-y-3 sm:space-y-4">
              {
                vietNameseSentences.map((sentence: ParagraphSentence, index: number) => (
                  <React.Fragment key={index}>
                    {index < (currentVietNameseSentence?.orderIndex ?? 0) ? (
                      // Completed sentences - show English translation
                      <span className="relative inline text-black dark:text-slate-100 py-1 whitespace-pre-line text-sm">
                        {" " + englishTranslations[index].replace(/\\n/g, "\n\n")}
                      </span>
                    ) : // Current and upcoming sentences
                      index === (currentVietNameseSentence?.orderIndex ?? 0) ? (
                        // Current sentence to translate
                        <span className="relative inline whitespace-pre-line text-sm py-2 text-blue-600 font-bold">
                          {" " + sentence.content.replace(/\\n/g, "\n\n")}
                        </span>
                      ) : (
                        // Upcoming sentences
                        <span className="relative inline whitespace-pre-line text-sm text-gray-600 dark:text-slate-500 opacity-60">
                          {" " + sentence.content.replace(/\\n/g, "\n\n")}
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
              className="w-full p-4 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 outline-none text-sm sm:text-sm text-slate-900 dark:text-slate-100 transition-all resize-none min-h-[72px] sm:min-h-[80px]"
              placeholder="Nhập câu dịch của bạn ở đây..."
              rows={2}
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
            />

            <div className="flex justify-between items-center mt-2 sm:mt-3 gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackToSetup}
                  className="shrink-0 group p-2 sm:p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 rounded-lg sm:rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 touch-manipulation"
                >
                  <ArrowLeft
                    size={20}
                    className="group-hover:-translate-x-0.5 transition-transform w-5 h-5"
                  />
                </button>
                <button
                  onClick={handleGetVocabularyHints}
                  disabled={isLoadingVocabularyHints}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-1.5 font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed sm:px-5 sm:py-2 sm:text-sm md:px-6 text-xs"
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
              ? "fixed inset-x-0 bottom-0 top-20 z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] p-3 sm:p-4 lg:static lg:p-0 lg:shadow-none lg:bg-transparent lg:rounded-none"
              : "hidden lg:flex"
            }
          `}
        >

          <div className="bg-white dark:bg-slate-900/90 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden relative">
            {/* Mobile Close Button */}
            <div className="lg:hidden absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
              <button
                onClick={handleCloseMobileSidebar}
                className="p-1.5 sm:p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <Aside
              renderAsideType={renderAsideType}
              isLoadingAnswerPreview={isLoadingAnswerPreview}
              isLoadingVocabularyHints={isLoadingVocabularyHints}
              vocabularyHints={currentVietNameseSentence?.vocabularyHints ?? null}
              feedback={feedback}
              userTranslation={lastCheckedTranslation ?? translation}
            />
          </div>
        </aside>
      </main>
    </div>
  );
};

export default SentencePracticePage;

