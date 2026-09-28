import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckSquare,
  Droplet,
  BookOpen,
  Wallet,
  Clock,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import {
  getTasks,
  getHabits,
  getHabitLogs,
  getGoals,
  getTransactions,
  getStudySessions,
} from '../services/storage';
import {
  formatUzbekDate,
  getTodayString,
  shiftDate,
  getCurrentWeekRange,
  UZBEK_MONTHS,
} from '../utils/dateUtils';
import {
  calculateDailyProgress,
  calculateTaskStats,
  calculateFinanceStats,
  calculateHabitStats,
  calculateStudyStats,
  generateDailySummary,
  generateWeeklyReview,
  generateMonthlyReview,
} from '../services/analyticsEngine';
import { User } from '../types';

interface StatisticsViewProps {
  user: User | null;
}

type StatTab = 'day' | 'week' | 'month' | 'quarter' | 'year';

export const StatisticsView: React.FC<StatisticsViewProps> = ({ user }) => {
  const today = getTodayString();
  const [activeTab, setActiveTab] = useState<StatTab>('day');

  // Navigation targets
  const [currentDate, setCurrentDate] = useState<string>(today);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  // AI insights state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    insights: string[];
    summary: string;
    recommendation: string;
  } | null>(null);

  const tasks = getTasks();
  const habits = getHabits();
  const habitLogs = getHabitLogs();
  const goals = getGoals();
  const transactions = getTransactions();
  const studySessions = getStudySessions();

  // Weekly calculations
  const baseWeek = getCurrentWeekRange();
  const currentWeekStart = shiftDate(baseWeek.start, weekOffset * 7);
  const currentWeekEnd = shiftDate(baseWeek.end, weekOffset * 7);

  // Daily Calculations
  const dailyProgress = calculateDailyProgress(
    currentDate,
    tasks,
    habits,
    habitLogs,
    goals,
    studySessions
  );
  const dailySummary = generateDailySummary(
    currentDate,
    tasks,
    habits,
    habitLogs,
    transactions,
    studySessions
  );

  // Weekly review
  const weeklyReview = generateWeeklyReview(
    currentWeekStart,
    currentWeekEnd,
    tasks,
    habits,
    habitLogs,
    transactions,
    studySessions
  );

  // Monthly review
  const monthlyReview = generateMonthlyReview(
    selectedYear,
    selectedMonthIndex,
    tasks,
    goals,
    transactions,
    studySessions
  );

  // Fetch AI Insights
  const handleFetchAiInsights = async () => {
    setAiLoading(true);
    try {
      const statsPayload = {
        tasks: dailySummary.taskStats,
        habits: {
          totalHabits: dailySummary.habitStats.totalHabits,
          averageConsistency: dailySummary.habitStats.averageConsistency,
          bestHabit: dailySummary.habitStats.bestHabit,
        },
        finance: dailySummary.financeStats,
        study: dailySummary.studyStats,
        goals: {
          total: goals.length,
          completed: goals.filter((g) => g.isCompleted || g.currentValue >= g.targetValue).length,
        },
      };

      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user?.name,
          dateRange: activeTab === 'day' ? formatUzbekDate(currentDate) : 'Haftalik/Oylik',
          statsSummary: statsPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      }
    } catch (e) {
      console.error('Failed to get AI insights', e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00E5FF]" />
            <span>Faktik statistika va tarixiy xotira</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Har bir kun, hafta va oy uchun avtomatik to‘planadigan real tahlillar
          </p>
        </div>

        <button
          onClick={handleFetchAiInsights}
          disabled={aiLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {aiLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Sparkles className="w-4 h-4 text-slate-950" />
          )}
          <span>AI tahlili (Gemini)</span>
        </button>
      </div>

      {/* AI Insights Card if available */}
      {aiInsights && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900 border border-cyan-500/40 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00E5FF]" />
              <h3 className="font-extrabold text-sm text-white">
                Sun'iy intellekt xulosasi (Grounded Insights)
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00E5FF] font-semibold">
              Gemini 3.8 Flash
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {aiInsights.summary}
          </p>

          <div className="space-y-1.5 pt-1">
            {aiInsights.insights.map((ins, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-1.5 shrink-0" />
                <span>{ins}</span>
              </div>
            ))}
          </div>

          {aiInsights.recommendation && (
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-[#00E5FF] font-medium mt-2">
              💡 <strong>Tavsiya:</strong> {aiInsights.recommendation}
            </div>
          )}
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'day' as StatTab, label: 'Kun' },
          { id: 'week' as StatTab, label: 'Hafta' },
          { id: 'month' as StatTab, label: 'Oy' },
          { id: 'quarter' as StatTab, label: 'Choraklik tahlil' },
          { id: 'year' as StatTab, label: 'Yillik tahlil' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#00E5FF] text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. KUNLIK TAHLIL (DAY TAB WITH HISTORICAL NAVIGATION) */}
      {activeTab === 'day' && (
        <div className="space-y-4">
          {/* Day Navigation Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentDate((d) => shiftDate(d, -1))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oldingi kun</span>
            </button>

            <div className="text-center">
              <span className="text-sm font-extrabold text-white">
                {formatUzbekDate(currentDate, true)}
              </span>
              {currentDate === today && (
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00E5FF] font-semibold">
                  Bugun
                </span>
              )}
            </div>

            <button
              onClick={() => setCurrentDate((d) => shiftDate(d, 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Keyingi kun</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Daily Progress & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Big Progress Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Umumiy kunlik ko‘rsatkich
              </span>
              <div className="text-5xl font-mono font-extrabold text-white my-3">
                {dailyProgress.hasData ? `${dailyProgress.score}%` : "—"}
              </div>
              <p className="text-xs text-slate-400 max-w-xs">
                {dailyProgress.hasData
                  ? `Vazifalar, odatlar va o‘qish faoliyatining o‘lchangan dinamikasi.`
                  : `Bu kun uchun ma'lumot yetarli emas.`}
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#00E5FF] flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Vazifalar
                </span>
                <div className="text-xl font-mono font-extrabold text-white">
                  {dailySummary.taskStats.completed} / {dailySummary.taskStats.total}
                </div>
                <div className="text-[10px] text-slate-400">
                  {dailySummary.taskStats.completionRate}% bajarildi
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5" />
                  Odatlar
                </span>
                <div className="text-xl font-mono font-extrabold text-white">
                  {dailySummary.habitStats.averageConsistency}%
                </div>
                <div className="text-[10px] text-slate-400">Kunlik intizom darajasi</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  O‘qish vaqti
                </span>
                <div className="text-xl font-mono font-extrabold text-white">
                  {dailySummary.studyStats.totalMinutes} daqiqa
                </div>
                <div className="text-[10px] text-slate-400">
                  {dailySummary.studyStats.sessionsCount} ta seans
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" />
                  Moliyaviy xarajat
                </span>
                <div className="text-xl font-mono font-extrabold text-white">
                  {dailySummary.financeStats.totalExpenses.toLocaleString()} so‘m
                </div>
                <div className="text-[10px] text-slate-400">
                  Daromad: {dailySummary.financeStats.totalIncome.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HAFTALIK HISOBOT (WEEK TAB) */}
      {activeTab === 'week' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oldingi hafta</span>
            </button>

            <span className="text-sm font-extrabold text-white">
              {formatUzbekDate(currentWeekStart, false)} — {formatUzbekDate(currentWeekEnd, true)}
            </span>

            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Keyingi hafta</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
              {weeklyReview.title}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Vazifalar</span>
                <div className="text-2xl font-mono font-extrabold text-white mt-1">
                  {weeklyReview.taskCompletionRate}%
                </div>
                <div className="text-xs text-emerald-400 mt-1 font-semibold">
                  {weeklyReview.taskDiff >= 0 ? `+${weeklyReview.taskDiff}%` : `${weeklyReview.taskDiff}%`} o‘tgan haftaga nisbatan
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">O‘qish soatlari</span>
                <div className="text-2xl font-mono font-extrabold text-[#00E5FF] mt-1">
                  {weeklyReview.studyHours} soat
                </div>
                <div className="text-xs text-[#00E5FF] mt-1 font-semibold">
                  {weeklyReview.studyDiffHours >= 0 ? `+${weeklyReview.studyDiffHours} soat` : `${weeklyReview.studyDiffHours} soat`}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Haftalik daromad</span>
                <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                  {weeklyReview.income.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">so‘m</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Haftalik xarajat</span>
                <div className="text-2xl font-mono font-extrabold text-rose-400 mt-1">
                  {weeklyReview.expenses.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">so‘m</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. OYLIK HISOBOT (MONTH TAB) */}
      {activeTab === 'month' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <select
              value={selectedMonthIndex}
              onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
            >
              {UZBEK_MONTHS.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>

            <span className="text-sm font-extrabold text-white">
              {monthlyReview.monthName} {selectedYear}-yil
            </span>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
              {monthlyReview.monthName} oylik hisoboti
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Oylik daromad</span>
                <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                  +{monthlyReview.finance.totalIncome.toLocaleString()} so‘m
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Oylik xarajatlar</span>
                <div className="text-2xl font-mono font-extrabold text-rose-400 mt-1">
                  -{monthlyReview.finance.totalExpenses.toLocaleString()} so‘m
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">O‘qish vaqti</span>
                <div className="text-2xl font-mono font-extrabold text-[#00E5FF] mt-1">
                  {monthlyReview.study.totalHours} soat
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHORAKLIK TAHLIL (QUARTER TAB) */}
      {activeTab === 'quarter' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
            Choraklik tahlil (3 oylik dinamika)
          </h3>
          <p className="text-xs text-slate-400">
            Chorak davomida barqarorlik, vazifalar sur’ati va o‘qish intensivligi tahlili.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Jami vazifalar</span>
              <div className="text-2xl font-mono font-extrabold text-white mt-1">
                {tasks.length} ta
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold text-[#00E5FF] uppercase">Jami o‘qish</span>
              <div className="text-2xl font-mono font-extrabold text-[#00E5FF] mt-1">
                {Number((studySessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60).toFixed(1))} soat
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase">Moliyaviy balans</span>
              <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                {calculateFinanceStats(transactions).balance.toLocaleString()} so‘m
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. YILLIK TAHLIL (YEAR TAB) */}
      {activeTab === 'year' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
            Yillik tahlil (2026-yil faoliyati)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Yillik o‘qish</span>
              <div className="text-2xl font-mono font-extrabold text-[#00E5FF] mt-1">
                {Number((studySessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60).toFixed(1))} soat
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Bajarilgan vazifa</span>
              <div className="text-2xl font-mono font-extrabold text-white mt-1">
                {tasks.filter((t) => t.status === 'bajarildi').length} ta
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Yillik daromad</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-1">
                {calculateFinanceStats(transactions).totalIncome.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Yillik xarajat</span>
              <div className="text-xl font-mono font-extrabold text-rose-400 mt-1">
                {calculateFinanceStats(transactions).totalExpenses.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
