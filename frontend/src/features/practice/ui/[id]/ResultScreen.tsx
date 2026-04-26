import { motion } from 'motion/react';
import {
    PartyPopper,
    RotateCcw,
    ArrowRight,
    History,
    BarChart2,
    Smile,
    BookOpen,
    FileText
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserPracticeData } from '../../hooks/useUserPractice';
import { formatElapsed } from '@/utils/utils';
import { message, Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { showApiError } from '@/shared/api/showApiError';
import { renderWordDiff } from '../../fnc';
import { useTranslation } from 'react-i18next';

export default function ResultScreen() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [confirmRetryOpen, setConfirmRetryOpen] = useState(false);
    const { data, error: errorUserPracticeData, isLoading: isLoadingUserPracticeData } = useUserPracticeData(Number(id));

    if (isLoadingUserPracticeData) {
        return <Spin indicator={<LoadingOutlined spin />} />;
    }

    const paragraphSentences = data?.paragraph.sentences ?? [];
    const sentenceContents = paragraphSentences.map((sentence) => sentence.content);

    if (data && data.sentenceAnswers.length !== sentenceContents.length) {
        message.warning(t('practice.result.incompleteWarning'));
        navigate(`/practice/${id}`, { replace: true });
        return;
    }

    if (errorUserPracticeData) {
        showApiError(errorUserPracticeData);
        navigate(`/practice/${id}`, { replace: true });
        return;
    }

    const avgScore = Math.round((data?.sentenceAnswers?.reduce((acc, curr) => acc + curr.score, 0) ?? 0) / (data?.sentenceAnswers?.length ?? 1) * 10) / 10 || 0;
    const totalTime = Math.floor(Number(data?.learningTime ?? 0) / 1000);


    return (
        <div className="font-sans text-slate-900 dark:text-slate-100 p-4 min-h-screen">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3 sm:space-y-4"
                >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-4 sm:mb-6">
                        <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">{t('practice.result.heroTitle')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg">{t('practice.result.heroSubtitle')}</p>
                </motion.div>


                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="bg-white dark:bg-slate-900/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/50 text-blue-500">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-bold mb-0.5">{t('practice.result.type')}</p>
                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{data?.paragraph.type ? t(`practice.type.${data.paragraph.type}`) : ''}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/50 text-blue-500">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-bold mb-0.5">{t('practice.result.topic')}</p>
                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{data?.paragraph.topic ? t(`common.topic.${data.paragraph.topic}`) : ''}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/50 text-blue-500">
                            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-bold mb-0.5">{t('practice.result.tone')}</p>
                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{data?.paragraph.tone ? t(`practice.tone.${data.paragraph.tone}`) : ''}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/50 text-blue-500">
                            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-bold mb-0.5">{t('practice.result.level')}</p>
                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{data?.paragraph.level}</p>
                        </div>
                    </div>
                </div>


                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900/90 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-1 sm:gap-2"
                    >
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('practice.result.overallScore')}</span>
                        <div className="flex items-baseline gap-1">
                            {avgScore >= 9 ? (
                                <span className="text-3xl sm:text-4xl font-bold text-emerald-500">{avgScore}</span>
                            ) : avgScore >= 7 ? (
                                <span className="text-3xl sm:text-4xl font-bold text-blue-500">{avgScore}</span>
                            ) : (
                                <span className="text-3xl sm:text-4xl font-bold text-amber-500">{avgScore}</span>
                            )}
                            <span className="text-base sm:text-lg font-medium text-slate-400">/10</span>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900/90 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-1 sm:gap-2"
                    >
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('practice.result.timeLabel')}</span>
                        <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">{formatElapsed(totalTime)}</div>
                    </motion.div>
                </div>

                {/* Comparison Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700">
                        {/* Vietnamese Original */}
                        <div className="flex flex-col min-w-0">
                            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('practice.result.vietnameseOriginal')}</span>
                            </div>
                            <div className="p-4 sm:p-6 flex-1 min-w-0">
                                {data?.paragraph.title && (
                                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-bold leading-relaxed mb-3 sm:mb-4">
                                        {data?.paragraph.title}
                                    </p>
                                )}
                                {data?.paragraph.type === 'SINGLE_SENTENCE' ? (
                                    <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 italic leading-relaxed whitespace-pre-line">
                                        {sentenceContents.map((sentence, index) => (
                                            <p key={index} className="text-sm sm:text-base text-slate-600 dark:text-slate-300 italic leading-relaxed whitespace-pre-line">
                                                {index + 1}. {sentence}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 italic leading-relaxed whitespace-pre-line break-words">
                                        {sentenceContents.join(" ")}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* English Translation */}
                        <div className="flex flex-col min-w-0">
                            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50/50 dark:bg-slate-950/50 border-b md:border-b-0 border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('practice.result.yourEnglish')}</span>
                            </div>
                            <div className="p-4 sm:p-6 md:p-8 bg-blue-50/30 dark:bg-blue-950/20 flex-1 min-w-0">
                                {data?.paragraph.type === 'SINGLE_SENTENCE' ? (
                                    <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed break-words">
                                        {data?.sentenceAnswers.map((answer, index) => (
                                            <span key={index}>
                                                {index + 1}. {renderWordDiff(answer.userTranslation ?? '', answer.feedback.correction ?? '', data?.targetLanguage ?? "EN")}
                                                <br />
                                            </span>
                                        ))}
                                    </p>
                                ) : (
                                    <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed whitespace-pre-line break-words">
                                        {data?.sentenceAnswers.map((answer) => {
                                            if (answer.score < 9.5) {
                                                return renderWordDiff(answer.userTranslation ?? '', answer.feedback.correction ?? '', data?.targetLanguage ?? "EN");
                                            }
                                            return <span key={answer.id}>{answer.userTranslation}{' '}</span>;
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
                >
                    <button
                        onClick={() => navigate(`/practice/${id}/result/detail`, { state: { id } })}
                        className="h-12 sm:h-14 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <History className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        {t('practice.result.viewMistakes')}
                    </button>
                    <button
                        onClick={() => setConfirmRetryOpen(true)}
                        className="h-12 sm:h-14 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        {t('practice.result.practiceAgain')}
                    </button>
                    <button
                        onClick={() => navigate('/practice')}
                        className="h-12 sm:h-14 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/40 transition-all active:scale-[0.98]"
                    >
                        {t('practice.result.continueLearning')}
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    </button>
                </motion.div>
            </main>

            <Modal
                open={confirmRetryOpen}
                title={t('practice.result.retryTitle')}
                centered
                onCancel={() => setConfirmRetryOpen(false)}
                onOk={() => {
                    setConfirmRetryOpen(false);
                }}
                okText={t('practice.result.retryOk')}
                cancelText={t('practice.result.retryCancel')}
            >
                {t('practice.result.retryConfirmBody')}
            </Modal>
        </div>
    );
}
