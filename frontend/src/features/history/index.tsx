import { useState, useMemo, useEffect } from "react";
import {
    Type,
    FileText,
    Search,
    ChevronDown,
    CheckCircle,
    BarChart2,
    ArrowRight,
    History,
    Loader2,
    RotateCcw,
    Clock,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Pagination, Input, Dropdown, Spin } from "antd";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import type { MenuProps } from "antd";
import { getHistory, type GetHistoryParams } from "./api";
import { OK } from "@/shared/api/query-keys";
import { APP_TIME_ZONE } from "@/shared/utilities/date";
import type { UserPractice } from "@/entities/userPractice/schema";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

const PAGE_SIZE = 6;

const PARAGRAPH_TYPE_KEYS = [
    "",
    "EMAIL",
    "STORY",
    "BASIC",
    "IELTS_TASK1",
    "IELTS_TASK2",
] as const;

const TOPIC_KEYS = [
    "",
    "LIFE",
    "TECHNOLOGY",
    "CULTURE",
    "FOOD",
    "ENVIRONMENT",
    "HEALTH",
    "EDUCATION",
    "FITNESS",
    "YOGA",
    "NUTRITION",
    "MENTAL_HEALTH",
    "MEDICINE",
    "TRAVEL",
    "TOURISM",
    "COUNTRIES",
    "LANDMARKS",
    "TRANSPORTATION",
    "WEATHER",
    "BUSINESS",
    "SCIENCE",
    "ECONOMICS",
    "MARKETING",
    "FINANCE",
    "STARTUPS",
    "ECOMMERCE",
    "ART",
    "HISTORY",
    "LITERATURE",
    "PHILOSOPHY",
    "PSYCHOLOGY",
    "MUSIC",
    "MOVIES",
    "THEATRE",
    "FASHION",
    "GAMES",
    "SPORTS",
    "ENTERTAINMENT",
    "POLITICS",
    "RELIGION",
    "SOCIETY",
    "SHOPPING",
    "HOUSEWORK",
    "RELATIONSHIPS",
    "PETS",
    "HOLIDAYS",
    "CLIMATE_CHANGE",
    "SUSTAINABILITY",
    "GLOBALIZATION",
    "POVERTY",
    "HUMAN_RIGHTS",
    "PARENTING",
    "MARRIAGE",
    "COMMUNITY",
    "VOLUNTEERING",
    "TRADITIONS",
] as const;

const LEVEL_KEYS = ["", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

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

function parsePage(value: string | null): number {
    const n = parseInt(value ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n - 1 : 0;
}

const PracticeHistory = () => {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const viewMode = (searchParams.get(VIEW) === "single" ? "single" : "paragraph") as "single" | "paragraph";
    const typeFilter = searchParams.get(TYPE) ?? "";
    const topicFilter = searchParams.get(TOPIC) ?? "";
    const levelFilter = searchParams.get(LEVEL) ?? "";
    const sortOrder = (searchParams.get(SORT) === "asc" ? "asc" : "desc") as "asc" | "desc";
    const searchText = searchParams.get(SEARCH) ?? "";
    const page = parsePage(searchParams.get(PAGE));

    const [searchInput, setSearchInput] = useState(searchText);
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
            ...(searchText && { search: searchText }),
            sort: sortOrder,
        };
    }, [viewMode, typeFilter, topicFilter, levelFilter, searchText, sortOrder, page]);

    const { data, isPending, isError } = useQuery({
        queryKey: OK.historyList(queryParams),
        queryFn: () => getHistory(queryParams),
    });

    useEffect(() => {
        const trimmedSearch = debouncedSearch.trim();
        if (trimmedSearch === searchText) return;
        updateParams({ [SEARCH]: trimmedSearch, [PAGE]: 1 });
    }, [debouncedSearch, searchText, updateParams]);

    const typeMenuItems: MenuProps["items"] = PARAGRAPH_TYPE_KEYS.map((key) => ({
        key,
        label: paragraphTypeLabel(key, t),
        onClick: () => updateParams({ [TYPE]: key, [PAGE]: 1 }),
    }));

    const topicMenuItems: MenuProps["items"] = TOPIC_KEYS.map((key) => ({
        key,
        label: topicFilterLabel(key, t),
        onClick: () => updateParams({ [TOPIC]: key, [PAGE]: 1 }),
    }));

    const levelMenuItems: MenuProps["items"] = LEVEL_KEYS.map((key) => ({
        key,
        label: levelFilterLabel(key, t),
        onClick: () => updateParams({ [LEVEL]: key, [PAGE]: 1 }),
    }));

    const sortMenuItems: MenuProps["items"] = SORT_KEYS.map((key) => ({
        key,
        label: sortOptionLabel(key, t),
        onClick: () => updateParams({ [SORT]: key, [PAGE]: 1 }),
    }));

    const typeFilterButtonLabel =
        viewMode === "paragraph"
            ? typeFilter
                ? paragraphTypeLabel(typeFilter, t)
                : t("history.type")
            : t("history.sentence");

    const topicFilterButtonLabel = topicFilter
        ? topicFilterLabel(topicFilter, t)
        : t("history.topic");

    const levelFilterButtonLabel = levelFilter
        ? levelFilterLabel(levelFilter, t)
        : t("history.level");

    const sortButtonLabel = sortOptionLabel(sortOrder, t);

    const content = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;
    const currentPage = data?.number ?? 0;

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100 font-display transition-colors duration-200">
            <div className="rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 p-3 mb-4 z-40">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2 w-full">
                        <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                            <button
                                onClick={() => updateParams({ [VIEW]: "paragraph", [PAGE]: 1 })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${viewMode === "paragraph" ? "bg-white dark:bg-slate-700 text-[#198de6] shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"}`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                {t("common.all")}
                            </button>
                            <button
                                onClick={() => updateParams({ [VIEW]: "single", [PAGE]: 1 })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${viewMode === "single" ? "bg-white dark:bg-slate-700 text-[#198de6] shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"}`}
                            >
                                <Type className="w-3.5 h-3.5" />
                                {t("history.sentence")}
                            </button>

                        </div>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-600 mx-1 shrink-0" />

                        {viewMode === "paragraph" && (
                            <Dropdown menu={{ items: typeMenuItems }} trigger={["click"]}>
                                <button className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    {typeFilterButtonLabel} <ChevronDown className="w-3 h-3" />
                                </button>
                            </Dropdown>
                        )}

                        <Dropdown menu={{ items: topicMenuItems }} trigger={["click"]}>
                            <button className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                {topicFilterButtonLabel} <ChevronDown className="w-3 h-3" />
                            </button>
                        </Dropdown>

                        <Dropdown menu={{ items: levelMenuItems }} trigger={["click"]}>
                            <button className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                {levelFilterButtonLabel} <ChevronDown className="w-3 h-3" />
                            </button>
                        </Dropdown>

                        <Dropdown menu={{ items: sortMenuItems }} trigger={["click"]}>
                            <button className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                {sortButtonLabel} <ChevronDown className="w-3 h-3" />
                            </button>
                        </Dropdown>
                    </div>

                    <div className="relative w-full lg:w-64">
                        <Input
                            prefix={<Search className="text-slate-400 w-3.5 h-3.5" />}
                            placeholder={t("history.searchPlaceholder")}
                            className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 text-base hover:border-[#198de6] focus:border-[#198de6]"
                            variant="borderless"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {isPending && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spin size="large" indicator={<Loader2 className="w-10 h-10 text-[#198de6] animate-spin" />} />
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{t("history.loading")}</span>
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
                        {searchText || typeFilter || topicFilter || levelFilter
                            ? t("history.emptyFiltered")
                            : t("history.emptyDefault")}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {(searchText || typeFilter || topicFilter || levelFilter || viewMode === "single" || sortOrder === "asc") && (
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
                            to="/practice"
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
                            const vietnamese = paragraphSentences.join(" ");
                            const english = item.sentenceAnswers?.[0]?.userTranslation ?? "";
                            const score = item.score ?? (item.sentenceAnswers?.length ? item.sentenceAnswers.reduce((a, s) => a + (s.score ?? 0), 0) / item.sentenceAnswers.length : 0);
                            const corrections = item.sentenceAnswers?.filter((a) => a.feedback).length ?? 0;
                            const isFinished = paragraphSentences.length === item.sentenceAnswers?.length;
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.1 }}
                                    className="group bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#198de6]/30 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
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
                                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wide">
                                                    {item.paragraph?.level ?? "—"}
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
                                                        {t("history.vietnamese")}
                                                    </label>
                                                    <p
                                                        className={`text-slate-800 dark:text-slate-100 text-sm leading-snug ${isParagraph ? "line-clamp-2" : "line-clamp-3"}`}
                                                    >
                                                        {vietnamese || "—"}
                                                    </p>
                                                </div>
                                                <div className={isParagraph ? "" : "pl-2 border-l-2 border-purple-500/20"}>
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                                        {t("history.english")}
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

                                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-auto">

                                        <div className="flex gap-3">
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatLearningTime(item.learningTime)}
                                            </span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> {corrections || "0"}
                                            </span>
                                        </div>
                                        {isFinished ? (
                                            <Link
                                                to={`/practice/${item.id}/result`}
                                                className="text-[#198de6] text-[10px] font-bold uppercase hover:underline flex items-center gap-1"
                                            >
                                                {t("history.viewResult")}{" "}
                                                <BarChart2 className="w-3 h-3" />
                                            </Link>
                                        ) : (<Link
                                            to={`/practice/${item.id}`}
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
        </div>
    );
};

export default PracticeHistory;
