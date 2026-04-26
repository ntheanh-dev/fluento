import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    User,
    BookOpen,
    Sparkles,
    ArrowRight,
    ChevronLeft
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserPracticeData } from '../../hooks/useUserPractice';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { renderWordDiff } from '../../utilities';
import { useTranslation } from 'react-i18next';

export default function ReviewScreen() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, error: errorUserPracticeData, isLoading: isLoadingUserPracticeData } = useUserPracticeData(Number(id));

    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(1);

    if (isLoadingUserPracticeData) {
        return <Spin indicator={<LoadingOutlined spin />} />;
    }

    if (errorUserPracticeData) {
        navigate(`/practice/${id}/result`);
    }

    return (
        <div className="max-w-screen-2xl mx-auto h-[calc(100vh-130px+4rem)] -mt-4 sm:-mt-6 md:-mt-8 -mb-4 sm:-mb-6 md:-mb-8 flex flex-col overflow-hidden dark:text-slate-100">
            <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40 p-6 md:p-10">
                    <div className="max-w-3xl mx-auto space-y-8 pb-20">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedSentenceIndex}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.1 }}
                                className="space-y-8"
                            >
                                {/* Title Section */}
                                <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-700 pb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("practice.detail.title")}</h2>
                                        <div className="flex items-center gap-2 mt-1.5 text-slate-500 dark:text-slate-400 font-medium text-xs">
                                            <span>{t("practice.detail.sentenceMeta", { n: selectedSentenceIndex + 1, total: data?.sentenceAnswers.length ?? 0 })}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>{t("practice.detail.translationLabel")}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-slate-500 font-medium text-xs">{t("practice.result.scoreLabel", { score: data?.sentenceAnswers[selectedSentenceIndex].score ?? 0 })}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-1.5 sm:gap-4">

                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("practice.result.topic")}</span>
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{data?.paragraph.topic.toLowerCase()}</span>
                                        </div>
                                        <div className="h-8 w-px bg-slate-100 dark:bg-slate-700"></div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("practice.result.tone")}</span>
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{data?.paragraph.tone.toLowerCase()}</span>
                                        </div>
                                        <div className="h-8 w-px bg-slate-100 dark:bg-slate-700"></div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("practice.result.level")}</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">{data?.paragraph.level}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => navigate(`/practice/${id}/result`)}
                                            className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-blue-200 dark:shadow-blue-900/40"
                                        >
                                            {t("practice.detail.backToSummary")}
                                        </button>
                                    </div>
                                </div>

                                {/* Original */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        {t("practice.result.vietnameseOriginal")}
                                    </h3>
                                    <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <p className="text-base text-slate-700 dark:text-slate-300 italic font-serif">{data?.sentenceAnswers[selectedSentenceIndex].originalText}</p>
                                    </div>
                                </div>

                                {/* User Translation */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        {t("practice.detail.yourTranslation")}
                                    </h3>
                                    <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <p className="text-base text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                                            {renderWordDiff(data?.sentenceAnswers[selectedSentenceIndex].userTranslation ?? '', data?.sentenceAnswers[selectedSentenceIndex].feedback.correction ?? '', data?.targetLanguage ?? "EN")}
                                        </p>
                                    </div>
                                </div>


                                {/* Improved Translation */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {t("practice.detail.suggestedTranslation")}
                                    </h3>
                                    <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 relative overflow-hidden group">

                                        <p className="text-base font-bold text-blue-700 dark:text-blue-300">{data?.sentenceAnswers[selectedSentenceIndex].feedback.improved}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setSelectedSentenceIndex(Math.max(0, selectedSentenceIndex - 1))}
                                disabled={selectedSentenceIndex === 0}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                {t("practice.detail.prev")}
                            </button>
                            <button
                                onClick={() => setSelectedSentenceIndex(Math.min((data?.sentenceAnswers.length ?? 0) - 1, selectedSentenceIndex + 1))}
                                disabled={selectedSentenceIndex === (data?.sentenceAnswers.length ?? 0) - 1}
                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-slate-200 dark:shadow-slate-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t("practice.detail.nextSentence")}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
