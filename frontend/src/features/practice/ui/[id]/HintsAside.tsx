import type { HintContent } from "@/entities/hints/schema";
import { Volume2 } from "lucide-react";
import { useCallback } from "react";

const getColorByType = (type: string) => {
    switch (type) {
        case 'verb':
            return 'bg-blue-50 text-blue-600';
        case 'noun':
            return 'bg-green-50 text-green-600';
        case 'noun phrase':
            return 'bg-blue-50 text-blue-600';
        case 'noun clause':
            return 'bg-green-50 text-green-600';
        case 'adjective':
            return 'bg-yellow-50 text-yellow-600';
        case 'adverb':
            return 'bg-red-50 text-red-600';
        case 'determiner':
            return 'bg-purple-50 text-purple-600';
        case 'relative pronoun':
            return 'bg-purple-50 text-purple-600';
        case 'relative adverb':
            return 'bg-red-50 text-red-600';
        case 'relative adjective':
            return 'bg-yellow-50 text-yellow-600';
        case 'relative adverb clause':
            return 'bg-red-50 text-red-600';
        case 'preposition':
            return 'bg-yellow-50 text-yellow-600';
        case 'conjunction':
            return 'bg-purple-50 text-purple-600';
        case 'pronoun':
            return 'bg-gray-50 text-gray-600';
        default:
            return 'bg-gray-50 text-gray-600';
    }
};

const VocabularyItem = ({ word, type, pronunciation }: { word: string, type: string, pronunciation: string }) => {
    const typeClasses = useCallback(() => getColorByType(type), [type]);

    return (
        <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:border-blue-200 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 text-[15px]">{word}</span>
                <button className="text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-full p-1 transition-colors" onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(
                        word
                    );
                    utterance.lang = "en-US";
                    window.speechSynthesis.speak(utterance);
                }}>
                    <Volume2 size={16} className="text-slate-500" />
                </button>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500 italic font-serif">{pronunciation}</div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${typeClasses}`}>{type}</span>
            </div>

        </div>
    );
};


export const HintsAside = (translationHints: HintContent | null) => {
    if (!translationHints) return null;

    return (
        <>
            <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar bg-white">
                <div className="flex-1 overflow-y-auto p-2 space-y-6 custom-scrollbar bg-white">
                    {translationHints.vocabularyHints.map((hint, index) => (
                        <div className="group" key={index}>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-slate-900">{hint.vietnamese}</h3>
                                <div className="h-px bg-slate-200 flex-1 ml-2"></div>
                            </div>
                            <div className="space-y-3">
                                {hint.english.map((word, index) => (
                                    <VocabularyItem key={index} word={word.english} type={word.partsOfSpeech} pronunciation={word.ipaPronunciation} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-auto bg-slate-50/80 border-t border-slate-200 backdrop-blur-sm">
                <div className="p-6">
                    <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">Cấu trúc câu</span>
                    </h5>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Loại câu</span>
                            <span className="font-semibold text-slate-900">{translationHints?.structureHints.kindsOfSentencesAccordingToStructure.english}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Thì</span>
                            <span className="font-semibold text-slate-900">{translationHints?.structureHints.tenses.english}</span>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                            <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">Target Form</p>
                            <div className="font-mono text-xs text-slate-700 font-medium tracking-wide">
                                {translationHints?.structureHints.tenses.form}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}