import type { HintContent } from "@/entities/hints/schema";
import { Lightbulb, Volume2 } from "lucide-react";
import { useMemo } from "react";

const getColorByType = (type: string) => {
    switch (type) {
        case 'verb':
            return 'bg-blue-50 text-blue-600';
        case 'noun':
            return 'bg-green-50 text-green-600';
        case 'noun phrase':
            return 'bg-indigo-50 text-indigo-600';
        case 'noun clause':
            return 'bg-emerald-50 text-emerald-600';
        case 'adjective':
            return 'bg-amber-50 text-amber-600';
        case 'adverb':
            return 'bg-red-50 text-red-600';
        case 'determiner':
            return 'bg-purple-50 text-purple-600';
        case 'relative pronoun':
            return 'bg-violet-50 text-violet-600';
        case 'relative adverb':
            return 'bg-rose-50 text-rose-600';
        case 'relative adjective':
            return 'bg-yellow-50 text-yellow-600';
        case 'relative adverb clause':
            return 'bg-pink-50 text-pink-600';
        case 'preposition':
            return 'bg-teal-50 text-teal-600';
        case 'conjunction':
            return 'bg-sky-50 text-sky-600';
        case 'pronoun':
            return 'bg-slate-50 text-slate-600';
        default:
            return 'bg-gray-50 text-gray-600';
    }
};

const VocabularyItem = ({ word, type, pronunciation }: { word: string, type: string, pronunciation: string }) => {
    const typeClasses = useMemo(() => getColorByType(type), [type]);

    return (
        <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-slate-200 shadow-sm hover:border-blue-200 transition-colors cursor-pointer">
            <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-slate-800 text-sm font-semibold min-w-0 truncate">{word.toLocaleLowerCase()}</span>
                <button className="shrink-0 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-full p-1 transition-colors touch-manipulation" onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(
                        word
                    );
                    utterance.lang = "en-US";
                    window.speechSynthesis.speak(utterance);
                }}>
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                </button>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="text-[8px] sm:text-xs text-slate-500 italic truncate">{pronunciation}</div>
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${typeClasses}`}>{type}</span>
            </div>
        </div>
    );
};


export const HintsAside = (translationHints: HintContent | null) => {
    if (!translationHints) return null;
    return (
        <>
            <div>
                <h3 className="text-base sm:text-md font-bold text-slate-900 truncate px-4 py-3 flex items-center gap-2">
                    <Lightbulb className="size-4 text-slate-500" />Vocabulary Hints</h3>
                <div className="h-px bg-slate-200 flex-1 min-w-0" />
            </div>
            <div className="flex-1 overflow-y-auto sm:p-4 custom-scrollbar bg-white mb-2">
                {translationHints.vocabularyHints.map((hint, index) => (
                    <div className="group pb-6" key={index}>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base sm:text-md text-slate-500 truncate">{hint.vietnamese.toLocaleLowerCase()}</h3>
                            <div className="h-px bg-slate-200 flex-1 min-w-0" />
                        </div>
                        <div className="space-y-2 sm:space-y-2">
                            {hint.english.map((word, idx) => (
                                <VocabularyItem key={idx} word={word.english} type={word.partsOfSpeech} pronunciation={word.ipaPronunciation} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>

    )
}