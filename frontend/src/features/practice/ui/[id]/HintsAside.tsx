import type { CommunityScoreBand, VocabularyHint } from "@/entities/paragraphSentence/schema";
import { Bookmark, BookmarkCheck, Loader2, Sparkles, Users, Volume2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useCommunityTranslations } from "../../hooks/useUserPractice";
import { useTranslation } from "react-i18next";

const COMMUNITY_SCORE_BANDS: { band: CommunityScoreBand; label: string }[] = [
    { band: "LE7", label: "6" },
    { band: "RANGE_7_8", label: "7" },
    { band: "GE8", label: "8" },
];

function aiScoreCircleClass(score: number): string {
    if (score >= 8) {
        return "bg-emerald-500 text-white shadow-[0_1px_2px_rgba(16,185,129,0.45)] ring-2 ring-emerald-200/90 dark:bg-emerald-600 dark:ring-emerald-900/50";
    }
    if (score >= 6.5) {
        return "bg-blue-500 text-white shadow-[0_1px_2px_rgba(59,130,246,0.45)] ring-2 ring-blue-200/90 dark:bg-blue-600 dark:ring-blue-900/50";
    }
    if (score >= 5) {
        return "bg-amber-500 text-white shadow-[0_1px_2px_rgba(245,158,11,0.45)] ring-2 ring-amber-200/90 dark:bg-amber-600 dark:ring-amber-900/50";
    }
    if (score >= 3.5) {
        return "bg-orange-500 text-white shadow-[0_1px_2px_rgba(249,115,22,0.45)] ring-2 ring-orange-200/90 dark:bg-orange-600 dark:ring-orange-900/50";
    }
    return "bg-red-500 text-white shadow-[0_1px_2px_rgba(239,68,68,0.45)] ring-2 ring-red-200/90 dark:bg-red-600 dark:ring-red-900/50";
}

const getColorByType = (type: string) => {
    switch (type) {
        case 'verb':
            return 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400';
        case 'noun':
            return 'bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400';
        case 'noun phrase':
            return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400';
        case 'noun clause':
            return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400';
        case 'adjective':
            return 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400';
        case 'adverb':
            return 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400';
        case 'determiner':
            return 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400';
        case 'relative pronoun':
            return 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400';
        case 'relative adverb':
            return 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400';
        case 'relative adjective':
            return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400';
        case 'relative adverb clause':
            return 'bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400';
        case 'preposition':
            return 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400';
        case 'conjunction':
            return 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400';
        case 'pronoun':
            return 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        default:
            return 'bg-gray-50 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400';
    }
};

const VocabularyItem = ({
    word,
    type,
    pronunciation,
    onSpeak,
    isSpeaking,
    isSaved,
    onToggleSave,
}: {
    word: string,
    type: string,
    pronunciation: string,
    onSpeak: (word: string) => void,
    isSpeaking: boolean,
    isSaved: boolean,
    onToggleSave: (word: string) => void,
}) => {
    const typeClasses = useMemo(() => getColorByType(type), [type]);

    return (
        <li className="bg-white dark:bg-slate-900/90 sm:p-3 py-2">
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">

                    <span className="relative pl-3 text-slate-800 dark:text-slate-100 text-[12px] font-semibold truncate before:content-['•'] before:absolute before:left-0 before:text-white">
                        {word.toLowerCase()}
                    </span>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wide ${typeClasses}`}>{type}</span>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                    <button
                        className="shrink-0 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-full p-1 transition-colors touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                        onClick={() => onSpeak(word)}
                        disabled={isSpeaking}
                        aria-label={`Speak ${word}`}
                    >
                        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                    </button>
                    <button
                        className={`shrink-0 rounded-full p-1 transition-colors touch-manipulation ${isSaved
                            ? "text-amber-600 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-950/30 dark:hover:bg-amber-900/40"
                            : "text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-950/30"
                            }`}
                        onClick={() => onToggleSave(word)}
                        aria-label={isSaved ? `Unsave ${word}` : `Save ${word}`}
                        title={isSaved ? "Saved" : "Save vocabulary"}
                    >
                        {isSaved ? (
                            <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 italic truncate">{pronunciation}</div>
            </div>
        </li>
    );
};

type HintsTab = "vocabulary" | "community";

export const VocabularyHintsAside = ({
    vocabularyHints,
    sentenceId,
    isStreamingVocabularyHints = false,
}: {
    vocabularyHints: VocabularyHint[] | null;
    sentenceId: number;
    isStreamingVocabularyHints?: boolean;
}) => {
    const { t } = useTranslation();
    const [hintsTab, setHintsTab] = useState<HintsTab>("vocabulary");
    const [communityScoreBand, setCommunityScoreBand] = useState<CommunityScoreBand>("LE7");
    const [speakingWord, setSpeakingWord] = useState<string | null>(null);
    const [savedVocabulary, setSavedVocabulary] = useState<Set<string>>(new Set());
    const [visibleVocabularyCount, setVisibleVocabularyCount] = useState(0);
    const [visibleVocabularyRowCount, setVisibleVocabularyRowCount] = useState(0);
    const [visibleCommunityCount, setVisibleCommunityCount] = useState(0);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const {
        data: communityList = [],
        isLoading: isLoadingCommunity,
        isError: isCommunityError,
    } = useCommunityTranslations(sentenceId, hintsTab === "community", communityScoreBand);

    useEffect(() => {
        setHintsTab("vocabulary");
        setCommunityScoreBand("LE7");
        setVisibleVocabularyCount(0);
        setVisibleVocabularyRowCount(0);
        setVisibleCommunityCount(0);
        setSavedVocabulary(new Set());
    }, [sentenceId]);

    useEffect(() => {
        return () => {
            if (typeof window !== "undefined") {
                window.speechSynthesis.cancel();
            }
            utteranceRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (hintsTab !== "vocabulary") return;

        const total = vocabularyHints?.length ?? 0;
        if (total === 0) {
            setVisibleVocabularyCount(0);
            setVisibleVocabularyRowCount(0);
            return;
        }

        if (isStreamingVocabularyHints) {
            setVisibleVocabularyCount(total);
            const totalRows = (vocabularyHints ?? []).reduce((sum, hint) => sum + hint.english.length, 0);
            if (totalRows === 0) {
                setVisibleVocabularyRowCount(0);
                return;
            }
            setVisibleVocabularyRowCount((prev) => {
                if (prev <= 0) return 1;
                return Math.min(prev, totalRows);
            });

            const timer = window.setInterval(() => {
                setVisibleVocabularyRowCount((prev) => {
                    if (prev >= totalRows) {
                        window.clearInterval(timer);
                        return totalRows;
                    }
                    return prev + 1;
                });
            }, 70);

            return () => window.clearInterval(timer);
        }

        setVisibleVocabularyRowCount((vocabularyHints ?? []).reduce((sum, hint) => sum + hint.english.length, 0));
        setVisibleVocabularyCount(1);
        if (total === 1) return;

        let current = 1;
        const timer = window.setInterval(() => {
            current += 1;
            setVisibleVocabularyCount(current);
            if (current >= total) {
                window.clearInterval(timer);
            }
        }, 70);

        return () => window.clearInterval(timer);
    }, [hintsTab, vocabularyHints, sentenceId, isStreamingVocabularyHints]);

    useEffect(() => {
        if (hintsTab !== "community") return;

        if (isLoadingCommunity) {
            setVisibleCommunityCount(0);
            return;
        }

        const total = communityList?.length ?? 0;
        if (total === 0) {
            setVisibleCommunityCount(0);
            return;
        }

        setVisibleCommunityCount(1);
        if (total === 1) return;

        let current = 1;
        const timer = window.setInterval(() => {
            current += 1;
            setVisibleCommunityCount(current);
            if (current >= total) {
                window.clearInterval(timer);
            }
        }, 90);

        return () => window.clearInterval(timer);
    }, [hintsTab, communityList, isLoadingCommunity, communityScoreBand]);

    const handleSpeak = useCallback((word: string) => {
        if (typeof window === "undefined") return;

        const synth = window.speechSynthesis;
        if (speakingWord === word && (synth.speaking || synth.pending)) {
            return;
        }

        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";

        utterance.onstart = () => setSpeakingWord(word);
        utterance.onend = () => {
            if (utteranceRef.current === utterance) {
                utteranceRef.current = null;
                setSpeakingWord((current) => (current === word ? null : current));
            }
        };
        utterance.onerror = () => {
            if (utteranceRef.current === utterance) {
                utteranceRef.current = null;
                setSpeakingWord((current) => (current === word ? null : current));
            }
        };

        utteranceRef.current = utterance;
        setSpeakingWord(word);
        synth.speak(utterance);
    }, [speakingWord]);

    const handleToggleSaveVocabulary = useCallback((word: string) => {
        const normalized = word.trim().toLowerCase();
        setSavedVocabulary((prev) => {
            const next = new Set(prev);
            if (next.has(normalized)) {
                next.delete(normalized);
            } else {
                next.add(normalized);
            }
            return next;
        });
    }, []);

    if (!vocabularyHints) return null;
    let streamedRowCursor = 0;
    return (
        <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-900/90">
            <div className="shrink-0 overflow-hidden rounded-t-[0.65rem] bg-white dark:bg-slate-900" role="tablist" aria-label={t("practice.hints.hintTypesAria")}>
                <div className="flex min-h-[2.75rem]">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={hintsTab === "vocabulary"}
                        id="hints-tab-vocabulary"
                        className={`
                flex flex-1 items-center justify-center gap-2 px-2 py-2.5 text-center text-sm font-medium transition-colors
                border-r border-slate-200 dark:border-slate-600
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400/50
                ${hintsTab === "vocabulary"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/45 dark:text-blue-400 border-b-[3px] border-b-blue-600"
                                : "border-b border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 hover:bg-slate-50/90 dark:hover:bg-slate-800/80"
                            }
              `}
                        onClick={() => setHintsTab("vocabulary")}
                    >
                        <Sparkles className="size-3.5 shrink-0 opacity-90" aria-hidden />
                        <span className="truncate">{t("practice.hints.vocabulary")}</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={hintsTab === "community"}
                        id="hints-tab-community"
                        className={`
                flex flex-1 items-center justify-center gap-2 px-2 py-2.5 text-center text-sm font-medium transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400/50
                ${hintsTab === "community"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/45 dark:text-blue-400 border-b-[3px] border-b-blue-600"
                                : "border-b border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 hover:bg-slate-50/90 dark:hover:bg-slate-800/80"
                            }
              `}
                        onClick={() => setHintsTab("community")}
                    >
                        <Users className="size-3.5 shrink-0 opacity-90" aria-hidden />
                        <span className="truncate">{t("practice.hints.community")}</span>
                    </button>
                </div>
            </div>

            <div
                className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:p-4"
                role="tabpanel"
                aria-labelledby={hintsTab === "vocabulary" ? "hints-tab-vocabulary" : "hints-tab-community"}
            >
                {hintsTab === "vocabulary" && (
                    <div className="space-y-2">
                        {isStreamingVocabularyHints && (vocabularyHints?.length ?? 0) === 0 && (
                            <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-200/90 px-2 py-2 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                            </div>
                        )}
                        {vocabularyHints.slice(0, visibleVocabularyCount).map((hint, index) => (
                            <div className="group pb-2 last:pb-0" key={`${hint.vietnamese}-${index}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-[12px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{hint.vietnamese.toLocaleLowerCase()}</h3>
                                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 min-w-0" />
                                </div>
                                <motion.ul
                                    initial={isStreamingVocabularyHints ? false : { opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={isStreamingVocabularyHints ? undefined : { opacity: 0, y: -10 }}
                                    transition={isStreamingVocabularyHints ? { duration: 0 } : { duration: 0.1 }}
                                >
                                    {(isStreamingVocabularyHints
                                        ? hint.english.filter(() => {
                                            streamedRowCursor += 1;
                                            return streamedRowCursor <= visibleVocabularyRowCount;
                                        })
                                        : hint.english
                                    ).map((word, idx) => (
                                        <VocabularyItem
                                            key={`${word.english}-${word.partsOfSpeech}-${idx}`}
                                            word={word.english}
                                            type={word.partsOfSpeech}
                                            pronunciation={word.ipaPronunciation}
                                            onSpeak={handleSpeak}
                                            isSpeaking={speakingWord === word.english}
                                            isSaved={savedVocabulary.has(word.english.trim().toLowerCase())}
                                            onToggleSave={handleToggleSaveVocabulary}
                                        />
                                    ))}
                                </motion.ul>
                            </div>
                        ))}
                    </div>
                )}

                {hintsTab === "community" && (
                    <div>
                        <div
                            className="mb-3 flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-slate-100/95 p-1 dark:bg-slate-800/90"
                            role="tablist"
                            aria-label={t("practice.hints.filterByAiScore")}
                        >
                            {COMMUNITY_SCORE_BANDS.map(({ band, label }) => {
                                const active = communityScoreBand === band;
                                return (
                                    <button
                                        key={band}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setCommunityScoreBand(band)}
                                        className={`
                      min-h-[2.25rem] flex-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-center text-[11px] font-semibold transition-all sm:px-3 sm:text-xs
                      ${active
                                                ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-2 ring-offset-slate-100 dark:bg-blue-600 dark:ring-blue-500 dark:ring-offset-slate-900"
                                                : "text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-700/60"
                                            }
                    `}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-3">
                            {isLoadingCommunity && (
                                <Loader2 className="size-3.5 animate-spin text-slate-400 shrink-0" aria-hidden />
                            )}
                        </div>
                        {isCommunityError && (
                            <p className="text-xs text-amber-700 dark:text-amber-400/90 mb-2">
                                {t("practice.hints.communityLoadError")}
                            </p>
                        )}
                        {!isLoadingCommunity && !isCommunityError && (communityList?.length ?? 0) === 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {t("practice.hints.communityEmpty")}
                            </p>
                        )}
                        {!isCommunityError && communityList && communityList.length > 0 && (
                            <ul className="space-y-2">
                                {communityList.slice(0, visibleCommunityCount).map((item, i) => (
                                    <li
                                        key={`${i}-${item.translation.slice(0, 24)}`}
                                        className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/85 dark:bg-slate-800/50 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words"
                                    >
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-full">
                                                {item.translatorName?.trim() || t("practice.hints.learner")}
                                            </span>
                                            {typeof item.score === "number" && (
                                                <span
                                                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold tabular-nums leading-none ${aiScoreCircleClass(item.score)}`}
                                                    title={t("practice.hints.aiScoreTooltip", { score: item.score.toFixed(1) })}
                                                >
                                                    {item.score.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                        {item.translation.replace(/\\n/g, "\n\n")}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {!isCommunityError && (communityList?.length ?? 0) > 0 && visibleCommunityCount < (communityList?.length ?? 0) && (
                            <div className="mt-2 flex items-center justify-center rounded-lg border border-dashed border-slate-200/90 px-2 py-2 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

    )
}