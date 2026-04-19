import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  Cpu,
  Dumbbell,
  FileText,
  Globe,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  ListOrdered,
  Loader2,
  Mail,
  MapPin,
  Microscope,
  NotebookPen,
  PenLine,
  Plane,
  Rocket,
  ScrollText,
  Smile,
  Sparkles,
  Tv,
  UtensilsCrossed,
  UsersRound,
} from "lucide-react";
import {
  LEVELS,
  TOPIC_GROUPS,
  PRACTICE_TYPES,
  SENTENCE_COUNTS,
  TONES,
} from "../constants";
import { useCreateUserPracticeMutation } from "../mutation";
import type { PracticeSetupInput } from "../schema";
import { message, Slider, Spin } from "antd";
import { useTranslation } from "react-i18next";

const SENTENCE_COUNT_BY_INDEX = SENTENCE_COUNTS.map((c) => c.value);
const INDEX_BY_SENTENCE_COUNT = Object.fromEntries(
  SENTENCE_COUNT_BY_INDEX.map((v, i) => [v, i]),
) as Record<string, number>;

/** Slider / badge: numeric only (matches TEN→10 … MAX→30). */
const SENTENCE_COUNT_NUMBER: Record<string, number> = {
  TEN: 10,
  FIFTEEN: 15,
  TWENTY: 20,
  MAX: 30,
};

const SLIDER_MARKS_NUMERIC = SENTENCE_COUNT_BY_INDEX.reduce<
  Record<number, string>
>((acc, key, i) => {
  acc[i] = String(SENTENCE_COUNT_NUMBER[key]);
  return acc;
}, {});

const TYPE_ICONS: Record<string, typeof FileText> = {
  DIARIES: BookMarked,
  IELTS_TASK1: BarChart3,
  IELTS_TASK2: PenLine,
  EMAIL: Mail,
  STORY: BookOpen,
  ESSAYS: NotebookPen,
};

const ALL_TOPIC_VALUES = TOPIC_GROUPS.flatMap((g) =>
  g.topics.map((topic) => topic.value),
);

const TOPIC_ICONS: Record<string, LucideIcon> = {
  LIFE: Home,
  TECHNOLOGY: Cpu,
  CULTURE: UsersRound,
  FOOD: UtensilsCrossed,
  HEALTH: HeartPulse,
  EDUCATION: GraduationCap,
  FITNESS: Dumbbell,
  MENTAL_HEALTH: Brain,
  TRAVEL: Plane,
  TOURISM: MapPin,
  COUNTRIES: Globe,
  LANDMARKS: Landmark,
  BUSINESS: Briefcase,
  SCIENCE: Microscope,
  ENTERTAINMENT: Tv,
  SOCIETY: Building2,
};

const TONE_ICONS: Record<string, LucideIcon> = {
  FORMAL: ScrollText,
  FRIENDLY: Smile,
  PROFESSIONAL: Briefcase,
};

/** Softer than heavy bordered boxes; works better on narrow viewports */
const surfacePage =
  "bg-gradient-to-b from-slate-100/90 via-slate-50/40 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-950";
const surfaceMain =
  "max-md:bg-transparent max-md:border-0 max-md:shadow-none max-md:p-3 sm:max-md:p-4 bg-white/90 dark:bg-slate-900/80 md:rounded-2xl md:border md:border-slate-200/80 md:dark:border-slate-700/80 md:shadow-md md:shadow-slate-200/40 md:dark:shadow-none md:p-6 lg:p-8 backdrop-blur-sm";
const sectionBlock =
  "max-md:space-y-4 md:rounded-xl md:bg-slate-50/70 md:dark:bg-slate-800/25 md:ring-1 md:ring-slate-200/60 md:dark:ring-slate-700/50 md:p-5 md:shadow-sm";
const sectionDivider =
  "max-md:pt-6 max-md:border-t max-md:border-slate-200/80 max-md:dark:border-slate-800 first:max-md:pt-0 first:max-md:border-t-0";
const pickTileBase =
  "rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950";
const pickTileRest =
  "bg-slate-100/80 dark:bg-slate-800/45 shadow-sm ring-1 ring-inset ring-slate-200/70 dark:ring-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:ring-slate-300/80 dark:hover:ring-slate-600";
const pickTileOn =
  "bg-gradient-to-br from-blue-50 via-white to-indigo-50/90 dark:from-blue-950/35 dark:via-slate-900 dark:to-indigo-950/25 ring-2 ring-blue-500/85 dark:ring-blue-400/70 shadow-md shadow-blue-500/10";

const PracticeSetup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<"sentence" | "paragraph">("paragraph");

  const { mutateAsync: createUserPractice, isPending } =
    useCreateUserPracticeMutation();

  const [topic, setTopic] = useState<string>("LIFE");
  const [tone, setTone] = useState<string>("FORMAL");
  const [level, setLevel] = useState<string>("B1");
  const [type, setType] = useState<string>("DIARIES");
  const [sentenceCount, setSentenceCount] = useState<string>("TEN");

  const handleStart = async () => {
    const payload: PracticeSetupInput = {
      type,
      tone,
      topic,
      level,
      sentenceCount,
    };

    try {
      const { id } = await createUserPractice(payload);
      navigate(`/practice/${id}`);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; code?: number } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        t("practice.setup.createFailed");
      message.error(errorMessage);
    }
  };

  const handleReset = () => {
    setStep(1);
    setMode("paragraph");
    setTopic("LIFE");
    setTone("FORMAL");
    setLevel("A2");
    setType("DIARIES");
    setSentenceCount("TEN");
  };

  const handleModeChange = (next: "sentence" | "paragraph") => {
    setMode(next);
    if (next === "sentence") {
      setSentenceCount("TEN");
      setType("SINGLE_SENTENCE");
    } else {
      setType("DIARIES");
    }
  };

  const handleTopicSelect = (value: string) => {
    setTopic(value);
  };

  const sentenceCountIndex = INDEX_BY_SENTENCE_COUNT[sentenceCount] ?? 0;

  const steps = [
    { n: 1 as const, key: "step1" as const },
    { n: 2 as const, key: "step2" as const },
    { n: 3 as const, key: "step3" as const },
  ];

  return (
    <div
      className={`max-w-5xl mx-auto md:p-4 text-slate-800 dark:text-slate-100 font-display min-h-[min(100%,32rem)] ${surfacePage}`}
    >
      <div className={surfaceMain}>
        {/* Flow header */}
        <div className="mb-8">


          {/* Stepper */}
          <div className="mt-6">

            <div className="flex items-start w-full">
              {steps.map((s, i) => {
                const active = step === s.n;
                const done = step > s.n;
                return (
                  <div key={s.n} className="contents">
                    {i > 0 && (
                      <div
                        className={`h-0.5 sm:h-px flex-1 min-w-[12px] mt-[18px] sm:mt-5 self-start ${step > steps[i - 1].n
                          ? "bg-blue-600 dark:bg-blue-500"
                          : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        aria-hidden
                      />
                    )}
                    <div className="flex flex-col items-center w-[4.5rem] sm:w-28 shrink-0 cursor-pointer" onClick={() => setStep(s.n)}>
                      <div
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${done || active
                          ? "bg-blue-600 text-white dark:bg-blue-500"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                          }`}
                      >
                        {s.n}
                      </div>
                      <span
                        className={`mt-2 text-center text-[10px] sm:text-xs font-medium leading-tight ${active
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500 dark:text-slate-400"
                          }`}
                      >
                        {t(`practice.setup.stepLabel.${s.key}`)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* —— Step 1 —— */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t("practice.setup.step1Heading")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handleModeChange("paragraph")}
                className={`text-left p-5 sm:p-6 ${pickTileBase} ${mode === "paragraph" ? pickTileOn : pickTileRest}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${mode === "paragraph"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200"
                      : "bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                  >
                    <FileText className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                      {t("practice.setup.modeParagraphCardTitle")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {t("practice.setup.modeParagraphCardDesc")}
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("sentence")}
                className={`text-left p-5 sm:p-6 ${pickTileBase} ${mode === "sentence" ? pickTileOn : pickTileRest}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${mode === "sentence"
                      ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200"
                      : "bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                  >
                    <AlignLeft className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                      {t("practice.setup.modeSentenceCardTitle")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {t("practice.setup.modeSentenceCardDesc")}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {mode === "paragraph" ? (
              <section className={`${sectionBlock} ${sectionDivider}`}>
                <div className="flex items-center gap-2 mb-1 md:mb-3">
                  <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    {t("practice.setup.formatSectionTitle")}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {PRACTICE_TYPES.map((item) => {
                    const Icon = TYPE_ICONS[item.value] ?? FileText;
                    const selected = type === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setType(item.value)}
                        className={`relative text-left p-4 sm:p-4 ${pickTileBase} ${selected ? pickTileOn : pickTileRest}`}
                      >
                        <span
                          className={`absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full ${selected
                            ? "bg-blue-600 dark:bg-blue-500"
                            : "bg-slate-200/90 dark:bg-slate-600/80 ring-1 ring-inset ring-slate-300/60 dark:ring-slate-500/50"
                            }`}
                          aria-hidden
                        >
                          {selected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <Icon
                          className={`h-7 w-7 sm:h-8 sm:w-8 mb-2.5 ${selected
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-500 dark:text-slate-400"
                            }`}
                        />
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100 pr-7 leading-snug">
                          {t(`practice.type.${item.value}`)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300 rounded-2xl px-4 py-3.5 bg-slate-100/60 dark:bg-slate-800/40 ring-1 ring-inset ring-slate-200/60 dark:ring-slate-700/60">
                {t("practice.setup.sentenceModeFormatNote")}
              </p>
            )}

          </div>
        )}

        {/* —— Step 2 —— */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t("practice.setup.step2Heading")}
            </h2>

            <section
              className={`${sectionBlock} ${sectionDivider}`}
              role="listbox"
              aria-label={t("practice.setup.topicSectionTitle")}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {t("practice.setup.topicSectionTitle")}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 md:mb-4">
                {t("practice.setup.topicSectionSubtitle")}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {ALL_TOPIC_VALUES.map((value) => {
                  const Icon = TOPIC_ICONS[value] ?? Sparkles;
                  const selected = topic === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleTopicSelect(value)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 sm:py-4 sm:px-3 text-center ${pickTileBase} ${selected ? pickTileOn : pickTileRest}`}
                    >
                      <Icon
                        className={`h-6 w-6 sm:h-7 sm:w-7 shrink-0 ${selected
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500 dark:text-slate-400"
                          }`}
                        aria-hidden
                      />
                      <span
                        className={`text-[11px] sm:text-xs font-semibold leading-snug line-clamp-2 ${selected
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-600 dark:text-slate-300"
                          }`}
                      >
                        {t(`common.topic.${value}`)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 opacity-90">
                {t("practice.setup.topicCountHint", {
                  shown: ALL_TOPIC_VALUES.length,
                  total: ALL_TOPIC_VALUES.length,
                })}
              </p>
            </section>


          </div>
        )}

        {/* —— Step 3 —— */}
        {step === 3 && (
          <div className="animate-in fade-in duration-200">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 md:mb-6">
              {t("practice.setup.step3Heading")}
            </h2>

            <div
              className={`${sectionBlock} max-md:bg-transparent max-md:ring-0 max-md:shadow-none max-md:p-0 space-y-8 max-md:space-y-0`}
            >
              <div className="space-y-4 max-md:pb-8 max-md:border-b max-md:border-slate-200/80 max-md:dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    {t("practice.setup.toneHeading")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {TONES.map((item) => {
                    const Icon = TONE_ICONS[item.value] ?? Sparkles;
                    const selected = tone === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setTone(item.value)}
                        className={`flex flex-col items-center justify-center gap-2 py-4 px-3 ${pickTileBase} ${selected ? pickTileOn : pickTileRest}`}
                      >
                        <Icon
                          className={`h-7 w-7 ${selected
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-500 dark:text-slate-400"
                            }`}
                          aria-hidden
                        />
                        <span
                          className={`text-sm font-bold ${selected
                            ? "text-slate-900 dark:text-slate-100"
                            : "text-slate-600 dark:text-slate-300"
                            }`}
                        >
                          {t(`practice.tone.${item.value}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 max-md:py-8 max-md:border-b max-md:border-slate-200/80 max-md:dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    {t("practice.setup.level")}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {LEVELS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setLevel(item.value)}
                      className={`py-3 px-2 text-sm font-bold ${pickTileBase} ${level === item.value ? pickTileOn : pickTileRest}`}
                    >
                      {t(`practice.level.${item.value}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 max-md:pt-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                      {t("practice.setup.sentenceCount")}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-lg bg-sky-100/90 text-sky-900 dark:bg-sky-950/70 dark:text-sky-200 ring-1 ring-inset ring-sky-200/60 dark:ring-sky-800/50">
                    {SENTENCE_COUNT_NUMBER[sentenceCount] ?? sentenceCount}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={SENTENCE_COUNT_BY_INDEX.length - 1}
                  step={1}
                  marks={SLIDER_MARKS_NUMERIC}
                  value={sentenceCountIndex}
                  onChange={(v) => {
                    const idx = typeof v === "number" ? v : v[0];
                    setSentenceCount(SENTENCE_COUNT_BY_INDEX[idx]);
                  }}
                  tooltip={{ formatter: (v) => (v != null ? SLIDER_MARKS_NUMERIC[v] : "") }}
                  className="mt-2 mb-1 px-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer nav — step 3 uses sidebar for primary actions */}
        {step < 3 && (
          <div className="flex flex-row justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700 mt-8">
            <div className="flex flex-wrap items-center gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  {t("practice.setup.back")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2"
                >
                  {t("practice.setup.reset")}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() =>
                  setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s))
                }
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {t("practice.setup.continue")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-8 flex flex-row justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2"
            >
              {t("practice.setup.reset")}
            </button>

            <button
              type="button"
              onClick={handleStart}
              disabled={isPending}
              className="mt-6 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              <Rocket className="h-4 w-4" aria-hidden />
              {t("practice.setup.start")}
            </button>
          </div>
        )}
      </div>

      {isPending && (
        <Spin
          indicator={<Loader2 className="animate-spin w-4 h-4" size={32} />}
          description={t("practice.setup.creating")}
          fullscreen
        />
      )}
    </div>
  );
};

export default PracticeSetup;
