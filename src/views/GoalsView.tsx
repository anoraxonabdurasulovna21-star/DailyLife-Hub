import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Sparkles,
  Edit2,
} from 'lucide-react';
import { Goal, GoalPeriod } from '../types';
import { getGoals, addGoal, updateGoal, deleteGoal } from '../services/storage';
import { formatUzbekDate, getTodayString } from '../utils/dateUtils';

interface GoalsViewProps {
  onOpenQuickAdd: (tab?: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ onOpenQuickAdd }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<GoalPeriod | 'all'>('all');
  const goals = getGoals();
  const today = getTodayString();

  const filteredGoals = goals.filter((g) => {
    if (selectedPeriod === 'all') return true;
    return g.period === selectedPeriod;
  });

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.isCompleted || g.currentValue >= g.targetValue).length;
  const averageProgress =
    totalGoals > 0
      ? Math.round(
          goals.reduce(
            (acc, g) =>
              acc + Math.min(100, (g.currentValue / (g.targetValue || 1)) * 100),
            0
          ) / totalGoals
        )
      : 0;

  const handleIncrement = (goal: Goal, amount: number) => {
    const nextVal = Math.max(0, goal.currentValue + amount);
    const isNowCompleted = nextVal >= goal.targetValue;
    updateGoal(goal.id, {
      currentValue: nextVal,
      isCompleted: isNowCompleted,
      achievedDate: isNowCompleted ? today : undefined,
    });
  };

  const periods: { id: GoalPeriod | 'all'; label: string }[] = [
    { id: 'all', label: 'Barchasi' },
    { id: 'daily', label: 'Kunlik' },
    { id: 'weekly', label: 'Haftalik' },
    { id: 'monthly', label: 'Oylik' },
    { id: 'yearly', label: 'Yillik' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Summary Banner */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-purple-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>Strategik maqsadlar va marralar</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Katta natijalar har kuni qo‘yiladigan kichik qadamlardan boshlanadi
            </p>
          </div>
          <button
            onClick={() => onOpenQuickAdd('goal')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20 hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Maqsad qo‘shish</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase">Jami maqsadlar</span>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {totalGoals}
            </div>
            <span className="text-[11px] text-slate-400">Faol rejalashtirilgan</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase">Erishilgan marralar</span>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
              {completedGoals}
            </div>
            <span className="text-[11px] text-slate-400">100% muvaffaqiyatli</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-[#00E5FF] uppercase">O‘rtacha progress</span>
            <div className="text-2xl font-mono font-extrabold text-[#00E5FF] mt-1">
              {averageProgress}%
            </div>
            <span className="text-[11px] text-slate-400">Barcha davrlar bo‘yicha</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPeriod(p.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedPeriod === p.id
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-3xl bg-[#0D1424] border border-slate-800 p-8">
            <Target className="w-12 h-12 mx-auto text-slate-600 mb-3 stroke-1" />
            <h3 className="text-base font-bold text-white">Hozircha maqsadlar yo‘q</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Kunlik, haftalik, oylik yoki yillik maqsadlaringizni belgilang va yutuqlaringizni kuzating.
            </p>
            <button
              onClick={() => onOpenQuickAdd('goal')}
              className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-600/20 hover:opacity-95 cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yangi maqsad qo‘shish</span>
            </button>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100));
            const isFinished = goal.isCompleted || goal.currentValue >= goal.targetValue;

            return (
              <div
                key={goal.id}
                className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 uppercase tracking-wider">
                      {goal.period === 'daily'
                        ? 'Kunlik'
                        : goal.period === 'weekly'
                        ? 'Haftalik'
                        : goal.period === 'monthly'
                        ? 'Oylik'
                        : 'Yillik'}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Joriy natija:</span>
                    <span className="font-mono font-bold text-white">
                      {goal.currentValue} / {goal.targetValue} {goal.unit} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFinished
                          ? 'bg-emerald-400'
                          : 'bg-gradient-to-r from-purple-500 to-[#00E5FF]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Action buttons to quickly log progress */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleIncrement(goal, -1)}
                      disabled={goal.currentValue <= 0}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 disabled:opacity-40"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleIncrement(goal, 1)}
                      className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold text-xs"
                    >
                      +1 {goal.unit}
                    </button>
                    <button
                      onClick={() => handleIncrement(goal, 5)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300"
                    >
                      +5
                    </button>
                  </div>

                  {isFinished && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Erishildi!
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
