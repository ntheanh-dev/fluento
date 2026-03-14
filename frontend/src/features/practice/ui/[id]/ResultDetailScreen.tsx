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
import { renderWordDiff } from '../../fnc';
export default function ReviewScreen() {

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
        <div className="max-w-screen-2xl mx-auto h-[calc(100vh-130px+4rem)] -mt-4 sm:-mt-6 md:-mt-8 -mb-4 sm:-mb-6 md:-mb-8 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10">
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
                                <div className="flex items-end justify-between border-b border-slate-200 pb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Chi tiết nhận xét</h2>
                                        <div className="flex items-center gap-2 mt-1.5 text-slate-500 font-medium text-xs">
                                            <span>Câu {selectedSentenceIndex + 1} / {data?.sentenceAnswers.length ?? 0}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>Bài dịch</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-slate-500 font-medium text-xs">Điểm: {data?.sentenceAnswers[selectedSentenceIndex].score ?? 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-1.5 sm:gap-4">

                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Topic</span>
                                            <span className="text-xs font-semibold text-slate-700">{data?.paragraph.topic.toLowerCase()}</span>
                                        </div>
                                        <div className="h-8 w-px bg-slate-100"></div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tone</span>
                                            <span className="text-xs font-semibold text-slate-700">{data?.paragraph.tone.toLowerCase()}</span>
                                        </div>
                                        <div className="h-8 w-px bg-slate-100"></div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Level</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">{data?.paragraph.level}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => navigate(`/practice/${id}/result`)}
                                            className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-blue-200"
                                        >
                                            Về tổng kết
                                        </button>
                                    </div>
                                </div>

                                {/* Original */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Tiếng Việt gốc
                                    </h3>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                        <p className="text-base text-slate-700 italic font-serif">{data?.sentenceAnswers[selectedSentenceIndex].originalText}</p>
                                    </div>
                                </div>

                                {/* User Translation */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        Bản dịch của bạn
                                    </h3>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                        <p className="text-base text-slate-800 font-medium leading-relaxed">
                                            {renderWordDiff(data?.sentenceAnswers[selectedSentenceIndex].userTranslation ?? '', data?.sentenceAnswers[selectedSentenceIndex].feedback.correction ?? '')}
                                        </p>
                                    </div>
                                </div>


                                {/* Improved Translation */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Bản dịch đề xuất
                                    </h3>
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 relative overflow-hidden group">

                                        <p className="text-base font-bold text-blue-700">{data?.sentenceAnswers[selectedSentenceIndex].feedback.improved}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                            <button
                                onClick={() => setSelectedSentenceIndex(Math.max(0, selectedSentenceIndex - 1))}
                                disabled={selectedSentenceIndex === 0}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Trước
                            </button>
                            <button
                                onClick={() => setSelectedSentenceIndex(Math.min((data?.sentenceAnswers.length ?? 0) - 1, selectedSentenceIndex + 1))}
                                disabled={selectedSentenceIndex === (data?.sentenceAnswers.length ?? 0) - 1}
                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Câu tiếp
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
