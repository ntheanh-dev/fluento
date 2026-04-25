import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Brain,
  Briefcase,
  Building2,
  Cpu,
  Dumbbell,
  Globe,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  ListOrdered,
  Loader2,
  MapPin,
  Microscope,
  Plane,
  Rocket,
  ScrollText,
  Smile,
  Sparkles,
  Tv,
  UtensilsCrossed,
  UsersRound,
} from "lucide-react";
import { LEVELS, TOPIC_GROUPS, SENTENCE_COUNTS, TONES } from "../constants";
import { useCreateUserPracticeMutation } from "../mutation";
import type { PracticeSetupInput } from "../schema";
import { message, Slider, Spin } from "antd";
import { useTranslation } from "react-i18next";

const SENTENCE_COUNT_BY_INDEX = SENTENCE_COUNTS.map((item) => item.value);
const INDEX_BY_SENTENCE_COUNT = Object.fromEntries(
  SENTENCE_COUNT_BY_INDEX.map((value, index) => [value, index]),
) as Record<string, number>;

const SENTENCE_COUNT_NUMBER: Record<string, number> = {
  TEN: 10,
  FIFTEEN: 15,
  TWENTY: 20,
  MAX: 30,
};

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

const panelClassName =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90";

const chipBaseClassName =
  "rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

const SINGLE_SENTENCE_MIX_OPTIONS = [
  { value: "STATEMENT", label: "Statement" },
  { value: "QUESTION", label: "Question" },
  { value: "REQUEST", label: "Request" },
  { value: "PAST", label: "Past tense" },
  { value: "PRESENT", label: "Present tense" },
  { value: "FUTURE", label: "Future tense" },
] as const;

type SingleSentenceMixOption = (typeof SINGLE_SENTENCE_MIX_OPTIONS)[number]["value"];

const SingleSentenceSetup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const allTopics = useMemo(
    () => TOPIC_GROUPS.flatMap((group) => group.topics.map((topic) => topic.value)),
    [],
  );

  const { mutateAsync: createUserPractice, isPending } = useCreateUserPracticeMutation();

  const [topic, setTopic] = useState<string>("LIFE");
  const [tone, setTone] = useState<string>("FORMAL");
  const [level, setLevel] = useState<string>("B1");
  const [sentenceCount, setSentenceCount] = useState<string>("TEN");
  const [singleSentenceMix, setSingleSentenceMix] = useState<SingleSentenceMixOption[]>(
    SINGLE_SENTENCE_MIX_OPTIONS.map((item) => item.value),
  );
  const sentenceCountIndex = INDEX_BY_SENTENCE_COUNT[sentenceCount] ?? 0;

  const sliderMarks = useMemo(
    () =>
      SENTENCE_COUNT_BY_INDEX.reduce<Record<number, string>>((acc, key, index) => {
        acc[index] = String(SENTENCE_COUNT_NUMBER[key]);
        return acc;
      }, {}),
    [],
  );

  const handleStart = async () => {
    if (singleSentenceMix.length === 0) {
      message.warning("Please choose at least one mix option.");
      return;
    }

    const payload: PracticeSetupInput = {
      type: "SINGLE_SENTENCE",
      tone,
      topic,
      level,
      sentenceCount,
      singleSentenceMix,
    };

    try {
      const { id } = await createUserPractice(payload);
      navigate(`/practice/${id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      message.error(err?.response?.data?.message ?? err?.message ?? t("practice.setup.createFailed"));
    }
  };

  const toggleMixOption = (value: SingleSentenceMixOption, checked: boolean) => {
    setSingleSentenceMix((prev) => {
      if (checked) {
        if (prev.includes(value)) return prev;
        return [...prev, value];
      }
      return prev.filter((item) => item !== value);
    });
  };

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:px-6 md:py-8 xl:grid-cols-[320px_1fr]">
      <aside className={`${panelClassName} h-fit space-y-5`}>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t("practice.setup.modeSentenceCardTitle")}
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {t("practice.setup.modeSentenceCardDesc")}
          </p>
        </div>

        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <h2 className="text-xs font-bold uppercase tracking-wide">{t("practice.setup.toneHeading")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {TONES.map((item) => {
              const active = tone === item.value;
              const Icon = TONE_ICONS[item.value] ?? Sparkles;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTone(item.value)}
                  className={`${chipBaseClassName} flex items-center gap-2 ${active
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-200"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t(`practice.tone.${item.value}`)}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wide">{t("practice.setup.level")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((item) => {
              const active = level === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLevel(item.value)}
                  className={`${chipBaseClassName} ${active
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-200"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                >
                  {t(`practice.level.${item.value}`)}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <ListOrdered className="h-4 w-4 text-sky-500" />
              <h2 className="text-xs font-bold uppercase tracking-wide">{t("practice.setup.sentenceCount")}</h2>
            </div>
            <span className="rounded-lg bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-200">
              {SENTENCE_COUNT_NUMBER[sentenceCount]}
            </span>
          </div>
          <Slider
            min={0}
            max={SENTENCE_COUNT_BY_INDEX.length - 1}
            step={1}
            marks={sliderMarks}
            value={sentenceCountIndex}
            onChange={(value) => {
              const index = typeof value === "number" ? value : value[0];
              setSentenceCount(SENTENCE_COUNT_BY_INDEX[index]);
            }}
            tooltip={{ formatter: (value) => (value != null ? sliderMarks[value] : "") }}
          />
        </section>

        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wide">Sentence mix</h2>
          </div>
          <div className="space-y-2">
            {SINGLE_SENTENCE_MIX_OPTIONS.map((option) => {
              const checked = singleSentenceMix.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => toggleMixOption(option.value, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Rocket className="h-4 w-4" />
          {t("practice.setup.start")}
        </button>
      </aside>

      <section className={`${panelClassName} space-y-4`}>
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-bold">{t("practice.setup.topicSectionTitle")}</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("practice.setup.topicSectionSubtitle")}</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {allTopics.map((value) => {
            const Icon = TOPIC_ICONS[value] ?? Sparkles;
            const active = topic === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTopic(value)}
                className={`flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors ${active
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-semibold leading-snug">{t(`common.topic.${value}`)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {isPending && (
        <Spin
          indicator={<Loader2 className="h-4 w-4 animate-spin" size={28} />}
          description={t("practice.setup.creating")}
          fullscreen
        />
      )}
    </div>
  );
};

export default SingleSentenceSetup;
