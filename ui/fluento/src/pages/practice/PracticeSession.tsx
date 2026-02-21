import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Volume2, History, Lightbulb, Undo, Redo, CheckCircle } from 'lucide-react';

const PracticeSession: React.FC = () => {
    const navigate = useNavigate();
    const [input, setInput] = useState("I am writing this email to inquire about the...");

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/practice" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span>Unit 4</span>
                            <ChevronRight size={12} />
                            <span>Business Communication</span>
                        </div>
                        <h1 className="text-lg font-bold text-slate-800">Sentence Translation Task</h1>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">3/10</span>
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-3/10"></div>
                        </div>
                        <span className="text-xs font-bold text-primary">30%</span>
                    </div>
                    <button
                        onClick={() => navigate('/practice/result')}
                        className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-medium shadow-md flex items-center gap-2"
                    >
                        <span>Check Answer</span>
                        <CheckCircle size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
                {/* Main Work Area */}
                <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-y-auto pr-2">
                    {/* Instructions */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <span className="text-primary font-bold text-xl">VI</span>
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-slate-800 mb-1">Vietnamese Sentence</h2>
                                <p className="text-sm text-slate-600">Translate the specific sentence below into formal business English.</p>
                            </div>
                        </div>
                    </div>

                    {/* Source Text */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source</span>
                            <button className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                                <Lightbulb size={14} /> Hint
                            </button>
                        </div>
                        <div className="p-8 flex items-center justify-center min-h-[140px]">
                            <p className="text-xl md:text-2xl text-center leading-relaxed text-slate-800 font-semibold italic">
                                "Tôi viết thư này để hỏi về tiến độ của dự án trang web mới."
                            </p>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col flex-1 min-h-[250px]">
                        <div className="bg-white border-b border-slate-200 px-5 py-3 flex justify-between items-center rounded-t-xl">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Translation</span>
                            <div className="flex items-center gap-1">
                                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Undo size={16} /></button>
                                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Redo size={16} /></button>
                            </div>
                        </div>
                        <div className="relative p-8 flex-1 flex flex-col">
                            <textarea
                                className="w-full h-full text-xl md:text-2xl outline-none resize-none bg-transparent text-slate-800 font-sans border-none focus:ring-0 p-0"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                spellCheck={false}
                            />
                            <div className="mt-auto pt-4 flex justify-between items-center">
                                <div className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded">
                                    {input.split(' ').length} words
                                </div>
                                <button onClick={() => setInput('')} className="text-xs font-semibold text-slate-500 hover:text-primary">Clear</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Hints */}
                <aside className="lg:col-span-5 flex flex-col h-full overflow-hidden">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                        <div className="flex border-b border-slate-200 bg-slate-50">
                            <button className="flex-1 py-3 px-4 text-sm font-bold text-primary border-b-2 border-primary bg-white transition-all">
                                Vocabulary Hints
                            </button>
                            <button className="flex-1 py-3 px-4 text-sm font-medium text-slate-500 hover:text-slate-700 transition-all">
                                Grammar Rules
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {[
                                { label: 'SUBJECT / VERB', term: 'Viết thư', en: 'write an email', ipa: '/raɪt/ /ən/ /ˈiːmeɪl/', note: 'Use present continuous (am writing) for current action.' },
                                { label: 'FORMAL REQUEST', term: 'Hỏi về / Yêu cầu', en: 'inquire about', ipa: '/ɪnˈkwaɪər əˈbaʊt/', note: '"Inquire" is more formal than "ask".' },
                                { label: 'BUSINESS TERM', term: 'Tiến độ', en: 'progress', ipa: '/ˈprɒɡres/', note: 'Uncountable noun. "The progress of..."' },
                                { label: 'PROJECT', term: 'Dự án', en: 'project', ipa: '/ˈprɒdʒekt/', note: 'Stress on first syllable.' }
                            ].map((item, i) => (
                                <div key={i} className="group border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">{item.label}</span>
                                            <h3 className="text-lg font-bold text-slate-800">{item.term}</h3>
                                        </div>
                                        <button className="text-slate-300 hover:text-primary transition-colors">
                                            <Volume2 size={20} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">{item.en}</span>
                                        <span className="text-xs text-slate-400 font-mono italic">{item.ipa}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        <strong className="text-slate-700">Note:</strong> {item.note}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                            <button className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white transition-colors flex items-center justify-center gap-2">
                                <History size={16} /> Previous
                            </button>
                            <button className="flex-1 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-400 font-medium cursor-not-allowed">
                                Next Hint
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default PracticeSession;