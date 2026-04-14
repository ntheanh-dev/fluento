import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, PauseCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParagraphs } from "@/features/paragraph/query";
import { getHistory } from "@/features/history/api";
import { OK } from "@/shared/api/query-keys";
import { getCoverImage } from "@/shared/constants/practice-covers";
import type { ParagraphItem } from "@/features/paragraph/schema";
import type { UserPractice } from "@/entities/userPractice/schema";

type SliderCard = {
    id: string;
    title: string;
    cover: string;
    type?: string;
    topic?: string;
};


const EXTRA_CATEGORY_FILTERS: Array<{ type: string; topic: string }> = [
    { type: "IELTS_TASK1", topic: "EDUCATION" },
    { type: "IELTS_TASK2", topic: "TECHNOLOGY" },
    { type: "EMAIL", topic: "BUSINESS" },
    { type: "STORY", topic: "TRAVEL" },
    { type: "ESSAYS", topic: "SOCIETY" },
    { type: "DIARIES", topic: "LIFE" },
    { type: "IELTS_TASK1", topic: "HEALTH" },
    { type: "IELTS_TASK2", topic: "CULTURE" },
];

function toSliderCards(items: ParagraphItem[], t: (key: string) => string): SliderCard[] {
    const unique = new Map<string, SliderCard>();

    for (const item of items) {
        const key = `${item.type}-${item.topic}`;
        if (unique.has(key)) continue;

        unique.set(key, {
            id: key,
            title: `${t(`practice.type.${item.type}`)} - ${t(`common.topic.${item.topic}`)}`,
            cover: getCoverImage(item.topic, item.type, key),
            type: item.type,
            topic: item.topic,
        });
    }

    for (const extra of EXTRA_CATEGORY_FILTERS) {
        const key = `${extra.type}-${extra.topic}`;
        if (unique.has(key)) continue;
        unique.set(key, {
            id: key,
            title: `${t(`practice.type.${extra.type}`)} - ${t(`common.topic.${extra.topic}`)}`,
            cover: getCoverImage(extra.topic, extra.type, key),
            type: extra.type,
            topic: extra.topic,
        });
    }

    return Array.from(unique.values());
}

function Home() {
    const { t } = useTranslation();
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const navigate = useNavigate();
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const [activeSlide, setActiveSlide] = useState(0);

    const { data: paragraphData } = useParagraphs({
        sort: "most_practiced",
        page: 0,
        size: 16,
    });
    const { data: ieltsTask1Data } = useParagraphs({
        type: "IELTS_TASK1",
        sort: "desc",
        page: 0,
        size: 4,
    });
    const { data: ieltsTask2Data } = useParagraphs({
        type: "IELTS_TASK2",
        sort: "desc",
        page: 0,
        size: 4,
    });
    const { data: emailData } = useParagraphs({
        type: "EMAIL",
        sort: "desc",
        page: 0,
        size: 4,
    });

    const { data: historyData } = useQuery({
        queryKey: OK.historyList({ page: 0, size: 3, sort: "desc" }),
        queryFn: () => getHistory({ page: 0, size: 3, sort: "desc" }),
    });

    const sliderCards = useMemo(
        () => toSliderCards(paragraphData?.content ?? [], t),
        [paragraphData?.content, t],
    );
    const recentPractices = useMemo(() => historyData?.content ?? [], [historyData?.content]);
    const paragraphSections = useMemo(() => {
        return [
            {
                key: "IELTS_TASK1",
                title: t("home.sections.ieltsTask1"),
                items: ieltsTask1Data?.content ?? [],
            },
            {
                key: "IELTS_TASK2",
                title: t("home.sections.ieltsTask2"),
                items: ieltsTask2Data?.content ?? [],
            },
            {
                key: "EMAIL",
                title: t("home.sections.email"),
                items: emailData?.content ?? [],
            },
        ];
    }, [emailData?.content, ieltsTask1Data?.content, ieltsTask2Data?.content, t]);

    const maxSlide = Math.max(sliderCards.length - 1, 0);

    const scrollToSlide = (nextIndex: number) => {
        const container = sliderRef.current;
        if (!container) return;
        const child = container.children.item(nextIndex) as HTMLElement | null;
        if (!child) return;
        child.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    };

    const handlePrev = () => {
        setActiveSlide((prev) => {
            const next = Math.max(0, prev - 1);
            scrollToSlide(next);
            return next;
        });
    };

    const handleNext = () => {
        setActiveSlide((prev) => {
            const next = Math.min(maxSlide, prev + 1);
            scrollToSlide(next);
            return next;
        });
    };

    const handleSliderScroll = () => {
        const container = sliderRef.current;
        if (!container || !container.children.length) return;
        const containerLeft = container.getBoundingClientRect().left;
        let nearestIndex = 0;
        let minDistance = Number.POSITIVE_INFINITY;

        Array.from(container.children).forEach((child, idx) => {
            const el = child as HTMLElement;
            const distance = Math.abs(el.getBoundingClientRect().left - containerLeft);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = idx;
            }
        });

        if (nearestIndex !== activeSlide) {
            setActiveSlide(nearestIndex);
        }
    };

    const handleCategoryClick = (card: SliderCard) => {
        const params = new URLSearchParams();
        if (card.type) params.set("type", card.type);
        if (card.topic) params.set("topic", card.topic);
        navigate(`/paragraphs?${params.toString()}`);
    };

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8 dark:text-slate-100">
            <section className="relative">
                <button
                    className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 md:flex"
                    type="button"
                    aria-label={t("home.slider.previous")}
                    onClick={handlePrev}
                    disabled={activeSlide <= 0}
                >
                    <ChevronLeft size={18} />
                </button>

                <div
                    ref={sliderRef}
                    onScroll={handleSliderScroll}
                    className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 md:px-12"
                >
                    {sliderCards.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleCategoryClick(item)}
                            className="relative h-24 min-w-[260px] snap-start overflow-hidden rounded-xl text-left transition hover:scale-[1.01] sm:min-w-[280px] md:min-w-[300px]"
                        >
                            <img src={item.cover} alt={item.title} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/45" />
                            <h3 className="absolute inset-0 flex items-center justify-center px-4 text-center text-lg font-bold text-white md:text-xl">
                                {item.title}
                            </h3>
                        </button>
                    ))}
                </div>

                <button
                    className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 md:flex"
                    type="button"
                    aria-label={t("home.slider.next")}
                    onClick={handleNext}
                    disabled={activeSlide >= maxSlide}
                >
                    <ChevronRight size={18} />
                </button>
            </section>

            <hr className="my-8 border-slate-200 dark:border-slate-700" />

            <section>
                <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">{t("home.recent.title")}</h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {recentPractices.map((item: UserPractice) => {
                        const total = item.paragraph?.sentences?.length ?? 0;
                        const completed = item.sentenceAnswers?.length ?? 0;
                        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                        const isDone = completed >= total && total > 0;
                        const title =
                            item.paragraph?.title || item.paragraph?.sentences?.[0]?.content || t("home.common.untitled");

                        return (
                            <article key={item.id} className="space-y-4 rounded-xl">
                                <div>
                                    <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-slate-900 dark:text-slate-100 md:text-2xl">
                                        {title}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 md:text-base">
                                        {item.paragraph?.type ? t(`practice.type.${item.paragraph.type}`) : ""}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                        <div
                                            className="h-full rounded-full bg-[#4f7dff] transition-all"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-300 md:text-base">
                                        {t("home.recent.progress", { completed, total })}
                                    </span>
                                </div>

                                <Link
                                    to={isDone ? `/practice/${item.id}/result` : `/practice/${item.id}`}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 md:text-base"
                                >
                                    <PauseCircle size={18} className="text-[#4f7dff]" />
                                    {isDone ? t("home.recent.viewResult") : t("home.recent.continue")}
                                </Link>
                            </article>
                        );
                    })}

                    {recentPractices.length === 0 && (
                        <article className="rounded-xl border border-dashed border-slate-300 p-6 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            {t("home.recent.empty")}
                            <button
                                type="button"
                                onClick={() => navigate("/paragraphs")}
                                className="ml-2 text-[#198de6] underline"
                            >
                                {t("home.recent.startPractice")}
                            </button>
                        </article>
                    )}
                </div>
            </section>

            <section className="mt-10 space-y-10">
                {paragraphSections.map((section) => (
                    <div key={section.key}>
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">{section.title}</h2>
                            <button
                                type="button"
                                onClick={() => navigate(`/paragraphs?type=${section.key}`)}
                                className="text-sm font-semibold text-[#198de6] hover:underline"
                            >
                                {t("home.sections.viewMore")}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                            {(isMobile ? section.items.slice(0, 2) : section.items).map((item) => {
                                const params = new URLSearchParams();
                                if (item.type) params.set("type", item.type);
                                if (item.topic) params.set("topic", item.topic);
                                const link = `/paragraphs?${params.toString()}`;
                                const title = item.title || item.sentences?.[0] || t("home.common.untitled");
                                const preview = item.sentences?.slice(0, 2).join(" ") || "";
                                const cover = getCoverImage(item.topic, item.type, String(item.id));

                                return (
                                    <article
                                        key={item.id}
                                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/90"
                                    >
                                        <img src={cover} alt={title} className="h-32 w-full object-cover" />
                                        <div className="space-y-3 p-4">
                                            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                                    {t("home.common.sentenceCount", { count: item.sentences?.length ?? 0 })}
                                                </span>
                                                <span className="line-clamp-1">{t(`common.topic.${item.topic}`)}</span>
                                            </div>
                                            <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100">
                                                {title}
                                            </h3>
                                            <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{preview}</p>
                                            <Link
                                                to={link}
                                                className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                            >
                                                {t("home.sections.similarFilter")}
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}

                            {section.items.length === 0 && (
                                <article className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-2 xl:col-span-4">
                                    {t("home.sections.empty")}
                                </article>
                            )}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default Home;