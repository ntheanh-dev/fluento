import { useState, useMemo, useEffect } from "react";
import {
    Type,
    FileText,
    Search,
    BarChart2,
    ArrowRight,
    History,
    RotateCcw,
    Clock,
    Filter,
    X,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Pagination, Input, Select, Button, Drawer } from "antd";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getHistory, type GetHistoryParams } from "./api";
import { OK } from "@/shared/api/query-keys";
import { APP_TIME_ZONE } from "@/shared/utilities/date";
import type { UserPractice } from "@/entities/userPractice/schema";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { TargetLanguage } from "@/shared/constants/target-language";
import { FlagIcon, getTargetLanguageCountryCode } from "@/shared/utilities/flag";
import { Globe2 } from "lucide-react";
import { CollapsibleChecklistSection } from "@/shared/components/CollapsibleChecklistSection";
import { AppSpinner } from "@/shared/components/AppSpinner";

const PAGE_SIZE = 9;

const PARAGRAPH_TYPE_KEYS = [
    "",
    "EMAIL",
    "STORY",
    "DIARIES",
    "IELTS_TASK1",
    "IELTS_TASK2",
    "ESSAYS",
] as const;

const TOPIC_KEYS = [
    "",
    "LIFE",
    "TECHNOLOGY",
    "CULTURE",
    "FOOD",
    "HEALTH",
    "EDUCATION",
    "FITNESS",
    "MENTAL_HEALTH",
    "TRAVEL",
    "TOURISM",
    "COUNTRIES",
    "LANDMARKS",
    "BUSINESS",
    "SCIENCE",
    "ENTERTAINMENT",
    "SOCIETY",
] as const;

const LEVEL_KEYS = ["", "A2", "B1", "B2", "C1", "C2"] as const;

const SORT_KEYS = ["desc", "asc"] as const;

function paragraphTypeLabel(key: string, t: TFunction): string {
    if (!key) return t("common.all");
    return t(`history.paragraphType.${key}`);
}

function topicFilterLabel(key: string, t: TFunction): string {
    if (!key) return t("common.all");
    return t(`common.topic.${key}`);
}

function levelFilterLabel(key: string, t: TFunction): string {
    if (!key) return t("common.all");
    return t(`practice.level.${key}`);
}

function sortOptionLabel(key: string, t: TFunction): string {
    return key === "asc" ? t("history.sortOldest") : t("history.sortNewest");
}

function targetLanguageLabel(key: TargetLanguage | undefined, t: TFunction): string {
    if (!key) return t("history.targetLanguage.EN");
    return t(`history.targetLanguage.${key}`);
}

function formatRelativeDate(iso: string, t: TFunction, locale: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const loc = locale.startsWith("vi") ? "vi-VN" : "en-US";
    if (diffMins < 60) {
        return diffMins <= 1
            ? t("history.dateJustNow")
            : t("history.dateMinutesAgo", { count: diffMins });
    }
    if (diffHours < 24) {
        return t("history.dateHoursAgo", { count: diffHours });
    }
    if (diffDays < 7) {
        return diffDays === 1
            ? t("history.dateYesterday")
            : t("history.dateDaysAgo", { count: diffDays });
    }
    return d.toLocaleDateString(loc, {
        timeZone: APP_TIME_ZONE,
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatLearningTime(ms: number | undefined | null): string {
    if (ms == null || ms < 0) return "0m";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}m`;
}

const VIEW = "view";
const TYPE = "type";
const TOPIC = "topic";
const LEVEL = "level";
const SEARCH = "search";
const SORT = "sort";
const PAGE = "page";
const TARGET_LANGUAGE = "targetLanguage";
const COMPLETED = "completed";

function parsePage(value: string | null): number {
    const n = parseInt(value ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n - 1 : 0;
}

const PracticeHistory = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const viewMode = (searchParams.get(VIEW) === "single" ? "single" : "paragraph") as "single" | "paragraph";
    const typeFilter = searchParams.get(TYPE) ?? "";
    const topicFilter = searchParams.get(TOPIC) ?? "";
    const levelFilter = searchParams.get(LEVEL) ?? "";
    const targetLanguageFilter = searchParams.get(TARGET_LANGUAGE) ?? "";
    const completionFilter = searchParams.get(COMPLETED) ?? "";
    const sortOrder = (searchParams.get(SORT) === "asc" ? "asc" : "desc") as "asc" | "desc";
    const searchText = searchParams.get(SEARCH) ?? "";
    const page = parsePage(searchParams.get(PAGE));

    const [searchInput, setSearchInput] = useState(searchText);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const debouncedSearch = useDebounce(searchInput, 450);
    useEffect(() => {
        setSearchInput(searchText);
    }, [searchText]);

    const updateParams = useMemo(
        () => (updates: Record<string, string | number>) => {
            const next = new URLSearchParams(searchParams);
            Object.entries(updates).forEach(([key, value]) => {
                const s = String(value).trim();
                if (s === "" || (key === PAGE && s === "1") || (key === SORT && s === "desc") || (key === VIEW && s === "paragraph")) {
                    next.delete(key);
                } else {
                    next.set(key, s);
                }
            });
            setSearchParams(next, { replace: true });
        },
        [searchParams, setSearchParams],
    );

    const queryParams: GetHistoryParams = useMemo(() => {
        const type =
            viewMode === "single"
                ? "SINGLE_SENTENCE"
                : typeFilter
                    ? typeFilter
                    : undefined;
        return {
            page,
            size: PAGE_SIZE,
            ...(type && { type }),
            ...(topicFilter && { topic: topicFilter }),
            ...(levelFilter && { level: levelFilter }),
            ...(targetLanguageFilter && { targetLanguage: targetLanguageFilter as TargetLanguage }),
            ...(completionFilter && { completed: completionFilter === "true" }),
            ...(searchText && { search: searchText }),
            sort: sortOrder,
        };
    }, [viewMode, typeFilter, topicFilter, levelFilter, targetLanguageFilter, completionFilter, searchText, sortOrder, page]);

    const { data, isPending, isError } = useQuery({
        queryKey: OK.historyList(queryParams),
        queryFn: () => getHistory(queryParams),
    });

    useEffect(() => {
        const trimmedSearch = debouncedSearch.trim();
        if (trimmedSearch === searchText) return;
        updateParams({ [SEARCH]: trimmedSearch, [PAGE]: 1 });
    }, [debouncedSearch, searchText, updateParams]);

    const content = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;
    const currentPage = data?.number ?? 0;
    const hasActiveFilters = Boolean(
        searchText || typeFilter || topicFilter || levelFilter || targetLanguageFilter || completionFilter || viewMode === "single" || sortOrder === "asc",
    );
    const activeFilterChips = useMemo(() => {
        const chips: Array<{ key: string; label: string }> = [];
        if (viewMode === "single") {
            chips.push({ key: VIEW, label: `${t("history.type")}: ${t("history.sentence")}` });
        } else if (typeFilter) {
            chips.push({ key: TYPE, label: `${t("history.type")}: ${paragraphTypeLabel(typeFilter, t)}` });
        }
        if (topicFilter) {
            chips.push({ key: TOPIC, label: `${t("history.topic")}: ${topicFilterLabel(topicFilter, t)}` });
        }
        if (levelFilter) {
            chips.push({ key: LEVEL, label: `${t("history.level")}: ${levelFilterLabel(levelFilter, t)}` });
        }
        if (targetLanguageFilter) {
            chips.push({
                key: TARGET_LANGUAGE,
                label: `${t("history.language")}: ${targetLanguageLabel(targetLanguageFilter as TargetLanguage, t)}`,
            });
        }
        if (completionFilter) {
            chips.push({
                key: COMPLETED,
                label: `${t("history.completion")}: ${completionFilter === "true" ? t("history.completed") : t("history.incomplete")}`,
            });
        }
        if (sortOrder === "asc") {
            chips.push({ key: SORT, label: `${t("history.sort")}: ${sortOptionLabel(sortOrder, t)}` });
        }
        if (searchText) {
            chips.push({ key: SEARCH, label: `${t("history.searchPlaceholder")}: "${searchText}"` });
        }
        return chips;
    }, [viewMode, typeFilter, topicFilter, levelFilter, targetLanguageFilter, completionFilter, sortOrder, searchText, t]);
    const removeFilterChip = (key: string) => {
        if (key === SEARCH) {
            setSearchInput("");
            updateParams({ [SEARCH]: "", [PAGE]: 1 });
            return;
        }
        if (key === VIEW) {
            updateParams({ [VIEW]: "paragraph", [PAGE]: 1 });
            return;
        }
        updateParams({ [key]: "", [PAGE]: 1 });
    };

    const filterPanel = (
        <div className="space-y-5">
            <section className="space-y-2.5">
                <Input
                    prefix={<Search className="text-slate-400 w-3.5 h-3.5" />}
                    placeholder={t("history.searchPlaceholder")}
                    className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 text-base hover:border-[#198de6] focus:border-[#198de6]"
                    variant="borderless"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </section>

            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            <CollapsibleChecklistSection
                title={t("history.language")}
                items={[
                    { value: "", label: t("common.all"), countryCode: null },
                    { value: "EN", label: t("history.targetLanguage.EN"), countryCode: "US" as const },
                    { value: "ZH", label: t("history.targetLanguage.ZH"), countryCode: "CN" as const },
                    { value: "KO", label: t("history.targetLanguage.KO"), countryCode: "KR" as const },
                ].map((item) => ({
                    key: item.value || "all",
                    label: (
                        <span className="inline-flex items-center gap-2">
                            <span>
                                {item.countryCode ? (
                                    <FlagIcon countryCode={item.countryCode} className="h-3.5 w-5 rounded-[2px]" />
                                ) : (
                                    <Globe2 className="h-3.5 w-3.5 text-slate-500" />
                                )}
                            </span>
                            <span>{item.label}</span>
                        </span>
                    ),
                    selected: targetLanguageFilter === item.value,
                    onClick: () => updateParams({ [TARGET_LANGUAGE]: item.value, [PAGE]: 1 }),
                }))}
            />

            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            <CollapsibleChecklistSection
                title={t("history.type")}
                items={[
                    { value: "paragraph" as const, label: t("common.all"), icon: FileText },
                    { value: "single" as const, label: t("history.sentence"), icon: Type },
                ].map((item) => ({
                    key: item.value,
                    label: (
                        <span className="inline-flex items-center gap-2">
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </span>
                    ),
                    selected: viewMode === item.value,
                    onClick: () => updateParams({ [VIEW]: item.value, [PAGE]: 1 }),
                }))}
            />

            {viewMode === "paragraph" && (
                <>
                    <div className="h-px bg-slate-200 dark:bg-slate-700" />
                    <CollapsibleChecklistSection
                        title={t("history.type")}
                        items={PARAGRAPH_TYPE_KEYS.map((key) => ({
                            key: key || "all",
                            label: paragraphTypeLabel(key, t),
                            selected: typeFilter === key,
                            onClick: () => updateParams({ [TYPE]: key, [PAGE]: 1 }),
                        }))}
                    />
                </>
            )}

            <div className="h-px bg-slate-200 dark:bg-slate-700" />
            <section className="space-y-2.5">
                <h3 className="text-slate-800 dark:text-slate-100 font-semibold uppercase tracking-wide text-xs">
                    {t("history.topic")}
                </h3>
                <Select
                    className="w-full"
                    value={topicFilter || undefined}
                    placeholder={t("common.all")}
                    onChange={(value) => updateParams({ [TOPIC]: value ?? "", [PAGE]: 1 })}
                    options={TOPIC_KEYS.filter((key) => key).map((key) => ({
                        value: key,
                        label: topicFilterLabel(key, t),
                    }))}
                    allowClear
                />
            </section>

            <div className="h-px bg-slate-200 dark:bg-slate-700" />
            <section className="space-y-2.5">
                <h3 className="text-slate-800 dark:text-slate-100 font-semibold uppercase tracking-wide text-xs">
                    {t("history.level")}
                </h3>
                <Select
                    className="w-full"
                    value={levelFilter || undefined}
                    placeholder={t("common.all")}
                    onChange={(value) => updateParams({ [LEVEL]: value ?? "", [PAGE]: 1 })}
                    options={LEVEL_KEYS.filter((key) => key).map((key) => ({
                        value: key,
                        label: levelFilterLabel(key, t),
                    }))}
                    allowClear
                />
            </section>

            <div className="h-px bg-slate-200 dark:bg-slate-700" />
            <CollapsibleChecklistSection
                title={t("history.completion")}
                items={[
                    { value: "", label: t("common.all") },
                    { value: "true", label: t("history.completed") },
                    { value: "false", label: t("history.incomplete") },
                ].map((item) => ({
                    key: item.value || "all",
                    label: item.label,
                    selected: completionFilter === item.value,
                    onClick: () => updateParams({ [COMPLETED]: item.value, [PAGE]: 1 }),
                }))}
            />

            <div className="h-px bg-slate-200 dark:bg-slate-700" />
            <CollapsibleChecklistSection
                title={t("history.sort")}
                items={SORT_KEYS.map((key) => ({
                    key,
                    label: sortOptionLabel(key, t),
                    selected: sortOrder === key,
                    onClick: () => updateParams({ [SORT]: key, [PAGE]: 1 }),
                }))}
            />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 text-slate-800 dark:text-slate-100 font-display transition-colors duration-200">
            <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
                <aside className="hidden xl:block bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 h-fit shadow-sm space-y-5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <h2 className="font-bold text-xl leading-none">{t("paragraphLibrary.filters.title")}</h2>
                        </div>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchParams(new URLSearchParams(), { replace: true });
                                    setSearchInput("");
                                }}
                                className="text-xs font-semibold text-[#198de6] hover:underline"
                            >
                                {t("history.clearFilters")}
                            </button>
                        )}
                    </div>
                    {filterPanel}
                </aside>
                <section className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    {t("history.title")}
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {sortOptionLabel(sortOrder, t)}
                                </p>
                            </div>
                            <Button
                                className="xl:hidden"
                                icon={<Filter className="w-4 h-4" />}
                                onClick={() => setMobileFilterOpen(true)}
                            >
                                {t("paragraphLibrary.filters.title")}
                            </Button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {activeFilterChips.length > 0 && (
                                activeFilterChips.map((chip) => (
                                    <span
                                        key={chip.key}
                                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 pl-2.5 pr-1 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
                                    >
                                        <span>{chip.label}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFilterChip(chip.key)}
                                            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                            aria-label={`Remove ${chip.label}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                    {isPending && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <AppSpinner className="py-0" />
                        </div>
                    )}
                    {isError && (
                        <div className="flex flex-col items-center justify-center py-20 gap-2">
                            <span className="text-red-500 text-sm">{t("history.loadError")}</span>
                        </div>
                    )}

                    {!isPending && !isError && content.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <History className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-lg mb-1">{t("history.emptyTitle")}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-sm mb-6">
                                {searchText || typeFilter || topicFilter || levelFilter || targetLanguageFilter || completionFilter
                                    ? t("history.emptyFiltered")
                                    : t("history.emptyDefault")}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchParams(new URLSearchParams(), { replace: true });
                                            setSearchInput("");
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        {t("history.clearFilters")}
                                    </button>
                                )}
                                <Link
                                    to="/practice/single-sentence"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#198de6] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    {t("history.startPractice")} <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {!isPending && !isError && content.length > 0 && (
                        <>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 content-start">
                                {content.map((item: UserPractice) => {
                                    const isParagraph = item.paragraph?.type !== "SINGLE_SENTENCE";
                                    const paragraphSentences = (item.paragraph?.sentences ?? []).map((sentence) => sentence.content);
                                    const vietnamese = paragraphSentences.join(" ").replace("\\n", " ");
                                    const english = item.sentenceAnswers?.[0]?.userTranslation?.replace("\\n", " ") ?? "";
                                    const targetTextLabel = targetLanguageLabel(item.targetLanguage, t);
                                    const targetCountryCode = getTargetLanguageCountryCode(item.targetLanguage ?? "EN");
                                    const score = item.score ?? (item.sentenceAnswers?.length ? item.sentenceAnswers.reduce((a, s) => a + (s.score ?? 0), 0) / item.sentenceAnswers.length : 0);
                                    const totalSentences = Math.max(paragraphSentences.length, 1);
                                    const completedSentences = Math.min(item.sentenceAnswers?.length ?? 0, totalSentences);
                                    const progressPercent = Math.round((completedSentences / totalSentences) * 100);
                                    const isFinished = paragraphSentences.length === item.sentenceAnswers?.length;
                                    const practiceHref = isFinished ? `/practice/${item.id}/result` : `/practice/${item.id}`;
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.1 }}
                                            onClick={() => navigate(practiceHref)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    navigate(practiceHref);
                                                }
                                            }}
                                            role="link"
                                            tabIndex={0}
                                            className="group bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#198de6]/30 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                                        >
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${isParagraph ? "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" : "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"}`}
                                                        >
                                                            {isParagraph
                                                                ? item.paragraph?.type
                                                                    ? t(`practice.type.${item.paragraph.type}`)
                                                                    : "—"
                                                                : t("history.typeBadgeSentence")}
                                                        </span>

                                                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wide">
                                                            {item.paragraph?.topic
                                                                ? t(`common.topic.${item.paragraph.topic}`)
                                                                : "—"}
                                                        </span>
                                                    </div>
                                                    <span className="text-slate-400 text-[10px]">
                                                        {item.createdAt
                                                            ? formatRelativeDate(
                                                                item.createdAt,
                                                                t,
                                                                i18n.language,
                                                            )
                                                            : "—"}
                                                    </span>
                                                </div>

                                                <div className="flex gap-4 mb-3">
                                                    {isFinished && (<div className="shrink-0">
                                                        <div
                                                            className={`relative w-12 h-12 flex flex-col items-center justify-center rounded-full border-[3px] ${score >= 8 ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-orange-400 bg-orange-50 text-orange-600"}`}
                                                        >
                                                            <span className="text-sm font-bold">{score ? score.toFixed(1) : "0"}</span>
                                                        </div>
                                                    </div>)}

                                                    <div className="flex-1 min-w-0 space-y-3">
                                                        <div className={isParagraph ? "" : "pl-2 border-l-2 border-[#198de6]/20"}>
                                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <FlagIcon countryCode="VN" className="h-3 w-5 rounded-[2px]" />
                                                                    <span>{t("history.vietnamese")}</span>
                                                                </span>
                                                            </label>
                                                            <p
                                                                className={`text-slate-800 dark:text-slate-100 text-sm leading-snug ${isParagraph ? "line-clamp-2" : "line-clamp-3"}`}
                                                            >
                                                                {vietnamese || "—"}
                                                            </p>
                                                        </div>
                                                        <div className={isParagraph ? "" : "pl-2 border-l-2 border-purple-500/20"}>
                                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <FlagIcon countryCode={targetCountryCode} className="h-3 w-5 rounded-[2px]" />
                                                                    <span>{targetTextLabel}</span>
                                                                </span>
                                                            </label>
                                                            <p
                                                                className={`text-slate-800 dark:text-slate-100 text-sm leading-snug ${isParagraph ? "line-clamp-2" : "line-clamp-3"}`}
                                                            >
                                                                {english || " "}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 grid grid-cols-[auto_1fr_auto] items-center gap-3 mt-auto">
                                                <div className="flex gap-3">
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {formatLearningTime(item.learningTime)}
                                                    </span>

                                                </div>
                                                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-[#198de6] transition-all duration-300"
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                                {isFinished ? (
                                                    <Link
                                                        to={practiceHref}
                                                        onClick={(event) => event.stopPropagation()}
                                                        className="text-[#198de6] text-[10px] font-bold uppercase hover:underline flex items-center gap-1"
                                                    >
                                                        {t("history.viewResult")}{" "}
                                                        <BarChart2 className="w-3 h-3" />
                                                    </Link>
                                                ) : (<Link
                                                    to={practiceHref}
                                                    onClick={(event) => event.stopPropagation()}
                                                    className="text-[#198de6] text-[10px] font-bold uppercase hover:underline flex items-center gap-1"
                                                >
                                                    {t("history.continuePractice")}{" "}
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>)}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 justify-center items-center w-full flex-shrink-0">
                                <Pagination
                                    className="flex justify-center"
                                    current={currentPage + 1}
                                    total={totalElements}
                                    pageSize={PAGE_SIZE}
                                    showSizeChanger={false}
                                    onChange={(p) => updateParams({ [PAGE]: p })}
                                />
                            </div>
                        </>
                    )}
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
        </div>
    );
};

export default PracticeHistory;
