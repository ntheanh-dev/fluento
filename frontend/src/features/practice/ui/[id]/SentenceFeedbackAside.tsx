import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";
import {
    Sparkles,
    ArrowRight,
    History,
    Brain,
    CheckCircle2,
    Info,
    Copy,
} from "lucide-react";
export const SentenceFeedbackAside = (sentenceFeedback: SentenceFeedback) => {

    const renderScore = (score: number) => {
        const percentage = score * 10; // vì score 0–10

        if (score >= 9) {
            return (
                <div className="flex flex-col items-center justify-center relative">
                    <div className="relative size-28">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                className="text-green-500 drop-shadow-md"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray={`${percentage}, 100`}
                                strokeLinecap="round"
                                strokeWidth="3"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-slate-900">
                                {score}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                                Điểm
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <span>Xuất sắc</span>
                    </div>
                </div>
            );
        } else if (score >= 8) {
            return (
                <div className="flex flex-col items-center justify-center relative">
                    <div className="relative size-28">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                className="text-blue-500 drop-shadow-md"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray={`${percentage}, 100`}
                                strokeLinecap="round"
                                strokeWidth="3"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-slate-900">
                                {score}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                                Điểm
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        <span>Tốt</span>
                    </div>
                </div>
            );
        } else {
            const percentage = score * 10;

            return (
                <div className="flex flex-col items-center justify-center relative">
                    <div className="relative size-28">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                className="text-yellow-500 drop-shadow-md"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray={`${percentage}, 100`}
                                strokeLinecap="round"
                                strokeWidth="3"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-slate-900">
                                {score}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                                Điểm
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
                        <span>Cần cải thiện</span>
                    </div>
                </div>
            );
        }
    };

    return (
        <>
            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="p-6 space-y-6">
                    {/* Score */}
                    {renderScore(sentenceFeedback.score)}

                    {/* Spelling Errors */}
                    <div className="space-y-3">
                        {sentenceFeedback.corrections.spellingMistakes.length > 0 && (
                            <>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Lỗi chính tả
                                    </h3>
                                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                        {sentenceFeedback.corrections.spellingMistakes.length}
                                    </span>
                                </div>
                                <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
                                    {sentenceFeedback.corrections.spellingMistakes.map((spellingMistake) => (
                                        <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                                            <div className="flex flex-col">
                                                <span className="text-red-500 line-through decoration-red-300 text-sm font-medium">
                                                    {spellingMistake.word}
                                                </span>
                                                <span className="text-[10px] text-slate-400 mt-0.5">
                                                    Misspelled
                                                </span>
                                            </div>
                                            <ArrowRight className="text-slate-300 size-4 mt-1" />
                                            <div className="flex flex-col text-right">
                                                <span className="text-green-600 text-sm font-bold">
                                                    {spellingMistake.suggestion}
                                                </span>
                                                <span className="text-[10px] text-slate-400 mt-0.5">
                                                    Suggestion
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Vocabulary Issues Errors */}
                    <div className="space-y-3">
                        {sentenceFeedback.corrections.vocabularyIssues.length > 0 && (
                            <>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Lỗi từ vựng
                                    </h3>
                                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                        {sentenceFeedback.corrections.vocabularyIssues.length}
                                    </span>
                                </div>
                                <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
                                    {sentenceFeedback.corrections.vocabularyIssues.map((vocabularyIssue) => (
                                        <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                                            <div className="flex flex-col">
                                                <span className="text-red-500 line-through decoration-red-300 text-sm font-medium">
                                                    {vocabularyIssue.word}
                                                </span>
                                            </div>
                                            <ArrowRight className="text-slate-300 size-4 mt-1" />
                                            <div className="flex flex-col text-right">
                                                {vocabularyIssue.suggestion.map((suggestion) => (
                                                    <span className="text-green-600 text-sm font-bold">
                                                        {suggestion}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>


                    {/* Grammar Errors */}
                    {sentenceFeedback.corrections.grammarErrors.length > 0 && (
                        <>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Lỗi ngữ pháp
                                </h3>
                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    {sentenceFeedback.corrections.grammarErrors.length}
                                </span>
                            </div>
                            <div className="space-y-2">

                                {sentenceFeedback.corrections.grammarErrors.map((grammarError) => {

                                    const [originalText, correctedText] = grammarError.suggestion.split(" → ");

                                    return (
                                        <div className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm group hover:border-orange-200 transition-colors">
                                            <div className="flex items-center gap-2 mb-2">
                                                <History className="text-orange-500 size-4" />
                                                <span className="text-xs font-bold text-slate-700">
                                                    {grammarError.issue}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center text-sm leading-relaxed">
                                                <span className="text-slate-500 line-through mr-2">
                                                    {originalText}
                                                </span>
                                                <ArrowRight className="text-slate-300 size-3 mr-2" />
                                                <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                                    {correctedText}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}


                    {/* Sentence Structure */}
                    {sentenceFeedback.corrections.sentenceStructure.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Cấu trúc câu
                                </h3>
                                <div className="h-px bg-slate-100 flex-1 ml-2"></div>
                            </div>
                            <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4">
                                <div className="flex gap-3">
                                    <div className="shrink-0 mt-0.5">
                                        <Brain className="text-blue-500 size-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800 mb-1">
                                            Naturalness & Flow
                                        </h4>
                                        {sentenceFeedback.corrections.sentenceStructure.map((sentenceStructure) => (
                                            <p className="text-xs text-slate-600 leading-relaxed mb-2">
                                                {sentenceStructure.problem}
                                                <ArrowRight className="text-slate-300 size-3 inline-block" />
                                                {sentenceStructure.suggestion}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Comments */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">Nhận xét</h3>
                            <div className="h-px bg-slate-100 flex-1 ml-2"></div>
                        </div>
                        <div className="text-sm text-slate-600 space-y-2">
                            {sentenceFeedback.feedback.weaknesses.map((weakness) => (
                                <div className="flex gap-2">
                                    {sentenceFeedback.score >= 9 ? (
                                        <CheckCircle2 className="text-green-500 size-4 mt-0.5 shrink-0" />
                                    ) : (
                                        <Info className="text-orange-500 size-4 mt-0.5 shrink-0" />
                                    )}
                                    <span className="leading-snug">
                                        {weakness}
                                    </span>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>
            </div>

            {/* Suggested Translation */}
            <div className="mt-auto bg-slate-50/80 border-t border-slate-200 backdrop-blur-sm p-4 shrink-0">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="text-[10px] font-bold text-green-700 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="size-3.5" />
                            Bản dịch gợi ý
                        </h5>
                        <button
                            className="text-green-600 hover:text-green-700 transition-colors"
                            title="Copy"
                        >
                            <Copy className="size-3.5" onClick={() => navigator.clipboard.writeText(sentenceFeedback.improvedTranslation)} />
                        </button>
                    </div>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed italic">
                        {sentenceFeedback.improvedTranslation}
                    </p>
                </div>
            </div>
        </>
    );
};

