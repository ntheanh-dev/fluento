import React from 'react';
import { Trophy, Flame, Search } from 'lucide-react';
import { Avatar } from 'antd';

const Rankings: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto py-6">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Global Rankings</h1>
                    <p className="text-slate-500">Compete with learners across Vietnam. Updated every Monday.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button className="px-4 py-1.5 bg-white shadow-sm text-slate-900 rounded-md text-sm font-bold">All Vietnam</button>
                    <button className="px-4 py-1.5 text-slate-500 text-sm font-medium">Regional</button>
                </div>
            </div>

            {/* Podium */}
            <div className="flex justify-center items-end gap-4 mb-12">
                {/* 2nd */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-300 overflow-hidden">
                            <img src="https://picsum.photos/seed/2/200" alt="2nd" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white">2</div>
                    </div>
                    <div className="bg-white w-48 pt-6 pb-4 rounded-t-2xl border-t-4 border-slate-300 shadow-sm text-center">
                        <h3 className="font-bold text-slate-900">Minh Tuấn</h3>
                        <p className="text-primary font-bold text-lg">12,450 pts</p>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded mt-1 inline-block">98% Quality</span>
                    </div>
                </div>

                {/* 1st */}
                <div className="flex flex-col items-center z-10 -mx-2">
                    <div className="relative mb-6">
                        <Trophy className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400 fill-current animate-bounce" size={32} />
                        <div className="w-28 h-28 rounded-full border-4 border-amber-400 overflow-hidden shadow-lg">
                            <img src="https://picsum.photos/seed/1/200" alt="1st" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">1</div>
                    </div>
                    <div className="bg-white w-56 pt-8 pb-6 rounded-t-2xl border-t-4 border-amber-400 shadow-lg text-center relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-50 to-transparent opacity-50"></div>
                        <div className="relative">
                            <h3 className="font-bold text-xl text-slate-900">Bích Ngọc</h3>
                            <p className="text-primary font-extrabold text-2xl">15,820 pts</p>
                            <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wide">Weekly Champion</span>
                            <div className="mt-2 text-xs text-slate-400 flex items-center justify-center gap-1"><Flame size={12} /> 142 Day Streak</div>
                        </div>
                    </div>
                </div>

                {/* 3rd */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full border-4 border-orange-700 overflow-hidden">
                            <img src="https://picsum.photos/seed/3/200" alt="3rd" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-orange-700 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white">3</div>
                    </div>
                    <div className="bg-white w-48 pt-6 pb-4 rounded-t-2xl border-t-4 border-orange-700 shadow-sm text-center">
                        <h3 className="font-bold text-slate-900">Hoàng Nam</h3>
                        <p className="text-primary font-bold text-lg">11,900 pts</p>
                        <span className="text-[10px] bg-orange-50 text-orange-800 px-2 py-0.5 rounded mt-1 inline-block">2.4k Sentences</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-bold text-lg text-slate-800">Detailed Standings</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Find user..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary" />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white text-xs uppercase text-slate-400 font-bold tracking-wider border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Learner</th>
                            <th className="px-6 py-4">Writing Score</th>
                            <th className="px-6 py-4">Sentences</th>
                            <th className="px-6 py-4">Streak</th>
                            <th className="px-6 py-4 text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {[
                            { rank: 4, name: 'Lan Anh', score: 9.4, sent: '1,842', streak: 45, points: '10,420' },
                            { rank: 5, name: 'Quang Lê', score: 8.8, sent: '1,210', streak: 32, points: '9,850' },
                            { rank: 6, name: 'Thanh Hải', score: 9.1, sent: '942', streak: 18, points: '8,200' },
                            { rank: 7, name: 'Hồng Ánh', score: 8.2, sent: '2,501', streak: 120, points: '7,940' },
                            { rank: 8, name: 'Văn Dũng', score: 8.5, sent: '890', streak: 5, points: '7,100' },
                        ].map((row) => (
                            <tr key={row.rank} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4 font-bold text-slate-500">#{row.rank}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={`https://picsum.photos/seed/${row.rank}/100`} />
                                        <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{row.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full" style={{ width: `${row.score * 10}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{row.score}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.sent}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                                        <Flame size={14} /> {row.streak}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-900">{row.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 text-center border-t border-slate-100">
                    <button className="text-primary text-sm font-bold hover:underline">Load More Runners</button>
                </div>
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-2xl border border-slate-200 px-6 py-3 flex items-center gap-6 z-50 animate-bounce-slow">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar src="https://picsum.photos/200" size={40} className="border-2 border-primary" />
                        <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[9px] px-1 rounded-full font-bold">YOU</div>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">My Rank</p>
                        <p className="font-bold text-slate-900">#142</p>
                    </div>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Next Goal</p>
                    <p className="text-sm font-medium"><span className="text-primary font-bold">850 pts</span> to #141</p>
                </div>
                <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full font-bold text-xs transition-colors shadow-lg shadow-primary/20">
                    Claim Bonus
                </button>
            </div>
        </div>
    );
};

export default Rankings;