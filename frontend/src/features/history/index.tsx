import React from 'react';
import {
    History,
    Search,
    FileText,
    Star,
    ArrowLeft
} from 'lucide-react';

const HistoryPage = () => {
    return (
        <div className="max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Practice History</h1>
                    <p className="text-slate-500 mt-1">Review your past translations and improvements.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-1">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 shrink-0">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600"><FileText size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
                            <p className="font-bold text-lg leading-none">1,204</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 shrink-0">
                        <div className="bg-yellow-100 p-2 rounded-full text-yellow-600"><Star size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Saved</p>
                            <p className="font-bold text-lg leading-none">48</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 sticky top-0 md:top-20 z-10">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-slate-100 p-1 rounded-lg w-full lg:w-auto">
                        <button className="flex-1 lg:flex-none px-6 py-2 rounded shadow-sm bg-white text-blue-600 font-bold text-sm">All History</button>
                        <button className="flex-1 lg:flex-none px-6 py-2 rounded text-slate-500 font-medium text-sm hover:text-slate-900">Saved</button>
                    </div>
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Search..." />
                    </div>
                    <div className="flex gap-2 w-full lg:w-auto overflow-x-auto">
                        <select className="border-none bg-slate-50 rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"><option>Filter: All Topics</option></select>
                        <select className="border-none bg-slate-50 rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"><option>Sort: Newest</option></select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { topic: 'Business', date: '2 hours ago', score: 9.2, vi: 'Tôi muốn đề xuất một cuộc họp.', en: 'I would like to propose a meeting.', level: 'Excellent', color: 'green' },
                    { topic: 'Casual', date: 'Yesterday', score: 6.5, vi: 'Bạn có rảnh đi cà phê không?', en: 'Do you free for coffee?', level: 'Average', color: 'orange' },
                    { topic: 'Academic', date: 'Oct 20', score: 8.8, vi: 'Việc học ngôn ngữ rất quan trọng.', en: 'Learning language is crucial.', level: 'Good', color: 'emerald' },
                ].map((item, i) => (
                    <div key={i} className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold uppercase">{item.topic}</span>
                                <span className="text-slate-400 text-xs flex items-center gap-1"><History size={12} /> {item.date}</span>
                            </div>
                            <button className="text-slate-300 hover:text-yellow-400"><Star size={20} /></button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex md:flex-col items-center justify-center gap-1 w-20 shrink-0">
                                <div className={`w-14 h-14 rounded-full border-4 border-${item.color}-500 flex items-center justify-center text-lg font-bold text-${item.color}-700 bg-${item.color}-50`}>
                                    {item.score}
                                </div>
                                <span className={`text-xs font-bold text-${item.color}-600`}>{item.level}</span>
                            </div>
                            <div className="flex-1 grid md:grid-cols-2 gap-6">
                                <div className="pl-4 border-l-4 border-blue-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Vietnamese</p>
                                    <p className="text-lg text-slate-800">"{item.vi}"</p>
                                </div>
                                <div className="pl-4 border-l-4 border-purple-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Your English</p>
                                    <p className="text-lg text-slate-800">"{item.en}"</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-blue-600 text-sm font-bold flex items-center gap-1">View Details <ArrowLeft className="rotate-180" size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryPage;