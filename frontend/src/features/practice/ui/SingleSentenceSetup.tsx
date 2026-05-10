import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  Sparkles,
} from "lucide-react";
import {
  LEVELS,
  SENTENCE_COUNT_NUMBER,
  SENTENCE_COUNTS,
  SINGLE_SENTENCE_MIX_VALUES,
  TONES,
  TOPIC_GROUPS,
  TOPIC_ICONS,
} from "../constants";
import { useCreateUserPracticeMutation } from "../mutation";
import type { PracticeSetupInput, SingleSentenceMixOption } from "../schema";
import { Button, Drawer, message, Modal, Select } from "antd";
import { useTranslation } from "react-i18next";
import { TARGET_LANGUAGE_ITEMS, type TargetLanguage } from "@/shared/constants/target-language";
import { CollapsibleChecklistSection } from "@/shared/components/CollapsibleChecklistSection";
import { AppSpinner } from "@/shared/components/AppSpinner";
import { FlagIcon } from "@/shared/utilities/flag";

const panelClassName =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90";

const SingleSentenceSetup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const singleSentenceMixOptions = useMemo(
    () => [
      { value: "STATEMENT", label: t("practice.singleSentenceMix.statement") },
      { value: "QUESTION", label: t("practice.singleSentenceMix.question") },
      { value: "REQUEST", label: t("practice.singleSentenceMix.request") },
      { value: "PAST", label: t("practice.singleSentenceMix.pastTime") },
      { value: "PRESENT", label: t("practice.singleSentenceMix.presentTime") },
      { value: "FUTURE", label: t("practice.singleSentenceMix.futureTime") },
    ] as const,
    [t],
  );
  const allTopics = useMemo(
    () => TOPIC_GROUPS.flatMap((group) => group.topics.map((topic) => topic.value)),
    [],
  );

  const { mutateAsync: createUserPractice, isPending } = useCreateUserPracticeMutation();
  const [mobileSetupOpen, setMobileSetupOpen] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);

  const [topic, setTopic] = useState<string | undefined>(undefined);
  const [tone, setTone] = useState<string>("FORMAL");
  const [level, setLevel] = useState<string>("B1");
  const [sentenceCount, setSentenceCount] = useState<string>("TEN");
  const [singleSentenceMix, setSingleSentenceMix] = useState<SingleSentenceMixOption[]>(
    SINGLE_SENTENCE_MIX_VALUES.map((item) => item),
  );

  const handleStart = async (language: TargetLanguage) => {
    if (singleSentenceMix.length === 0) {
      message.warning(t("practice.setup.mixOptionRequired"));
      return;
    }
    if (!topic) {
      message.warning(t("practice.setup.topicSectionTitle"));
      return;
    }

    const payload: PracticeSetupInput = {
      type: "SINGLE_SENTENCE",
      tone,
      topic,
      level,
      sentenceCount,
      singleSentenceMix,
      targetLanguage: language,
    };

    setIsLanguageDialogOpen(false);

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

  const setupPanel = (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t("practice.setup.modeSentenceCardTitle")}
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {t("practice.setup.modeSentenceCardDesc")}
        </p>
      </div>

      <CollapsibleChecklistSection
        title={t("paragraphLibrary.filters.level")}
        items={LEVELS.map((item) => ({
          key: item.value,
          label: t(`practice.level.${item.value}`),
          selected: level === item.value,
          onClick: () => setLevel(item.value),
        }))}
      />

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      <section className="space-y-2.5">
        <h3 className="text-slate-800 dark:text-slate-100 font-semibold uppercase tracking-wide text-xs">
          {t("paragraphLibrary.filters.sentenceLength")}
        </h3>
        <Select
          className="w-full"
          value={sentenceCount}
          onChange={(value) => setSentenceCount(value)}
          options={SENTENCE_COUNTS.map((item) => ({
            value: item.value,
            label: `${SENTENCE_COUNT_NUMBER[item.value] ?? item.value}`,
          }))}
        />
      </section>

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      <section className="space-y-2.5">
        <h3 className="text-slate-800 dark:text-slate-100 font-semibold uppercase tracking-wide text-xs">
          {t("paragraphLibrary.filters.tone")}
        </h3>
        <Select
          className="w-full"
          value={tone}
          onChange={(value) => setTone(value)}
          options={TONES.map((item) => ({
            value: item.value,
            label: t(`practice.tone.${item.value}`),
          }))}
        />
      </section>

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      <CollapsibleChecklistSection
        title="Sentence mix"
        items={singleSentenceMixOptions.map((option) => ({
          key: option.value,
          label: option.label,
          selected: singleSentenceMix.includes(option.value),
          onClick: () => toggleMixOption(option.value, !singleSentenceMix.includes(option.value)),
        }))}
      />

    </div>
  );

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:px-6 md:py-8 xl:grid-cols-[320px_1fr]">
      <aside className={`${panelClassName} hidden xl:block h-fit`}>
        {setupPanel}
      </aside>

      <section className={`${panelClassName} h-fit self-start space-y-4`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold">{t("practice.setup.topicSectionTitle")}</h2>
          </div>
          <Button
            className="xl:hidden"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setMobileSetupOpen(true)}
          >
            {t("paragraphLibrary.filters.title")}
          </Button>
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
                onClick={() => {
                  setTopic(value);
                  setIsLanguageDialogOpen(true);
                }}
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
      <Drawer
        title={t("paragraphLibrary.filters.title")}
        placement="right"
        width={320}
        onClose={() => setMobileSetupOpen(false)}
        open={mobileSetupOpen}
        className="xl:hidden"
      >
        {setupPanel}
      </Drawer>
      <Modal
        title={
          <div className="text-center">
            <h3 className="text-[30px] font-semibold leading-tight text-slate-900 dark:text-slate-100">
              {t("practice.setup.languageModalTitle")}
            </h3>
          </div>
        }
        open={isLanguageDialogOpen}
        onCancel={() => {
          setIsLanguageDialogOpen(false);
          setTopic(undefined);
        }}
        centered
        width={520}
        style={{
          borderRadius: 16,
          boxShadow: "0 16px 36px rgba(15, 23, 42, 0.18)",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
        footer={null}
        wrapClassName="practice-language-modal"
        styles={{
          header: {
            background: "transparent",
            paddingBottom: 8,
          },
          body: {
            paddingTop: 4,
          },
          footer: {
            borderTop: "none",
            paddingTop: 8,
          },
        }}
      >
        <p className="mb-5 text-center text-base text-slate-500 dark:text-slate-400">
          {t("practice.setup.languageModalDescription")}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TARGET_LANGUAGE_ITEMS.map((item) => {
            return (
              <button
                key={item.value}
                type="button"
                disabled={isPending}
                onClick={() => handleStart(item.value as TargetLanguage)}
                className="relative flex min-h-[98px] flex-col items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-center text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200"
              >
                <FlagIcon countryCode={item.countryCode} className="h-5 w-7 rounded-[2px]" />
                <div className="flex flex-col">
                  <span className="text-base font-semibold leading-none">{item.name}</span>
                  <span className="mt-1 text-xs tracking-wide text-slate-500 dark:text-slate-400">{item.value}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {isPending && (
        <AppSpinner fullscreen text={t("practice.setup.creating")} />
      )}
    </div>
  );
};

export default SingleSentenceSetup;
