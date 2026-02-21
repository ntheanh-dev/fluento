import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Languages, ScrollText, Home, ArrowRight, CheckCircle2 } from 'lucide-react';

const PracticeSetup: React.FC = () => {
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState<'sentence' | 'paragraph'>('sentence');

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Practice Configuration</h1>
                <p className="text-slate-500 italic">Optimized Practice Configuration Hub</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Mode Selection */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-primary font-bold text-xs">1</span>
                            <h2 className="text-lg font-bold">Practice Mode <span className="text-xs font-normal text-slate-400 ml-1">(Mode Selection)</span></h2>
                        </div>

                        <div className="space-y-3">
                            <div
                                onClick={() => setSelectedMode('sentence')}
                                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedMode === 'sentence' ? 'border-primary bg-blue-50' : 'border-slate-100 hover:border-blue-200'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedMode === 'sentence' ? 'bg-blue-100 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                    <Languages size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-slate-900">Sentence Translation</h3>
                                    <p className="text-xs text-slate-500 uppercase">Dịch theo câu</p>
                                </div>
                                {selectedMode === 'sentence' && <CheckCircle2 className="text-primary" />}
                            </div>

                            <div
                                onClick={() => setSelectedMode('paragraph')}
                                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedMode === 'paragraph' ? 'border-primary bg-blue-50' : 'border-slate-100 hover:border-blue-200'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedMode === 'paragraph' ? 'bg-blue-100 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                    <ScrollText size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-slate-900">Paragraph Writing</h3>
                                    <p className="text-xs text-slate-500 uppercase">Viết theo đoạn văn</p>
                                </div>
                                {selectedMode === 'paragraph' && <CheckCircle2 className="text-primary" />}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-primary font-bold text-xs">2</span>
                                <h2 className="text-lg font-bold">Topic</h2>
                            </div>
                            <span className="text-[10px] text-primary font-bold px-2 py-0.5 bg-blue-50 rounded uppercase">Required</span>
                        </div>

                        <div className="flex items-center w-full p-3 bg-white border-2 border-primary rounded-xl cursor-pointer">
                            <Home className="text-primary mr-3" size={20} />
                            <div className="flex-1 flex flex-col">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Current Topic</span>
                                <span className="font-bold text-base">Daily Life - <span className="text-slate-500 font-normal">Đời sống</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Difficulty & Tone */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-primary font-bold text-xs">3</span>
                            <h2 className="text-lg font-bold">Difficulty</h2>
                        </div>

                        <div className="px-2">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[11px] font-bold text-primary px-2.5 py-0.5 bg-blue-50 rounded-full">INTERMEDIATE</span>
                                <span className="text-[10px] text-slate-400 uppercase">Trung cấp</span>
                            </div>
                            <input type="range" min="0" max="100" defaultValue="50" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                            <div className="flex justify-between w-full mt-2 text-[10px] font-bold text-slate-400 uppercase">
                                <span>Beginner</span>
                                <span>Intermediate</span>
                                <span>Advanced</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-primary font-bold text-xs">4</span>
                            <h2 className="text-lg font-bold">Tone & Style</h2>
                        </div>

                        <select className="w-full p-2.5 mb-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-sm font-medium">
                            <option>Natural (Tự nhiên)</option>
                            <option>Formal (Trang trọng)</option>
                            <option>Academic (Học thuật)</option>
                        </select>

                        <div className="grid grid-cols-2 gap-3">
                            {['IELTS Vocab', 'Idioms', 'Phrasal Verbs', 'Business'].map(opt => (
                                <label key={opt} className="flex items-center p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                                    <input type="checkbox" className="rounded text-primary focus:ring-primary w-4 h-4 mr-2" />
                                    <span className="text-xs font-bold text-slate-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <button
                    onClick={() => navigate('/practice/session')}
                    className="group w-full md:w-80 h-14 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    <span className="text-base font-bold">Start Practice</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default PracticeSetup;