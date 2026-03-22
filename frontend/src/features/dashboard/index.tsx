import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  History,
  FileText,
  PenTool,
  Coins,
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useWritingPerformance } from './hooks/useWritingPerformance';
import type { WritingPerformanceRange } from './api';
import { PROFILE_EMBED_PRACTICESTATS, useProfileData } from '../profile/query';
import { useCredits } from '@/features/credits/query';
import { formatTotalHours } from '@/utils/utils';
import { useTheme } from '@/app/providers/ThemeProvider';

const Dashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [range, setRange] = useState<WritingPerformanceRange>('LAST_7_DAYS');
  const { data: series, isPending, isError } = useWritingPerformance(range);
  const { data: profile } = useProfileData({
    queryParams: PROFILE_EMBED_PRACTICESTATS,
  });
  const { data: creditBalance } = useCredits();

  const chartData = useMemo(() => {
    const points = series?.points ?? [];
    return points.map((p) => ({ name: p.label, score: p.score }));
  }, [series]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 space-y-8 pb-8 dark:text-slate-100">
      {/* Welcome & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Chào mừng quay lại, {profile?.fullName}! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">
            Chuỗi ngày luyện tập dài nhất của bạn là {profile?.longestStreak} ngày. Tiếp tục giữ phong độ nhé!
          </p>
        </div>
        <button
          onClick={() => navigate('/practice')}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/40 transition-all flex items-center justify-center gap-2"
        >
          <PenTool size={18} />
          Bắt đầu luyện tập mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Credits còn lại', value: creditBalance?.credits ?? 0, icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
          { label: 'Tổng số câu đã trả lời', value: profile?.embedded?.totalUserSentenceAnswers ?? 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Điểm trung bình', value: (profile?.embedded?.avgUserSentenceAnswerScore ?? 0).toFixed(2), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/40' },
          { label: 'Tổng thời gian học', value: formatTotalHours(profile?.embedded?.totalLearningTime ?? 0), icon: History, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hiệu suất viết</h3>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as WritingPerformanceRange)}
              className="bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-600 dark:text-slate-300 rounded-lg px-3 py-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <option value="LAST_7_DAYS">7 ngày gần đây</option>
              <option value="LAST_30_DAYS">30 ngày gần đây</option>
            </select>
          </div>
          <div className="h-64 w-full">
            {isPending && (
              <div className="h-full w-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Đang tải dữ liệu...
              </div>
            )}
            {isError && (
              <div className="h-full w-full flex items-center justify-center text-sm text-red-500">
                Không thể tải dữ liệu hiệu suất viết.
              </div>
            )}
            {!isPending && !isError && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#f1f5f9' : '#0f172a' }}
                    cursor={{ stroke: isDark ? '#475569' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default Dashboard;