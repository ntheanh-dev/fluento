import React, { useState } from 'react';
import { Search, Filter, Calendar, Star, MoreHorizontal, ArrowRight, Copy, AlertTriangle } from 'lucide-react';

const History: React.FC = () => {
    const [filter, setFilter] = useState('all');

    const historyItems = [
        {
            id: 1,
            type: 'Business',
            date: '2 hours ago',
            score: 9.2,
            scoreLabel: 'Excellent',
            source: 'Tôi muốn đề xuất một cuộc họp vào chiều thứ Sáu để thảo luận về kế hoạch tiếp thị.',
            target: 'I would like to propose a meeting on Friday afternoon to discuss the marketing plan.',
            isSaved: false
        },
        {
            id: 2,
            type: 'Casual',
            date: 'Yesterday',
            score: 6.5,
            scoreLabel: 'Average',
            source: 'Bạn có rảnh đi cà phê tối nay không?',
            target: 'Do you free for coffee tonight?',
            isSaved: true,
            error: 'Grammar error detected'
        },
        {
            id: 3,
            type: 'Academic',
            date: 'Oct 20, 2023',
            score: 8.8,
            scoreLabel: 'Good',
            source: 'Việc học ngôn ngữ mới mở ra nhiều cơ hội nghề nghiệp.',
            target: 'Learning a new language opens up many career opportunities.',
            isSaved: false
        },
        {
            id: 4,
            type: 'Idiom',
            date: 'Oct 18, 2023',
            score: 7.9,
            scoreLabel: 'Solid',
            source: 'Đừng đánh giá sách qua vẻ bề ngoài.',
            target: "Don't judge a book by its cover.",
            isSaved: false
        }
    ];

    const getColor = (score: number) => {
        if (score >= 9) return 'text-emerald-500 border-emerald-500';
        if (score >= 8) return 'text-emerald-600 border-emerald-600';
        if (score >= 7) return 'text-primary border-primary';
        return 'text-orange-500 border-orange-500';
    };

    return (
        <div className="max-w-5xl mx-auto py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Practice History</h1>
                    <p className="text-slate-500 mt-1">Review your past translations and track your improvement.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full text-primary"><Filter size={20} /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                            <p className="font-bold text-lg leading-none">1,204</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="bg-amber-50 p-2 rounded-full text-amber-500"><Star size={20} /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Saved</p>
                            <p className="font-bold text-lg leading-none">48</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 sticky top-4 z-30 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${filter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`} onClick={() => setFilter('all')}>All History</button>
                        <button className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${filter === 'saved' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`} onClick={() => setFilter('saved')}>Saved Sentences</button>
                    </div>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search in Vietnamese or English..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary" />
                    </div>
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide self-center mr-2">Filters:</span>
                    {['Category: All', 'Date: Last 30 Days', 'Score Range'].map(f => (
                        <button key={f} className="px-3 py-1.5 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1 bg-white">
                            {f} <MoreHorizontal size={12} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {historyItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">{item.type}</span>
                                <span className="text-slate-400 text-xs flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                            </div>
                            <button className={`${item.isSaved ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}>
                                <Star size={20} fill={item.isSaved ? "currentColor" : "none"} />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex md:flex-col items-center justify-center gap-2 md:w-20 shrink-0">
                                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-lg ${getColor(item.score).replace('text', 'border').split(' ')[1]} ${getColor(item.score).split(' ')[0]} bg-slate-50`}>
                                    {item.score}
                                </div>
                                <span className={`text-[10px] font-bold uppercase ${getColor(item.score).split(' ')[0]}`}>{item.scoreLabel}</span>
                            </div>

                            <div className="flex-1 grid md:grid-cols-2 gap-6">
                                <div className="pl-4 border-l-4 border-blue-100">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vietnamese (Source)</label>
                                    <p className="text-slate-800 text-lg">"{item.source}"</p>
                                </div>
                                <div className="pl-4 border-l-4 border-purple-100">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Your English</label>
                                    <p className="text-slate-800 text-lg">"{item.target}"</p>
                                    {item.error && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-red-500 font-medium">
                                            <AlertTriangle size={12} /> {item.error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-xs font-medium text-slate-500 hover:text-primary flex items-center gap-1 px-2 py-1">
                                <Copy size={12} /> Copy
                            </button>
                            <button className="bg-blue-50 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1 hover:bg-blue-100 transition-colors">
                                View Feedback <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-1">
                    {[1, 2, 3, '...', 12].map((p, i) => (
                        <button key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${p === 1 ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                            {p}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default History;