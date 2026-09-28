import React, { useState } from 'react';
import {
  Droplet,
  Plus,
  Flame,
  CheckCircle2,
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  Table,
  Circle,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Habit, HabitLog } from '../types';
import {
  getHabits,
  getHabitLogs,
  setHabitLog,
  deleteHabit,
} from '../services/storage';
import {
  formatUzbekDate,
  getTodayString,
  shiftDate,
  UZBEK_DAYS_SHORT,
} from '../utils/dateUtils';
import { calculateHabitStats } from '../services/analyticsEngine';

interface HabitsViewProps {
  onOpenQuickAdd: (tab?: string) => void;
}

type HabitVisualMode = 'progress' | 'heatmap' | 'streak' | 'table';

export const HabitsView: React.FC<HabitsViewProps> = ({ onOpenQuickAdd }) => {
  const [visualMode, setVisualMode] = useState<HabitVisualMode>('progress');
  const today = getTodayString();
  const habits = getHabits();
  const habitLogs = getHabitLogs();

  const stats = calculateHabitStats(habits, habitLogs, today);

  const handleUpdateLog = (habitId: string, currentVal: number, change: number, target: number) => {
    const nextVal = Math.max(0, currentVal + change);
    setHabitLog(habitId, today, nextVal, nextVal >= target);
  };

  // Generate date list for heatmap (last 70 days)
  const heatmapDates: string[] = [];
  for (let i = 69; i >= 0; i--) {
    heatmapDates.push(shiftDate(today, -i));
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Droplet className="w-5 h-5 text-[#00E5FF]" />
            <span>Odatlar, intizom va kundalik odatlar</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            O‘lchanadigan odatlar: suv ichish, kitob mutolaasi, mashq va dasturlash
          </p>
        </div>
        <button
          onClick={() => onOpenQuickAdd('habit')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 hover:opacity-95 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yangi odat qo‘shish</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">Jami odatlar</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">
            {stats.totalHabits}
          </div>
          <span className="text-[11px] text-slate-400">Faol kuzatilmoqda</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800">
          <span className="text-xs font-bold text-[#00E5FF] uppercase">O‘rtacha intizom</span>
          <div className="text-2xl font-mono font-extrabold text-[#00E5FF] mt-1">
            {stats.averageConsistency}%
          </div>
          <span className="text-[11px] text-slate-400">Oxirgi 30 kunlik natija</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800">
          <span className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            Eng uzun streak
          </span>
          <div className="text-2xl font-mono font-extrabold text-purple-400 mt-1">
            {stats.bestHabit ? `${stats.bestHabit.streak} kun` : '0 kun'}
          </div>
          <span className="text-[11px] text-slate-400">
            {stats.bestHabit ? stats.bestHabit.title : 'Zanjirni boshlang'}
          </span>
        </div>
      </div>

      {/* Visual Mode Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'progress' as HabitVisualMode, label: '⭕ Progress', icon: Circle },
          { id: 'heatmap' as HabitVisualMode, label: '📊 Heatmap (GitHub uslubida)', icon: BarChart3 },
          { id: 'streak' as HabitVisualMode, label: '🔥 Streak reytingi', icon: Flame },
          { id: 'table' as HabitVisualMode, label: '📋 Jadval', icon: Table },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setVisualMode(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                visualMode === item.id
                  ? 'bg-[#00E5FF] text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {habits.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-[#0D1424] border border-slate-800 p-8">
          <Droplet className="w-12 h-12 mx-auto text-slate-600 mb-3 stroke-1" />
          <h3 className="text-base font-bold text-white">Hali odatlar kiritilmagan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Suv ichish, kitob o‘qish yoki sport kabi kunlik foydali odatlarni qo‘shib, intizom zanjirini yarating.
          </p>
          <button
            onClick={() => onOpenQuickAdd('habit')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Birinchi odatni qo‘shish</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. PROGRESS MODE (Cards with daily logger) */}
          {visualMode === 'progress' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.habitsWithStreaks.map((h) => {
                const habitItem = habits.find((hb) => hb.id === h.id)!;
                const pct = Math.min(100, Math.round((h.todayValue / h.targetValue) * 100));

                return (
                  <div
                    key={h.id}
                    className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                          {h.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{h.title}</h3>
                            {h.currentStreak > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-purple-400" />
                                {h.currentStreak} kun
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Kunlik maqsad: {h.targetValue} {h.unit} • 30-kunlik intizom: {h.consistency}%
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteHabit(h.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Bugungi ko‘rsatkich:</span>
                        <span className="font-mono font-bold text-white">
                          {h.todayValue} / {h.targetValue} {h.unit} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            h.isCompletedToday
                              ? 'bg-emerald-400 shadow-sm shadow-emerald-400/30'
                              : 'bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Interactive Logger Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateLog(h.id, h.todayValue, -1, h.targetValue)}
                          disabled={h.todayValue <= 0}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-30 cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleUpdateLog(h.id, h.todayValue, 1, h.targetValue)}
                          className="px-4 py-1.5 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold transition-colors cursor-pointer"
                        >
                          +1 {h.unit}
                        </button>
                        {h.targetValue >= 10 && (
                          <button
                            onClick={() => handleUpdateLog(h.id, h.todayValue, 5, h.targetValue)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
                          >
                            +5
                          </button>
                        )}
                      </div>

                      {h.isCompletedToday ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Bajarildi
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setHabitLog(h.id, today, h.targetValue, true)
                          }
                          className="text-xs text-slate-400 hover:text-[#00E5FF] transition-colors cursor-pointer"
                        >
                          To‘liq belgilash
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. GITHUB-STYLE HEATMAP MODE */}
          {visualMode === 'heatmap' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  GitHub uslubidagi faollik xaritasi (Oxirgi 70 kun)
                </h3>
                <p className="text-xs text-slate-400">
                  Har bir kvadrat bir kunlik intizomni bildiradi: yashil qanchalik yorqin bo‘lsa, maqsad shunchalik to‘liq bajarilgan.
                </p>
              </div>

              <div className="space-y-6">
                {habits.map((habit) => {
                  const logs = habitLogs.filter((l) => l.habitId === habit.id);
                  const logMap = new Map<string, number>();
                  logs.forEach((l) => logMap.set(l.date, l.value));

                  return (
                    <div key={habit.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span className="flex items-center gap-2">
                          <span className="text-base">{habit.icon}</span>
                          <span>{habit.title}</span>
                        </span>
                        <span className="text-slate-400 font-mono">
                          Maqsad: {habit.targetValue} {habit.unit}
                        </span>
                      </div>

                      {/* Heatmap Grid */}
                      <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                        {heatmapDates.map((d) => {
                          const val = logMap.get(d) || 0;
                          const ratio = Math.min(1, val / habit.targetValue);
                          let bgClass = 'bg-slate-800/60';
                          if (ratio >= 1) bgClass = 'bg-emerald-400 shadow-sm shadow-emerald-400/20';
                          else if (ratio >= 0.6) bgClass = 'bg-emerald-600/80';
                          else if (ratio > 0) bgClass = 'bg-emerald-900/60';

                          return (
                            <div
                              key={d}
                              className={`w-3.5 h-3.5 rounded-sm transition-all ${bgClass}`}
                              title={`${formatUzbekDate(d, false)}: ${val} / ${habit.targetValue} ${habit.unit}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. STREAK LEADERBOARD MODE */}
          {visualMode === 'streak' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Odatlar barqarorligi va zanjirlari (Streak reytingi)
              </h3>
              <div className="divide-y divide-slate-800/60">
                {stats.habitsWithStreaks
                  .slice()
                  .sort((a, b) => b.currentStreak - a.currentStreak)
                  .map((h, idx) => (
                    <div
                      key={h.id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-mono font-bold text-slate-500 text-sm">
                          #{idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                          {h.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{h.title}</div>
                          <div className="text-xs text-slate-400">
                            Eng yaxshi rekord: {h.bestStreak} kun • 30-kunlik intizom: {h.consistency}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 font-mono font-bold text-sm flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-purple-400" />
                          <span>{h.currentStreak} kun</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 4. TABLE MODE */}
          {visualMode === 'table' && (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Odat</th>
                    <th className="p-4">Kunlik maqsad</th>
                    <th className="p-4">Bugungi ko‘rsatkich</th>
                    <th className="p-4">Joriy streak</th>
                    <th className="p-4">Eng yaxshi streak</th>
                    <th className="p-4">Intizom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.habitsWithStreaks.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 flex items-center gap-2 font-bold text-white">
                        <span>{h.icon}</span>
                        <span>{h.title}</span>
                      </td>
                      <td className="p-4 font-mono">
                        {h.targetValue} {h.unit}
                      </td>
                      <td className="p-4 font-mono">
                        <span className={h.isCompletedToday ? 'text-emerald-400 font-bold' : ''}>
                          {h.todayValue} {h.unit}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-purple-400 font-bold">
                        {h.currentStreak} kun
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {h.bestStreak} kun
                      </td>
                      <td className="p-4 font-mono text-[#00E5FF] font-bold">
                        {h.consistency}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
