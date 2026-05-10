import { useEffect, useMemo, useState } from "react";
import { Button, Drawer, Grid, message, Modal, Pagination, Select } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Filter,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { useParagraphs } from "../query";
import { LEVELS, PRACTICE_TYPES, SENTENCE_COUNTS, TONES, TOPIC_GROUPS } from "@/features/practice/constants";
import { useCreateUserPracticeMutation } from "@/features/paragraph/mutation";
import { getCoverImage } from "@/shared/constants/practice-covers";
import { TARGET_LANGUAGE_ITEMS, type TargetLanguage } from "@/shared/constants/target-language";
import { CollapsibleChecklistSection } from "@/shared/components/CollapsibleChecklistSection";
import Cookies from "js-cookie";
import LoginWithGoogleModal from "@/features/auth/ui/LoginWithGoogleModal";
import { FlagIcon } from "@/shared/utilities/flag";
import { AppSpinner } from "@/shared/components/AppSpinner";

const DESKTOP_PAGE_SIZE = 9;
const MOBILE_PAGE_SIZE = 6;
const SENTENCE_COUNT_LABEL: Record<string, string> = {
  TEN: "10",
  FIFTEEN: "15",
  TWENTY: "20",
  MAX: "30",
};
const DEFAULT_PARAGRAPH_TYPE = PRACTICE_TYPES[0]?.value;

const TARGET_LANGUAGE_OPTIONS: Array<{ value: TargetLanguage; label: string; countryCode: "US" | "CN" | "KR" }> =
  TARGET_LANGUAGE_ITEMS.map((item) => ({
    value: item.value,
    label: `${item.name} (${item.value})`,
    countryCode: item.countryCode,
  }));


const ParagraphLibraryPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const [type, setType] = useState<string | undefined>(() => {
    const requestedType = searchParams.get("type");
    if (requestedType && PRACTICE_TYPES.some((item) => item.value === requestedType)) {
      return requestedType;
    }
    return DEFAULT_PARAGRAPH_TYPE;
  });
  const [tone, setTone] = useState<string | undefined>(() => searchParams.get("tone") ?? undefined);
  const [topic, setTopic] = useState<string | undefined>(() => searchParams.get("topic") ?? undefined);
  const [level, setLevel] = useState<string | undefined>(() => searchParams.get("level") ?? undefined);
  const [sentenceCount, setSentenceCount] = useState<string | undefined>(
    () => searchParams.get("sentenceCount") ?? undefined,
  );
  const [sort, setSort] = useState<"asc" | "desc" | "most_practiced">(() => {
    const q = searchParams.get("sort");
    return q === "asc" || q === "desc" || q === "most_practiced" ? q : "desc";
  });
  const [page, setPage] = useState<number>(() => {
    const parsed = Number(searchParams.get("page") ?? "0");
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [pendingParagraphId, setPendingParagraphId] = useState<number | null>(null);
  const screens = Grid.useBreakpoint();
  const pageSize = screens.md ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE;

  const topicOptions = useMemo(
    () =>
      TOPIC_GROUPS.flatMap((group) =>
        group.topics.map((item) => ({
          value: item.value,
          label: t(`common.topic.${item.value}`),
        })),
      ),
    [t],
  );

  const { data, isLoading, isFetching } = useParagraphs({
    type,
    tone,
    topic,
    level,
    sentenceCount,
    sort,
    page,
    size: pageSize,
  });

  const resetPageAndSet = <T,>(setter: (value: T) => void, value: T) => {
    setPage(0);
    setter(value);
  };

  useEffect(() => {
    const requestedType = searchParams.get("type");
    const urlType =
      requestedType && PRACTICE_TYPES.some((item) => item.value === requestedType)
        ? requestedType
        : DEFAULT_PARAGRAPH_TYPE;
    const urlTone = searchParams.get("tone") ?? undefined;
    const urlTopic = searchParams.get("topic") ?? undefined;
    const urlLevel = searchParams.get("level") ?? undefined;
    const urlSentenceCount = searchParams.get("sentenceCount") ?? undefined;
    const urlSort = searchParams.get("sort");
    const safeSort: "asc" | "desc" | "most_practiced" =
      urlSort === "asc" || urlSort === "desc" || urlSort === "most_practiced" ? urlSort : "desc";
    const urlPage = Number(searchParams.get("page") ?? "0");
    const safePage = Number.isFinite(urlPage) && urlPage >= 0 ? urlPage : 0;

    setType(urlType);
    setTone(urlTone);
    setTopic(urlTopic);
    setLevel(urlLevel);
    setSentenceCount(urlSentenceCount);
    setSort(safeSort);
    setPage(safePage);
  }, [searchParams]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (type) next.set("type", type);
    if (tone) next.set("tone", tone);
    if (topic) next.set("topic", topic);
    if (level) next.set("level", level);
    if (sentenceCount) next.set("sentenceCount", sentenceCount);
    if (sort !== "desc") next.set("sort", sort);
    if (page > 0) next.set("page", String(page));
    next.set("size", String(pageSize));

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [type, tone, topic, level, sentenceCount, sort, page, pageSize, searchParams, setSearchParams]);

  const { mutateAsync: createUserPractice, isPending } = useCreateUserPracticeMutation();
  const isInitialLoading = isLoading && !data;

  const handlePractice = (paragraphId: number) => {
    const isAuthenticated = Cookies.get("accessToken") !== undefined;
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    setPendingParagraphId(paragraphId);
    setIsLanguageDialogOpen(true);
  };

  const handleStartPracticeWithLanguage = async (language: TargetLanguage) => {
    if (pendingParagraphId === null) return;

    try {
      const data = await createUserPractice({
        paragraphId: pendingParagraphId,
        targetLanguage: language,
      });
      setIsLanguageDialogOpen(false);
      setPendingParagraphId(null);
      navigate(`/practice/${data.id}`);
    } catch (error) {
      message.error(error as string);
    }
  };

  const filterPanel = (
    <div className="space-y-5">
      <CollapsibleChecklistSection
        title={`${t("paragraphLibrary.filters.type")} (${PRACTICE_TYPES.length})`}
        items={PRACTICE_TYPES.map((item) => ({
          key: item.value,
          label: t(`practice.type.${item.value}`),
          selected: type === item.value,
          onClick: () => {
            if (type === item.value) return;
            resetPageAndSet(setType, item.value);
          },
        }))}
      />

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      <CollapsibleChecklistSection
        title={t("paragraphLibrary.filters.level")}
        items={LEVELS.map((item) => ({
          key: item.value,
          label: t(`practice.level.${item.value}`),
          selected: level === item.value,
          onClick: () => resetPageAndSet(setLevel, level === item.value ? undefined : item.value),
        }))}
      />

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      <section className="space-y-2.5">
        <h3 className="text-slate-800 dark:text-slate-100 font-semibold uppercase tracking-wide text-xs">
          {t("paragraphLibrary.filters.topic")} ({topicOptions.length})
        </h3>
        <Select
          allowClear
          className="w-full"
          placeholder={t("paragraphLibrary.filters.allTopics")}
          value={topic}
          onChange={(v) => resetPageAndSet(setTopic, v)}
          options={topicOptions}
        />
      </section>

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      <section className="space-y-2.5">
        <h3 className="text-slate-800 dark:text-slate-100 font-semibold uppercase tracking-wide text-xs">
          {t("paragraphLibrary.filters.sentenceLength")}
        </h3>
        <Select
          allowClear
          className="w-full"
          placeholder={t("paragraphLibrary.filters.allSentenceLengths")}
          value={sentenceCount}
          onChange={(v) => resetPageAndSet(setSentenceCount, v)}
          options={SENTENCE_COUNTS.map((item) => ({
            value: item.value,
            label: SENTENCE_COUNT_LABEL[item.value] ?? item.value,
          }))}
        />
      </section>

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      <section className="space-y-2.5">
        <h3 className="text-slate-800 dark:text-slate-100 font-semibold uppercase tracking-wide text-xs">
          {t("paragraphLibrary.filters.tone")}
        </h3>
        <Select
          allowClear
          className="w-full"
          placeholder={t("paragraphLibrary.filters.allTones")}
          value={tone}
          onChange={(v) => resetPageAndSet(setTone, v)}
          options={TONES.map((item) => ({
            value: item.value,
            label: t(`practice.tone.${item.value}`),
          }))}
        />
      </section>

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      <CollapsibleChecklistSection
        title={t("paragraphLibrary.filters.sortBy")}
        items={[
          { label: t("paragraphLibrary.sort.newest"), value: "desc" as const },
          { label: t("paragraphLibrary.sort.oldest"), value: "asc" as const },
          { label: t("paragraphLibrary.sort.mostPracticed"), value: "most_practiced" as const },
        ].map((opt) => ({
          key: opt.value,
          label: opt.label,
          selected: sort === opt.value,
          onClick: () => resetPageAndSet(setSort, opt.value),
        }))}
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
        <aside className="hidden xl:block bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 h-fit shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h2 className="font-bold text-xl leading-none">{t("paragraphLibrary.filters.title")}</h2>
          </div>
          {filterPanel}
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t("paragraphLibrary.title")}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("paragraphLibrary.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t("paragraphLibrary.sort.current")}: <b>{sort === "desc" ? t("paragraphLibrary.sort.newest") : sort === "asc" ? t("paragraphLibrary.sort.oldest") : t("paragraphLibrary.sort.mostPracticed")}</b>
              </span>
              <Button
                className="xl:hidden"
                icon={<Filter className="w-4 h-4" />}
                onClick={() => setMobileFilterOpen(true)}
              >
                {t("paragraphLibrary.filters.title")}
              </Button>
            </div>
          </div>

          {isInitialLoading ? (
            <AppSpinner className="min-h-[45vh] py-0" />
          ) : data?.content?.length ? (
            <>
              {isFetching && (
                <div className="flex justify-center py-2">
                  <AppSpinner size="small" className="py-0" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.content.map((item) => {
                  const preview =
                    item.sentences?.slice(0, 2).join(" ").replace("\\n", " ") ||
                    t("paragraphLibrary.card.emptyPreview");
                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm"
                      onClick={() => handlePractice(item.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="relative">
                        <img
                          src={getCoverImage(item.topic, item.type, String(item.id))}
                          alt={item.title || item.topic}
                          className="h-36 w-full object-cover"
                        />
                        <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-slate-900/75 px-2 py-1 text-xs font-semibold text-white">
                          <ListChecks className="w-3.5 h-3.5" />
                          {t("paragraphLibrary.card.sentenceCount", { count: item.sentences?.length ?? 0 })}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between text-xs mb-3">
                          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 font-semibold">
                            {item.topic}
                          </span>
                          <span className="text-amber-500 inline-flex items-center gap-1 font-semibold">
                            <Sparkles className="w-3.5 h-3.5" />
                            {item.practiceCount}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2 min-h-[56px]">
                          {item.title || item.sentences?.[0] || t("paragraphLibrary.card.untitled")}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 min-h-[60px]">
                          {preview}
                        </p>
                      </div>

                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500">
              {t("paragraphLibrary.empty")}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Pagination
              current={(data?.number ?? page) + 1}
              pageSize={data?.size ?? pageSize}
              total={data?.totalElements ?? 0}
              showSizeChanger={false}
              onChange={(next) => setPage(next - 1)}
            />
          </div>
        </section>
      </div>
      <Drawer
        title={t("paragraphLibrary.filters.title")}
        placement="right"
        width={320}
        onClose={() => setMobileFilterOpen(false)}
        open={mobileFilterOpen}
        className="xl:hidden"
      >
        {filterPanel}
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
          setPendingParagraphId(null);
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
          {TARGET_LANGUAGE_OPTIONS.map((item) => {
            return (
              <button
                key={item.value}
                type="button"
                disabled={isPending}
                onClick={() => handleStartPracticeWithLanguage(item.value)}
                className="relative flex min-h-[98px] flex-col items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-center text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200"
              >
                <FlagIcon countryCode={item.countryCode} className="h-5 w-7 rounded-[2px]" />
                <div className="flex flex-col">
                  <span className="text-base font-semibold leading-none">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>
      <LoginWithGoogleModal open={isLoginModalOpen} onCancel={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default ParagraphLibraryPage;
