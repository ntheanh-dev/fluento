import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  History,
  FileText,
  PenTool
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const data = [
    { name: 'Mon', score: 65 },
    { name: 'Tue', score: 72 },
    { name: 'Wed', score: 68 },
    { name: 'Thu', score: 85 },
    { name: 'Fri', score: 82 },
    { name: 'Sat', score: 90 },
    { name: 'Sun', score: 95 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Welcome & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, Minh! 👋</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">You've completed 80% of your weekly goal. Keep it up!</p>
        </div>
        <button
          onClick={() => navigate('/setup')}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
        >
          <PenTool size={18} />
          Start New Practice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Sentences', value: '1,248', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Average Score', value: '92%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Learning Hours', value: '48.5h', icon: History, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Writing Performance</h3>
            <select className="bg-slate-50 border-none text-sm text-slate-600 rounded-lg px-3 py-1 cursor-pointer hover:bg-slate-100">
              <option>Last 7 Days</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Milestones</h3>
          <div className="space-y-4">
            {[
              { title: '10 Day Streak', desc: 'Logged in for 10 days', icon: '🔥', progress: 100, color: 'orange' },
              { title: '50 Sentences', desc: 'Translated 50 sentences', icon: '📚', progress: 100, color: 'blue' },
              { title: 'Essay Master', desc: 'Submit 20 full essays', icon: '✍️', progress: 75, color: 'purple' },
              { title: 'Vocab Guru', desc: 'Learn 1000 new words', icon: '🧠', progress: 45, color: 'green' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${item.color}-50 text-xl shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{item.title}</h4>
                    {item.progress < 100 && <span className="text-xs text-slate-500">{item.progress}%</span>}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${item.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;