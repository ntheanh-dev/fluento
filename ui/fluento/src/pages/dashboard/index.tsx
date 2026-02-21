import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { Plus, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Sep 1', score: 30 },
  { name: 'Sep 8', score: 45 },
  { name: 'Sep 15', score: 55 },
  { name: 'Sep 22', score: 70 },
  { name: 'Sep 29', score: 85 },
  { name: 'Oct 5', score: 92 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome back, Minh! 👋</h1>
          <p className="text-slate-500 mt-1">
            You're on a <span className="text-primary font-bold">12-day streak</span>. Keep up the great work!
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="large" icon={<Calendar size={18} />} className="flex items-center">
            This Week
          </Button>
          <Link to="/practice">
            <Button type="primary" size="large" icon={<Plus size={18} />} className="bg-primary flex items-center shadow-lg shadow-primary/30">
              New Writing Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Focus Widget */}
      <div className="bg-gradient-to-r from-primary to-blue-500 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-block bg-white/20 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Focus for Today
            </div>
            <h2 className="text-2xl font-bold mb-2">Review: Past Tense Irregular Verbs</h2>
            <p className="text-blue-100 max-w-lg">
              Based on your recent writing, we noticed some slip-ups with verbs like "go" and "eat". Let's fix that!
            </p>
          </div>
          <Button size="large" className="bg-white text-primary border-none font-bold h-12 px-6 rounded-xl shadow-lg">
            Start 5-min Lesson
          </Button>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 translate-x-12"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Writing Score Trend</h3>
              <p className="text-sm text-slate-500">Last 30 days progress</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary font-medium bg-blue-50 px-3 py-1 rounded-full">
              <TrendingUp size={16} />
              +15% Improvement
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#198de6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#198de6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#198de6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Common Errors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-1">Common Errors</h3>
          <p className="text-sm text-slate-500 mb-6">Based on last 5 essays</p>

          <div className="space-y-6 flex-1">
            {[
              { label: 'Grammar', val: 45, color: 'bg-primary', sub: 'Verb tenses & articles' },
              { label: 'Vocabulary', val: 30, color: 'bg-amber-500', sub: 'Word choice accuracy' },
              { label: 'Spelling', val: 15, color: 'bg-emerald-500', sub: 'Minor typos' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-bold">{item.val}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${item.val}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
          <Link to="/history" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Assignment</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { title: 'My Hometown: Hanoi', type: 'Writing', date: 'Sep 28, 2023', score: 92, status: 'success' },
                { title: 'Business Email Introduction', type: 'Translation', date: 'Sep 26, 2023', score: 85, status: 'processing' },
                { title: 'Describe your favorite food', type: 'Writing', date: 'Sep 24, 2023', score: 78, status: 'warning' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.title}</td>
                  <td className="px-6 py-4 text-slate-500">{row.type}</td>
                  <td className="px-6 py-4 text-slate-500">{row.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${row.score >= 90 ? 'bg-emerald-100 text-emerald-700' :
                        row.score >= 80 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {row.score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to="/practice/result" className="text-primary hover:underline font-medium">View Feedback</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};