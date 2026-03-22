import type { VocabularyHint } from "@/entities/paragraphSentence/schema";
import { Sparkles, Volume2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from 'motion/react';

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
    isSpeaking
}: {
    word: string,
    type: string,
    pronunciation: string,
    onSpeak: (word: string) => void,
    isSpeaking: boolean
}) => {
    const typeClasses = useMemo(() => getColorByType(type), [type]);

    return (

        <div className="bg-white dark:bg-slate-900/90 rounded-lg p-2 sm:p-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer">
            <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-slate-800 dark:text-slate-100 text-[12px] font-semibold min-w-0 truncate">{word.toLocaleLowerCase()}</span>
                <button
                    className="shrink-0 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-full p-1 transition-colors touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                    onClick={() => onSpeak(word)}
                    disabled={isSpeaking}
                    aria-label={`Speak ${word}`}
                >
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                </button>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 italic truncate">{pronunciation}</div>
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${typeClasses}`}>{type}</span>
            </div>
        </div>

    );
};


export const VocabularyHintsAside = ({ vocabularyHints }: { vocabularyHints: VocabularyHint[] | null }) => {
    const [speakingWord, setSpeakingWord] = useState<string | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        return () => {
            if (typeof window !== "undefined") {
                window.speechSynthesis.cancel();
            }
            utteranceRef.current = null;
        };
    }, []);

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

    if (!vocabularyHints) return null;
    return (
        <>
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <span className="text-[15px] font-bold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                    <Sparkles className="size-3.5" />
                    Gợi ý
                </span>
            </div>
            <div className="flex-1 overflow-y-scroll sm:p-4 bg-white dark:bg-slate-900/90">
                {vocabularyHints.map((hint, index) => (
                    <div className="group pb-6" key={index}>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-[12px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{hint.vietnamese.toLocaleLowerCase()}</h3>
                            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 min-w-0" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.1 }}
                        >
                            <div className="space-y-1.5">
                                {hint.english.map((word, idx) => (
                                    <VocabularyItem
                                        key={idx}
                                        word={word.english}
                                        type={word.partsOfSpeech}
                                        pronunciation={word.ipaPronunciation}
                                        onSpeak={handleSpeak}
                                        isSpeaking={speakingWord === word.english}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>
        </>

    )
}