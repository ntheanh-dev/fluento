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
import type { UserPractice } from "@/entities/userPractice/schema";
import { splitIntoSentences } from "@/utils/utils";

const PAGE_SIZE = 6;

const PARAGRAPH_TYPES = [
    { key: "", label: "Tất cả" },
    { key: "EMAIL", label: "EMAIL" },
    { key: "STORY", label: "STORY" },
    { key: "BASIC", label: "BASIC" },
    { key: "IELTS_TASK1", label: "IELTS Task 1" },
    { key: "IELTS_TASK2", label: "IELTS Task 2" },
] as const;

const TOPICS: { key: string; label: string }[] = [
    { key: "", label: "Tất cả" },
    { key: "LIFE", label: "Cuộc sống" },
    { key: "TECHNOLOGY", label: "Công nghệ" },
    { key: "CULTURE", label: "Văn hóa" },
    { key: "FOOD", label: "Ẩm thực" },
    { key: "HEALTH", label: "Sức khỏe" },
    { key: "EDUCATION", label: "Giáo dục" },
    { key: "TRAVEL", label: "Du lịch" },
    { key: "BUSINESS", label: "Kinh doanh" },
    { key: "SCIENCE", label: "Khoa học" },
    { key: "SPORTS", label: "Thể thao" },
    { key: "ENTERTAINMENT", label: "Giải trí" },
];

const LEVELS = [
    { key: "", label: "Tất cả" },
    { key: "A1", label: "A1" },
    { key: "A2", label: "A2" },
    { key: "B1", label: "B1" },
    { key: "B2", label: "B2" },
    { key: "C1", label: "C1" },
    { key: "C2", label: "C2" },
];

const SORT_OPTIONS = [
    { key: "desc", label: "Mới nhất trước" },
    { key: "asc", label: "Cũ nhất trước" },
];

function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return diffMins <= 1 ? "Vừa xong" : `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return diffDays === 1 ? "Hôm qua" : `${diffDays} ngày trước`;
    return d.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
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
    const [searchParams, setSearchParams] = useSearchParams();

    const viewMode = (searchParams.get(VIEW) === "single" ? "single" : "paragraph") as "single" | "paragraph";
    const typeFilter = searchParams.get(TYPE) ?? "";
    const topicFilter = searchParams.get(TOPIC) ?? "";
    const levelFilter = searchParams.get(LEVEL) ?? "";
    const sortOrder = (searchParams.get(SORT) === "asc" ? "asc" : "desc") as "asc" | "desc";
    const searchText = searchParams.get(SEARCH) ?? "";
    const page = parsePage(searchParams.get(PAGE));

    const [searchInput, setSearchInput] = useState(searchText);
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

    const handleSearch = () => {
        updateParams({ [SEARCH]: searchInput.trim(), [PAGE]: 1 });
    };

    const typeMenuItems: MenuProps["items"] = PARAGRAPH_TYPES.map((t) => ({
        key: t.key,
        label: t.label,
        onClick: () => updateParams({ [TYPE]: t.key, [PAGE]: 1 }),
    }));

    const topicMenuItems: MenuProps["items"] = TOPICS.map((t) => ({
        key: t.key,
        label: t.label,
        onClick: () => updateParams({ [TOPIC]: t.key, [PAGE]: 1 }),
    }));

    const levelMenuItems: MenuProps["items"] = LEVELS.map((l) => ({
        key: l.key,
        label: l.label,
        onClick: () => updateParams({ [LEVEL]: l.key, [PAGE]: 1 }),
    }));

    const sortMenuItems: MenuProps["items"] = SORT_OPTIONS.map((s) => ({
        key: s.key,
        label: s.label,
        onClick: () => updateParams({ [SORT]: s.key, [PAGE]: 1 }),
    }));

    const typeLabel = viewMode === "paragraph" ? (typeFilter ? PARAGRAPH_TYPES.find((t) => t.key === typeFilter)?.label ?? "Loại" : "Loại") : "Câu";
    const topicLabel = topicFilter ? TOPICS.find((t) => t.key === topicFilter)?.label ?? "Chủ đề" : "Chủ đề";
    const levelLabel = levelFilter ? LEVELS.find((l) => l.key === levelFilter)?.label ?? "Trình độ" : "Trình độ";
    const sortLabel = SORT_OPTIONS.find((s) => s.key === sortOrder)?.label ?? "Ngày";

    const content = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;
    const currentPage = data?.number ?? 0;

    return (
        <div className="h-[calc(100vh-130px+4rem)] max-w-8xl text-slate-800 font-display transition-colors duration-200">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-4 sticky top-0 z-40">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2 w-full">
                        <div className="flex p-0.5 bg-slate-100 rounded-lg shrink-0">
                            <button
                                onClick={() => updateParams({ [VIEW]: "paragraph", [PAGE]: 1 })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${viewMode === "paragraph" ? "bg-white text-[#198de6] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                All
                            </button>
                            <button
                                onClick={() => updateParams({ [VIEW]: "single", [PAGE]: 1 })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${viewMode === "single" ? "bg-white text-[#198de6] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                <Type className="w-3.5 h-3.5" />
                                Câu
                            </button>

                        </div>

                        <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

                        {viewMode === "paragraph" && (
                            <Dropdown menu={{ items: typeMenuItems }} trigger={["click"]}>
                                <button className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 whitespace-nowrap hover:bg-slate-50 transition-colors">
                                    {typeLabel} <ChevronDown className="w-3 h-3" />
                                </button>
                            </Dropdown>
                        )}

                        <Dropdown menu={{ items: topicMenuItems }} trigger={["click"]}>
                            <button className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 whitespace-nowrap hover:bg-slate-50 transition-colors">
                                {topicLabel} <ChevronDown className="w-3 h-3" />
                            </button>
                        </Dropdown>

                        <Dropdown menu={{ items: levelMenuItems }} trigger={["click"]}>
                            <button className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 whitespace-nowrap hover:bg-slate-50 transition-colors">
                                {levelLabel} <ChevronDown className="w-3 h-3" />
                            </button>
                        </Dropdown>

                        <Dropdown menu={{ items: sortMenuItems }} trigger={["click"]}>
                            <button className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 whitespace-nowrap hover:bg-slate-50 transition-colors">
                                {sortLabel} <ChevronDown className="w-3 h-3" />
                            </button>
                        </Dropdown>
                    </div>

                    <div className="relative w-full lg:w-64 flex gap-2">
                        <Input
                            prefix={<Search className="text-slate-400 w-3.5 h-3.5" />}
                            placeholder="Tìm kiếm..."
                            className="w-full py-1.5 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-xs hover:border-[#198de6] focus:border-[#198de6]"
                            variant="borderless"
                            style={{ border: "1px solid #e2e8f0" }}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onPressEnter={handleSearch}
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-[#198de6] text-white text-xs font-medium hover:opacity-90"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {isPending && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spin size="large" indicator={<Loader2 className="w-10 h-10 text-[#198de6] animate-spin" />} />
                    <span className="text-slate-500 text-sm">Đang tải lịch sử luyện tập...</span>
                </div>
            )}
            {isError && (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <span className="text-red-500 text-sm">Không thể tải lịch sử. Vui lòng thử lại.</span>
                </div>
            )}

            {!isPending && !isError && content.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <History className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-slate-700 font-semibold text-lg mb-1">Chưa có lịch sử luyện tập</h3>
                    <p className="text-slate-500 text-sm text-center max-w-sm mb-6">
                        {searchText || typeFilter || topicFilter || levelFilter
                            ? "Không tìm thấy bài luyện nào với bộ lọc hiện tại. Thử đổi điều kiện hoặc bắt đầu bài mới."
                            : "Bắt đầu luyện dịch câu hoặc đoạn văn để xem lịch sử tại đây."}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {(searchText || typeFilter || topicFilter || levelFilter || viewMode === "single" || sortOrder === "asc") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchParams(new URLSearchParams(), { replace: true });
                                    setSearchInput("");
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Xóa bộ lọc
                            </button>
                        )}
                        <Link
                            to="/practice"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#198de6] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Bắt đầu luyện tập <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            {!isPending && !isError && content.length > 0 && (
                <div className="flex flex-col min-h-[420px]">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 content-start">
                        {content.map((item: UserPractice) => {
                            const isParagraph = item.paragraph?.type !== "SINGLE_SENTENCE";
                            const vietnamese = item.paragraph?.content ?? "";
                            const english = item.sentenceAnswers?.[0]?.userTranslation ?? "";
                            const score = item.score ?? (item.sentenceAnswers?.length ? item.sentenceAnswers.reduce((a, s) => a + (s.score ?? 0), 0) / item.sentenceAnswers.length : 0);
                            const corrections = item.sentenceAnswers?.filter((a) => a.feedback).length ?? 0;
                            const isFinished = splitIntoSentences(item.paragraph?.content ?? "").length === item.sentenceAnswers?.length;
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.1 }}
                                    className="group bg-white rounded-lg border border-slate-200 hover:border-[#198de6]/30 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                                >
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${isParagraph ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}
                                                >
                                                    {isParagraph ? item.paragraph?.type ?? "—" : "Câu"}
                                                </span>

                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                                                    {item.paragraph?.topic ?? "—"}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                                                    {item.paragraph?.level ?? "—"}
                                                </span>

                                            </div>
                                            <span className="text-slate-400 text-[10px]">
                                                {item.createdAt ? formatDate(item.createdAt) : "—"}
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
                                                        Tiếng Việt
                                                    </label>
                                                    <p
                                                        className={`text-slate-800 text-sm leading-snug ${isParagraph ? "line-clamp-2" : "line-clamp-3"}`}
                                                    >
                                                        {vietnamese || "—"}
                                                    </p>
                                                </div>
                                                <div className={isParagraph ? "" : "pl-2 border-l-2 border-purple-500/20"}>
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                                        Tiếng Anh
                                                    </label>
                                                    <p
                                                        className={`text-slate-800 text-sm leading-snug ${isParagraph ? "line-clamp-2" : "line-clamp-3"}`}
                                                    >
                                                        {english || " "}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center mt-auto">

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
                                                Kết quả <BarChart2 className="w-3 h-3" />
                                            </Link>
                                        ) : (<Link
                                            to={`/practice/${item.id}`}
                                            className="text-[#198de6] text-[10px] font-bold uppercase hover:underline flex items-center gap-1"
                                        >
                                            Tiếp tục luyện tập <ArrowRight className="w-3 h-3" />
                                        </Link>)}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex justify-center flex-shrink-0">
                        <Pagination
                            current={currentPage + 1}
                            total={totalElements}
                            pageSize={PAGE_SIZE}
                            showSizeChanger={false}
                            onChange={(p) => updateParams({ [PAGE]: p })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeHistory;
