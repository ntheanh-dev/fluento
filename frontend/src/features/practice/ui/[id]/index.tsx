import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Check,
  Loader2,
  Clock,
  Coins,
} from "lucide-react";
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
import type { VocabularyHint } from "@/entities/paragraphSentence/schema";
import { useTranslation } from "react-i18next";
import { subscriptionHref } from "@/features/profile/subscriptionAnchors";
import coinRewardAudioSrc from "@/assets/audio/chieuk-coin-257878.mp3";
import type { TargetLanguage } from "@/shared/constants/target-language";
import { FlagIcon, getTargetLanguageCountryCode } from "@/shared/utilities/flag";
import { upperFirstCharactor } from "@/shared/utilities";
import type { RenderAsideType } from "../../schema";

const SentencePracticePage = () => {
  const { t } = useTranslation();
  // --- Router & device ---
  const { id } = useParams();
  const navigate = useNavigate();
  const practiceId = Number(id);
  const idValid = id != null && id !== "" && Number.isFinite(practiceId) && practiceId > 0;
  // --- State: practice (câu hiện tại, bản dịch, gợi ý, feedback) ---
  const [currentVietNameseSentence, setCurrentVietNameseSentence] = useState<ParagraphSentence | null>(null);
  const [translation, setTranslation] = useState("");
  const [vietNameseSentences, setVietNameseSentences] = useState<ParagraphSentence[]>([]);
  const [englishTranslations, setEnglishTranslations] = useState<string[]>([]);
  const [lastCheckedTranslation, setLastCheckedTranslation] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // --- State: UI (sidebar, nội dung aside) ---
  const [renderAsideType, setRenderAsideType] = useState<RenderAsideType>(null);
  // --- Refs ---
  /** Thời điểm bắt đầu luyện (ms), dùng để tính elapsed và learningTime. */
  const startedAtRef = useRef<number | null>(null);
  const coinAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- Data hooks ---
  const { data, error: errorUserPracticeData } = useUserPracticeData(practiceId);
  const { data: creditBalance, refetch: refetchCredits } = useCredits();

  const answerPreviewPayload = useMemo(
    () => ({
      translatedSentence: translation,
      orderIndex: currentVietNameseSentence?.orderIndex ?? 0,
    }),
    [translation, currentVietNameseSentence]
  );

  const [feedback, setFeedback] = useState<SentenceFeedback | null>(null);
  const [streamingFeedback, setStreamingFeedback] = useState<Partial<SentenceFeedback> | null>(null);
  const [streamingVocabularyHints, setStreamingVocabularyHints] = useState<VocabularyHint[] | null>(null);
  const [vocabularyHintsBySentenceId, setVocabularyHintsBySentenceId] = useState<Record<number, VocabularyHint[]>>({});
  const [coinBurstCount, setCoinBurstCount] = useState(0);

  const {
    mutateAsync: getAnswerPreview,
    isPending: isLoadingAnswerPreview,
    error: errorAnswerPreview,
  } = useAnswerPreviewFeedback(practiceId, answerPreviewPayload, undefined, setStreamingFeedback);

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
    useSubmitUserSentence(practiceId, submitPayload);

  // --- Effects ---

  /** Đồng bộ paragraph data: câu tiếng Việt, bản dịch đã nộp, orderIndex, learningTime. */
  useEffect(() => {
    if (data && !errorUserPracticeData) {
      const sentences = data.paragraph.sentences ?? [];
      setVietNameseSentences(sentences);
      setVocabularyHintsBySentenceId(
        sentences.reduce<Record<number, VocabularyHint[]>>((acc, sentence) => {
          if ((sentence.vocabularyHints?.length ?? 0) > 0) {
            acc[sentence.id] = sentence.vocabularyHints!;
          }
          return acc;
        }, {})
      );
      setEnglishTranslations(data.sentenceAnswers?.map((a) => a.userTranslation) ?? []);
      setCurrentVietNameseSentence(sentences[data.sentenceAnswers?.length ?? 0] ?? null);
      if (startedAtRef.current === null) {
        const baseMs = Number(data.learningTime ?? 0);
        startedAtRef.current = Date.now() - baseMs;
        setElapsedSeconds(Math.floor(baseMs / 1000));
      }
    }
    if (errorUserPracticeData) {
      const status = (errorUserPracticeData as AxiosError)?.response?.status;
      if (status !== 404) {
        showApiError(errorUserPracticeData);
      }
    }
  }, [id, data, errorUserPracticeData]);

  useEffect(() => {
    setStreamingVocabularyHints(null);
  }, [currentVietNameseSentence?.id]);

  /** Hiển thị lỗi khi lấy feedback thất bại. */
  useEffect(() => {
    if (errorAnswerPreview != null) {
      showApiError(errorAnswerPreview);
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

  // --- Handlers ---

  const handleBack = useCallback(() => history.back(), [history]);
  const playCoinRewardSound = useCallback(() => {
    if (!coinAudioRef.current) return;
    coinAudioRef.current.currentTime = 0;
    void coinAudioRef.current.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const audio = new Audio(coinRewardAudioSrc);
    audio.preload = "auto";
    audio.volume = 0.45;
    coinAudioRef.current = audio;
    return () => {
      audio.pause();
      coinAudioRef.current = null;
    };
  }, []);

  /** Mở sidebar và load/hiển thị gợi ý dịch cho câu hiện tại. */
  const handleGetVocabularyHints = useCallback(async () => {
    if (currentVietNameseSentence == null) return;
    setRenderAsideType("hints");
    if ((vocabularyHintsBySentenceId[currentVietNameseSentence.id]?.length ?? 0) > 0) {
      setStreamingVocabularyHints(null);
      return;
    }
    setStreamingVocabularyHints([]);
    try {
      const sentenceWithHints = await getVocabularyHints({
        targetLanguage: (data?.targetLanguage ?? "EN") as TargetLanguage,
        onPartialHints: (partial) => setStreamingVocabularyHints(partial),
      });
      const nextHints = sentenceWithHints.vocabularyHints ?? [];
      setVocabularyHintsBySentenceId((prev) => ({
        ...prev,
        [currentVietNameseSentence.id]: nextHints,
      }));
      setStreamingVocabularyHints(null);
      await refetchCredits();
    } catch (error) {
      setStreamingVocabularyHints(null);
      setRenderAsideType(null);
      showApiError(error);
    }
  }, [currentVietNameseSentence, vocabularyHintsBySentenceId, getVocabularyHints, refetchCredits, data?.targetLanguage]);

  /** Chuẩn hóa bản dịch, gửi lên để xem feedback, mở aside markdown. */
  const handleGetAnswerPreview = useCallback(async () => {
    if (!translation.trim() || isLoadingAnswerPreview || !currentVietNameseSentence) return;
    setRenderAsideType("markdownFeedback");
    setStreamingFeedback(null);
    setFeedback(null);

    setLastCheckedTranslation(translation);

    try {
      const res = await getAnswerPreview();
      setFeedback(res as SentenceFeedback);
      setStreamingFeedback(null);
      setCoinBurstCount(Math.max(0, Number(res.coinAwarded ?? 0)));
      await refetchCredits();
    } catch {
      setStreamingFeedback(null);
      setRenderAsideType(null);
    }
  }, [translation, isLoadingAnswerPreview, getAnswerPreview, currentVietNameseSentence, refetchCredits]);


  useEffect(() => {
    if (coinBurstCount <= 0) return;
    playCoinRewardSound();
    const timeout = setTimeout(() => setCoinBurstCount(0), 1800);
    return () => clearTimeout(timeout);
  }, [coinBurstCount, playCoinRewardSound]);

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
      setStreamingFeedback(null);
    } catch (error) {
      showApiError(error);
    }
  }, [isLoadingSubmitUserSentence, feedback, currentVietNameseSentence, submitUserSentence, refetchCredits, vietNameseSentences, navigate, id]);

  const handleTranslationKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
      e.preventDefault();

      const canSubmit =
        Boolean(feedback) &&
        !isLoadingSubmitUserSentence &&
        !isLoadingAnswerPreview &&
        Boolean(lastCheckedTranslation) &&
        lastCheckedTranslation === translation;

      if (canSubmit) {
        void handleNextSentence();
        return;
      }

      if (!isLoadingAnswerPreview && translation.trim()) {
        void handleGetAnswerPreview();
      }
    },
    [
      feedback,
      isLoadingSubmitUserSentence,
      isLoadingAnswerPreview,
      lastCheckedTranslation,
      translation,
      handleNextSentence,
      handleGetAnswerPreview,
    ]
  );

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

  const practiceNotFound =
    idValid &&
    errorUserPracticeData != null &&
    (errorUserPracticeData as AxiosError)?.response?.status === 404;
  const targetLanguage: TargetLanguage = (data?.targetLanguage ?? "EN") as TargetLanguage;
  const targetLanguageLabel =
    targetLanguage === "ZH" ? "Chinese" : targetLanguage === "KO" ? "Korean" : "English";
  const targetCountryCode = getTargetLanguageCountryCode(targetLanguage);
  const translationPlaceholder = t("practice.session.placeholderWithTarget", { language: targetLanguageLabel });

  if (!idValid || practiceNotFound) {
    return <Navigate to="/404" replace />;
  }


  return (
    <div className="h-[calc(100vh-130px+4rem)] max-md:h-auto max-md:min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col overflow-hidden max-md:overflow-visible dark:text-slate-100">
      {/* Top Bar for Task Info */}
      <div className="flex items-center justify-between md:py-4 mb-2 shrink-0 px-1 sm:px-0 gap-4">
        <div className="flex-[10] flex flex-row items-center justify-between gap-4">
          {data?.paragraph.type !== "DIARIES" && data?.paragraph.type !== "SINGLE_SENTENCE" && (
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{data?.paragraph.type}</p>
              <p className="text-slate-600 dark:text-slate-400 text-xs max-w-xl">
                {data?.paragraph.title}
              </p>
            </div>
          )}
          <div className="flex flex-row items-center gap-1.5 sm:gap-4">
            {(data?.paragraph.type === "DIARIES" || data?.paragraph.type === "SINGLE_SENTENCE") && (
              <div className="hidden lg:flex flex-row items-center gap-1.5 sm:gap-4">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("practice.result.topic")}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{upperFirstCharactor(data?.paragraph.topic)}</span>
                </div>
              </div>
            )}

            {(data?.paragraph.type === "DIARIES" || data?.paragraph.type === "SINGLE_SENTENCE") && (
              <div className="hidden lg:block h-8 w-px shrink-0 bg-slate-100 dark:bg-slate-700"></div>
            )}
            {data && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("history.language")}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <FlagIcon countryCode={targetCountryCode} className="h-3 w-5 rounded-[2px]" />
                  <span>{targetLanguageLabel}</span>
                </span>
              </div>
            )}
            {data && <div className="h-8 w-px shrink-0 bg-slate-100 dark:bg-slate-700"></div>}
            {data && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("practice.session.time")}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <Clock size={14} className="text-slate-500 dark:text-slate-400" />
                  <span className="inline-block min-w-[5ch] tabular-nums">{formatElapsed(elapsedSeconds)}</span>
                </span>
              </div>
            )}
            {typeof creditBalance?.credits === "number" && (
              <>
                <div className="h-8 w-px bg-slate-100 dark:bg-slate-700"></div>
                <Link
                  to={subscriptionHref("topup")}
                  className="group flex flex-col items-start rounded-md px-1 -mx-1 py-0.5 outline-none transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/60 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-slate-500 dark:group-hover:text-slate-300">
                    {t("profile.creditsRemaining")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Coins size={14} className="text-amber-500" />
                    {creditBalance.credits}
                  </span>
                </Link>
              </>
            )}
            {typeof creditBalance?.coins === "number" && (
              <>
                <div className="h-8 w-px bg-slate-100 dark:bg-slate-700"></div>
                <Link
                  to={subscriptionHref("coin")}
                  className="group flex flex-col items-start rounded-md px-1 -mx-1 py-0.5 outline-none transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/60 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-slate-500 dark:group-hover:text-slate-300">
                    {t("profile.coinsRemaining")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Coins size={14} className="text-yellow-500" />
                    {creditBalance.coins}
                  </span>
                </Link>
              </>
            )}

          </div>
        </div>
        <div className="h-8 w-px bg-slate-100 dark:bg-slate-700"></div>
        <div className="flex-[2] hidden md:flex items-center gap-4 lg:gap-6 w-full">
          <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {t("practice.session.sentenceProgress", {
              current: currentVietNameseSentence?.orderIndex ?? 0,
              total: vietNameseSentences.length,
            })}
          </span>
          <div className="w-36 md:w-44 lg:w-48 h-2 md:h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-blue-600">{progressPercent}%</span>
        </div>
      </div>



      <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 overflow-y-auto md:overflow-hidden sm:pb-4 sm:px-0">
        {/* Left Column: Workspace (Source & Input) */}
        <section className="md:col-span-8 flex flex-col gap-3 sm:gap-4 max-md:min-h-0 max-md:overflow-visible md:overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
          {/* Source Context View */}
          {singleSentenceText != null ? (
            <div className="bg-slate-50/50 dark:bg-slate-950/30 rounded-lg bg-white dark:bg-slate-900/90 sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-3 md:px-6 text-slate-800 dark:text-slate-100 font-medium leading-6 sm:leading-7 space-y-3 sm:space-y-4 max-md:max-h-[40vh] max-md:overflow-y-auto">
              <span className="relative inline whitespace-pre-line text-sm py-2 text-blue-600 font-bold">
                {singleSentenceText.content}
              </span>
            </div>
          ) : (
            <div className="flex-[10] min-h-0 bg-slate-50/50 dark:bg-slate-950/30 rounded-lg bg-white dark:bg-slate-900/90 sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-3 md:px-6 text-slate-800 dark:text-slate-100 font-medium h-full overflow-y-auto leading-6 sm:leading-7 space-y-3 sm:space-y-4 max-md:max-h-[40vh]">
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

          {/* Target Language Translation Flow (Input) */}
          <div className="flex-[2] flex flex-col flex-1">
            <div className="relative">
              <textarea
                className="w-full p-4 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 outline-none text-base text-slate-900 dark:text-slate-100 transition-all resize-none min-h-[72px] sm:min-h-[80px]"
                placeholder={translationPlaceholder}
                rows={2}
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                onKeyDown={handleTranslationKeyDown}
              />
            </div>

            <div className="flex justify-between items-center mt-2 sm:mt-3 gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="hidden md:inline-flex shrink-0 group p-2 md:p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 rounded-lg sm:rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 touch-manipulation"
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
                  {t("practice.session.hints")}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={isLoadingAnswerPreview || !translation}
                  onClick={handleGetAnswerPreview}
                  className="inline-flex items-center gap-2 rounded-lg border-0 bg-blue-600 px-4 py-1.5 font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed sm:px-5 sm:py-2 sm:text-sm md:px-6 text-xs"
                >
                  {t("practice.session.check")}

                  {isLoadingAnswerPreview ? (
                    <Loader2 size={16} className="size-4 shrink-0 animate-spin" />
                  ) : (
                    <Check size={16} className="size-4 shrink-0" />
                  )}
                </button>
                {feedback && (
                  <button
                    disabled={
                      isLoadingSubmitUserSentence || isLoadingAnswerPreview ||
                      !feedback ||
                      !lastCheckedTranslation ||
                      lastCheckedTranslation !== translation
                    }
                    onClick={handleNextSentence}
                    className="inline-flex items-center gap-2 rounded-lg border-0 bg-blue-600 px-4 py-1.5 font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed sm:px-5 sm:py-2 sm:text-sm md:px-6 text-xs"
                  >
                    {t("practice.session.next")}

                    {isLoadingSubmitUserSentence ? (
                      <Loader2 size={16} className="size-4 shrink-0 animate-spin" />
                    ) : (
                      <ArrowRight size={16} className="size-4 shrink-0" />
                    )}
                  </button>
                )}

              </div>

            </div>
          </div>
        </section>

        {/* Right column: hints & feedback — stacked under main workspace on mobile; two columns from tablet (md) up */}
        <aside className="md:col-span-4 flex flex-col min-h-0 md:overflow-hidden transition-all duration-300 ease-in-out">
          <div className="bg-white dark:bg-slate-900/90 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-h-[200px] md:min-h-0 overflow-hidden relative">
            {coinBurstCount > 0 && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                <div className="relative flex flex-col items-center">
                  <span className="inline-flex items-center gap-2 px-6 py-3 text-4xl font-extrabold text-amber-600 dark:text-amber-300 animate-bounce">
                    {`+${coinBurstCount}`}
                    <Coins size={40} className="text-yellow-500" />
                  </span>
                  <span className="absolute -left-2 top-8 h-3 w-3 rounded-full bg-yellow-300 animate-ping" />
                  <span className="absolute -right-2 top-6 h-3 w-3 rounded-full bg-amber-400 animate-ping [animation-delay:120ms]" />
                  <span className="absolute left-1/2 -translate-x-1/2 -top-3 h-2.5 w-2.5 rounded-full bg-orange-300 animate-ping [animation-delay:200ms]" />
                </div>
              </div>
            )}
            <Aside
              renderAsideType={renderAsideType}
              isLoadingAnswerPreview={isLoadingAnswerPreview}
              isLoadingVocabularyHints={isLoadingVocabularyHints}
              vocabularyHints={
                streamingVocabularyHints
                ?? (
                  currentVietNameseSentence?.id != null
                    ? (vocabularyHintsBySentenceId[currentVietNameseSentence.id] ?? null)
                    : null
                )
              }
              hintsSentenceId={currentVietNameseSentence?.id ?? 0}
              targetLanguage={targetLanguage}
              feedback={feedback}
              userTranslation={lastCheckedTranslation ?? translation}
              streamingFeedback={streamingFeedback}
            />
          </div>
        </aside>
      </main>
    </div>
  );
};

export default SentencePracticePage;

