import type { CommunityScoreBand, VocabularyHint } from "@/entities/paragraphSentence/schema";
import { Bookmark, Loader2, Sparkles, Users, Volume2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useCommunityTranslations } from "../../hooks/useUserPractice";
import { useTranslation } from "react-i18next";
import type { TargetLanguage } from "@/shared/constants/target-language";
import { message } from "antd";
import { useMyDecksQuery } from "@/features/deck/query";
import {
    useCreateDeckMutation,
    useSaveVocabularyToDeckMutation,
} from "@/features/deck/mutation";
import { showApiError } from "@/shared/api/showApiError";
import { DeckPickerModal, type DeckOption } from "@/features/deck/ui/DeckPickerModal";
import {
    COMMUNITY_SCORE_BANDS,
    SPEECH_LANG_BY_TARGET,
    VOCABULARY_ALREADY_IN_DECK_CODE,
} from "../../constants";
import type { HintsTab, PendingVocabulary } from "../../schema";
import { aiScoreCircleClass, getVocabularyTypeColor } from "../../utilities";

const VocabularyItem = ({
    word,
    type,
    pronunciation,
    onSpeak,
    isSpeaking,
    isSaved,
    savedDeckName,
    onToggleSave,
}: {
    word: string,
    type: string,
    pronunciation: string,
    onSpeak: (word: string) => void,
    isSpeaking: boolean,
    isSaved: boolean,
    savedDeckName?: string,
    onToggleSave: (payload: PendingVocabulary) => void,
}) => {
    const typeClasses = useMemo(() => getVocabularyTypeColor(type), [type]);

    return (
        <li className="bg-white dark:bg-slate-900/90 sm:p-3 py-2">
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                    <span className="relative pl-1 text-slate-800 dark:text-slate-100 text-[12px] font-semibold truncate">
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
                        onClick={() => onToggleSave({ text: word, partOfSpeech: type, pronunciation })}
                        aria-label={isSaved ? `Unsave ${word}` : `Save ${word}`}
                        title={isSaved ? (savedDeckName ? `Saved in ${savedDeckName}` : "Saved") : "Save vocabulary"}
                    >
                        <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 italic truncate">{pronunciation}</div>
            </div>
        </li>
    );
};

export const VocabularyHintsAside = ({
    vocabularyHints,
    sentenceId,
    targetLanguage,
    isStreamingVocabularyHints = false,
}: {
    vocabularyHints: VocabularyHint[] | null;
    sentenceId: number;
    targetLanguage: TargetLanguage;
    isStreamingVocabularyHints?: boolean;
}) => {
    const { t } = useTranslation();
    const [hintsTab, setHintsTab] = useState<HintsTab>("vocabulary");
    const [communityScoreBand, setCommunityScoreBand] = useState<CommunityScoreBand>("LE7");
    const [speakingWord, setSpeakingWord] = useState<string | null>(null);
    const [savedVocabulary, setSavedVocabulary] = useState<Set<string>>(new Set());
    const [savedDeckByVocabulary, setSavedDeckByVocabulary] = useState<Record<string, string>>({});
    const [decks, setDecks] = useState<DeckOption[]>([]);
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
    const [pendingVocabulary, setPendingVocabulary] = useState<PendingVocabulary | null>(null);
    const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
    const [newDeckName, setNewDeckName] = useState("");
    const [visibleVocabularyCount, setVisibleVocabularyCount] = useState(0);
    const [visibleVocabularyRowCount, setVisibleVocabularyRowCount] = useState(0);
    const [visibleCommunityCount, setVisibleCommunityCount] = useState(0);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const {
        data: communityList = [],
        isLoading: isLoadingCommunity,
        isError: isCommunityError,
    } = useCommunityTranslations(sentenceId, hintsTab === "community", communityScoreBand, targetLanguage);
    const {
        data: deckItems = [],
        isFetching: isFetchingDecks,
        isError: isDeckQueryError,
        error: deckQueryError,
    } = useMyDecksQuery(targetLanguage, isDeckModalOpen);
    const createDeckMutation = useCreateDeckMutation(targetLanguage);
    const saveVocabularyToDeckMutation = useSaveVocabularyToDeckMutation();

    useEffect(() => {
        setHintsTab("vocabulary");
        setCommunityScoreBand("LE7");
        setVisibleVocabularyCount(0);
        setVisibleVocabularyRowCount(0);
        setVisibleCommunityCount(0);
        setSavedVocabulary(new Set());
        setSavedDeckByVocabulary({});
        setIsDeckModalOpen(false);
        setPendingVocabulary(null);
        setSelectedDeckId(null);
        setNewDeckName("");
    }, [sentenceId]);

    useEffect(() => {
        if (!isDeckModalOpen) return;
        const options = deckItems.map((deck) => ({ id: deck.id, name: deck.name, icon: deck.icon }));
        setDecks(options);
        setSelectedDeckId((current) => {
            if (current && options.some((deck) => deck.id === current)) return current;
            return options[0]?.id ?? null;
        });
    }, [deckItems, isDeckModalOpen]);

    useEffect(() => {
        if (!isDeckModalOpen || !isDeckQueryError) return;
        showApiError(deckQueryError, "Không tải được danh sách deck");
    }, [deckQueryError, isDeckModalOpen, isDeckQueryError]);

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
            const totalRows = (vocabularyHints ?? []).reduce((sum, hint) => sum + hint.translations.length, 0);
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

        setVisibleVocabularyRowCount((vocabularyHints ?? []).reduce((sum, hint) => sum + hint.translations.length, 0));
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
        utterance.lang = SPEECH_LANG_BY_TARGET[targetLanguage] ?? "en-US";

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
    }, [speakingWord, targetLanguage]);

    const createDeckFromInput = useCallback(async (icon: string) => {
        const trimmed = newDeckName.trim();
        if (!trimmed) {
            message.warning("Nhập tên bộ từ vựng trước khi tạo");
            return null;
        }

        const duplicated = decks.some((deck) => deck.name.trim().toLowerCase() === trimmed.toLowerCase());
        if (duplicated) {
            message.warning("Bộ từ vựng đã tồn tại");
            return null;
        }

        try {
            const created = await createDeckMutation.mutateAsync({ name: trimmed, icon, targetLanguage });
            const nextDeck: DeckOption = { id: created.id, name: created.name, icon: created.icon };
            setDecks((prev) => [...prev, nextDeck]);
            setSelectedDeckId(nextDeck.id);
            setNewDeckName("");
            message.success(`Đã tạo bộ từ vựng "${nextDeck.name}"`);
            return nextDeck;
        } catch (error) {
            showApiError(error, "Không tạo được bộ từ vựng");
            return null;
        }
    }, [createDeckMutation, decks, newDeckName, targetLanguage]);

    const handleConfirmSaveToDeck = useCallback(async () => {
        if (!pendingVocabulary) return;

        let chosenDeckId = selectedDeckId;
        if (!chosenDeckId && newDeckName.trim()) {
            const created = await createDeckFromInput("book-open");
            chosenDeckId = created?.id ?? null;
        }

        if (!chosenDeckId) {
            message.warning("Chọn bộ từ vựng hoặc tạo bộ mới để lưu từ");
            return;
        }

        const normalizedWord = pendingVocabulary.text.trim().toLowerCase();
        const deckName = decks.find((deck) => deck.id === chosenDeckId)?.name ?? "Bộ từ vựng";
        try {
            await saveVocabularyToDeckMutation.mutateAsync({
                deckId: chosenDeckId,
                payload: {
                    text: pendingVocabulary.text,
                    partOfSpeech: pendingVocabulary.partOfSpeech,
                    pronunciation: pendingVocabulary.pronunciation,
                    meaning: pendingVocabulary.meaning,
                    targetLanguage,
                },
            });
            setSavedVocabulary((prev) => {
                const next = new Set(prev);
                next.add(normalizedWord);
                return next;
            });
            setSavedDeckByVocabulary((prev) => ({ ...prev, [normalizedWord]: String(chosenDeckId) }));
            message.success(`Đã lưu "${pendingVocabulary.text}" vào bộ từ vựng "${deckName}"`);
            setIsDeckModalOpen(false);
            setPendingVocabulary(null);
            setSelectedDeckId(null);
        } catch (error) {
            const apiCode = (error as { response?: { data?: { code?: number } } })?.response?.data?.code;
            if (apiCode === VOCABULARY_ALREADY_IN_DECK_CODE) {
                message.warning("Từ vựng này đã có trong bộ từ vựng đã chọn");
            } else {
                showApiError(error, "Không lưu được từ vựng");
            }
        }
    }, [createDeckFromInput, decks, newDeckName, pendingVocabulary, saveVocabularyToDeckMutation, selectedDeckId, targetLanguage]);

    const handleToggleSaveVocabulary = useCallback((payload: PendingVocabulary) => {
        const normalized = payload.text.trim().toLowerCase();
        if (savedVocabulary.has(normalized)) {
            setSavedVocabulary((prev) => {
                const next = new Set(prev);
                next.delete(normalized);
                return next;
            });
            setSavedDeckByVocabulary((prev) => {
                if (!(normalized in prev)) return prev;
                const next = { ...prev };
                delete next[normalized];
                return next;
            });
            return;
        }

        setPendingVocabulary(payload);
        setSelectedDeckId((current) => current ?? decks[0]?.id ?? null);
        setNewDeckName("");
        setIsDeckModalOpen(true);
    }, [decks, savedVocabulary]);

    if (!vocabularyHints) return null;
    let streamedRowCursor = 0;
    return (
        <>
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
                                <div className="group pb-2 last:pb-0" key={`${hint.sourceText}-${index}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-[12px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{hint.sourceText.toLocaleLowerCase()}</h3>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 min-w-0" />
                                    </div>
                                    <motion.ul
                                        initial={isStreamingVocabularyHints ? false : { opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={isStreamingVocabularyHints ? undefined : { opacity: 0, y: -10 }}
                                        transition={isStreamingVocabularyHints ? { duration: 0 } : { duration: 0.1 }}
                                    >
                                        {(isStreamingVocabularyHints
                                            ? hint.translations.filter(() => {
                                                streamedRowCursor += 1;
                                                return streamedRowCursor <= visibleVocabularyRowCount;
                                            })
                                            : hint.translations
                                        ).map((word, idx) => (
                                            <VocabularyItem
                                                key={`${word.text}-${word.partsOfSpeech}-${idx}`}
                                                word={word.text}
                                                type={word.partsOfSpeech}
                                                pronunciation={word.pronunciation}
                                                onSpeak={handleSpeak}
                                                isSpeaking={speakingWord === word.text}
                                                isSaved={savedVocabulary.has(word.text.trim().toLowerCase())}
                                                savedDeckName={decks.find(
                                                    (deck) => String(deck.id) === savedDeckByVocabulary[word.text.trim().toLowerCase()],
                                                )?.name}
                                                onToggleSave={(payload) => handleToggleSaveVocabulary({
                                                    ...payload,
                                                    meaning: hint.sourceText,
                                                })}
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
            <DeckPickerModal
                open={isDeckModalOpen}
                pendingVocabularyText={pendingVocabulary?.text}
                decks={decks}
                selectedDeckId={selectedDeckId}
                newDeckName={newDeckName}
                isLoadingDecks={isFetchingDecks}
                isSavingVocabulary={saveVocabularyToDeckMutation.isPending}
                onClose={() => {
                    setIsDeckModalOpen(false);
                    setPendingVocabulary(null);
                    setSelectedDeckId(null);
                    setNewDeckName("");
                }}
                onConfirm={() => {
                    void handleConfirmSaveToDeck();
                }}
                onSelectDeck={setSelectedDeckId}
                onNewDeckNameChange={setNewDeckName}
                onCreateDeck={async (icon) => {
                    await createDeckFromInput(icon);
                }}
            />
        </>

    )
}