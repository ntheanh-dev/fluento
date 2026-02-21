import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, ArrowRight, Copy, Book, Lightbulb } from 'lucide-react';
import ScoreRing from './ScoreRing';

const AnalysisResult: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <span>Exercises</span>
                        <span className="text-slate-300">/</span>
                        <span>Business Email Writing</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Analysis Result <span className="text-lg font-normal text-slate-500 ml-2">(Kết quả phân tích)</span></h1>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-slate-700">
                        <Share2 size={16} /> Share
                    </button>
                    <Link to="/practice" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium shadow-lg shadow-primary/20">
                        Next Challenge <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Card */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <h3 className="font-bold text-slate-800 mb-6">Writing Quality Score</h3>
                    <ScoreRing score={75} size="lg" />
                    <div className="mt-6 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Good Job!</div>
                    <p className="mt-4 text-slate-600 font-medium">"Your grammar is solid, but vocabulary could be more natural."</p>
                    <p className="mt-1 text-slate-400 text-sm italic">(Ngữ pháp của bạn khá tốt, nhưng từ vựng có thể tự nhiên hơn.)</p>
                </div>

                {/* Comparison Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                            <h3 className="font-bold text-slate-800">Your Original Text</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-lg text-slate-700 leading-relaxed">
                                "Dear Mr. John, I <span className="bg-red-100 text-red-700 border-b-2 border-red-300 px-1 rounded">sorry for late</span>. I have sent the document in attachment file."
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                            <h3 className="font-bold text-slate-800">Model Translations <span className="text-slate-400 font-normal text-sm">(Bài mẫu tham khảo)</span></h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">Formal (Trang trọng)</span>
                                    <Copy size={14} className="text-slate-400 cursor-pointer hover:text-primary" />
                                </div>
                                <p className="font-medium text-slate-800 mb-4">"Dear Mr. John, I apologize for the delay in my response. Please find the document attached."</p>
                                <p className="text-xs text-slate-500">Dùng trong email công việc, gửi cho cấp trên hoặc đối tác.</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-green-300 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Natural (Tự nhiên)</span>
                                    <Copy size={14} className="text-slate-400 cursor-pointer hover:text-green-600" />
                                </div>
                                <p className="font-medium text-slate-800 mb-4">"Hi John, sorry for taking so long to get back to you. I've attached the document below."</p>
                                <p className="text-xs text-slate-500">Dùng với đồng nghiệp thân thiết hoặc môi trường thoải mái.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics & Key Learnings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Detailed Metrics</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2 font-medium"><span>Grammar</span><span>85%</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2 font-medium"><span>Vocabulary</span><span>60%</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2 font-medium"><span>Tone</span><span>70%</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div></div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                        <h3 className="font-bold text-slate-800">Key Learnings <span className="text-slate-400 font-normal text-sm">(Bài học rút ra)</span></h3>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl mb-2">
                            <div>
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Mistake</span>
                                <p className="bg-red-50 text-red-800 p-2 rounded mt-1 font-medium text-sm border border-red-100">"I sorry for late"</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Correction</span>
                                <p className="bg-green-50 text-green-800 p-2 rounded mt-1 font-medium text-sm border border-green-100">"I am sorry for being late"</p>
                            </div>
                        </div>
                        <div className="p-4 flex gap-4">
                            <Lightbulb className="text-primary shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Thiếu động từ "to be" và cấu trúc Sorry</h4>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">Trong tiếng Anh, tính từ (late) không thể đứng ngay sau chủ ngữ mà cần động từ "to be" (am). Ngoài ra, sau giới từ "for" phải dùng V-ing (being late) hoặc danh từ.</p>
                                <div className="mt-3 flex gap-2">
                                    <button className="flex items-center gap-1 text-xs border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 text-slate-600">Learn Grammar <ArrowRight size={10} /></button>
                                    <button className="flex items-center gap-1 text-xs border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 text-slate-600">Save to Notebook</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl mb-2">
                            <div>
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Unnatural Phrasing</span>
                                <p className="bg-amber-50 text-amber-800 p-2 rounded mt-1 font-medium text-sm border border-amber-100">"attachment file"</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Better Choice</span>
                                <p className="bg-green-50 text-green-800 p-2 rounded mt-1 font-medium text-sm border border-green-100">"attached file" or "the attachment"</p>
                            </div>
                        </div>
                        <div className="p-4 flex gap-4">
                            <Book className="text-primary shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Cách dùng danh từ ghép vs tính từ</h4>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">Người bản xứ thường dùng tính từ "attached" (được đính kèm) bổ nghĩa cho "file", hoặc dùng danh từ "attachment" đứng một mình.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-slate-100">
                <span className="text-slate-500 text-sm">Want to practice this topic again?</span>
                <button className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50">Try Again</button>
                <Link to="/" className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800">Go to Dashboard</Link>
            </div>
        </div>
    );
};

export default AnalysisResult;