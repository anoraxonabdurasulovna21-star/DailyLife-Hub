import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Calendar,
  Layers,
  List,
  Edit2,
  Tag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../types';
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from '../services/storage';
import {
  formatUzbekDate,
  getTodayString,
  getCurrentTimeString,
  calculateTaskTiming,
  getCurrentWeekRange,
} from '../utils/dateUtils';
import { calculateTaskStats } from '../services/analyticsEngine';

interface TasksViewProps {
  onOpenQuickAdd: (tab?: string) => void;
}

type ViewMode = 'list' | 'kanban';
type FilterType =
  | 'all'
  | 'today'
  | 'week'
  | 'completed'
  | 'uncompleted'
  | 'overdue'
  | 'urgent';

export const TasksView: React.FC<TasksViewProps> = ({ onOpenQuickAdd }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasks = getTasks();
  const today = getTodayString();
  const weekRange = getCurrentWeekRange();
  const currentTime = getCurrentTimeString();

  // Task performance analytics
  const stats = calculateTaskStats(tasks);

  // Toggle completion
  const handleToggleComplete = (task: Task) => {
    const isCompleted = task.status === 'bajarildi';
    if (!isCompleted) {
      updateTask(task.id, {
        status: 'bajarildi',
        completedDate: today,
        completedTime: currentTime,
      });
    } else {
      updateTask(task.id, {
        status: 'boshlanmagan',
        completedDate: undefined,
        completedTime: undefined,
      });
    }
  };

  // Change status in Kanban
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === 'bajarildi') {
      updateTask(taskId, {
        status: newStatus,
        completedDate: today,
        completedTime: currentTime,
      });
    } else {
      updateTask(taskId, {
        status: newStatus,
        completedDate: undefined,
        completedTime: undefined,
      });
    }
  };

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Filter
    if (filter === 'today') {
      return t.plannedDate === today;
    }
    if (filter === 'week') {
      return t.plannedDate >= weekRange.start && t.plannedDate <= weekRange.end;
    }
    if (filter === 'completed') {
      return t.status === 'bajarildi';
    }
    if (filter === 'uncompleted') {
      return t.status !== 'bajarildi';
    }
    if (filter === 'overdue') {
      return t.status === 'muddati_otgan' || (t.plannedDate < today && t.status !== 'bajarildi');
    }
    if (filter === 'urgent') {
      return t.priority === 'juda_muhim' || t.priority === 'yuqori';
    }
    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'juda_muhim':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Juda muhim</span>;
      case 'yuqori':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Yuqori</span>;
      case 'orta':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">O‘rta</span>;
      case 'past':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">Past</span>;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'bajarildi':
        return 'Bajarildi';
      case 'jarayonda':
        return 'Jarayonda';
      case 'boshlanmagan':
        return 'Boshlanmagan';
      case 'muddati_otgan':
        return 'Muddati o‘tgan';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Performance Analytics Dashboard Card */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-cyan-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
              <span>Vazifalar unumdorligi tahlili</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reja va real bajarilish muddatlari o‘rtasidagi taqqoslama
            </p>
          </div>
          <button
            onClick={() => onOpenQuickAdd('task')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Vazifa qo‘shish</span>
          </button>
        </div>

        {/* Analytics stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Bajarilish darajasi</span>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {stats.completionRate}%
            </div>
            <span className="text-[10px] text-slate-400">
              {stats.completed} / {stats.total} vazifa
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-bold text-emerald-400 uppercase">Oldin bajarilgan</span>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
              {stats.earlyRate}%
            </div>
            <span className="text-[10px] text-slate-400">
              {stats.earlyCount} ta muddatidan oldin
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-bold text-[#00E5FF] uppercase">O‘z vaqtida</span>
            <div className="text-2xl font-mono font-extrabold text-[#00E5FF] mt-1">
              {stats.onTimeRate}%
            </div>
            <span className="text-[10px] text-slate-400">
              {stats.onTimeCount} ta reja bo‘yicha
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 uppercase">Kechikkan</span>
            <div className="text-2xl font-mono font-extrabold text-amber-400 mt-1">
              {stats.lateRate}%
            </div>
            <span className="text-[10px] text-slate-400">
              {stats.lateCount} ta kechikkan
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">O‘rtacha kechikish</span>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {stats.avgDelayMinutes > 0 ? `${Math.round(stats.avgDelayMinutes / 60)} soat` : '0'}
            </div>
            <span className="text-[10px] text-slate-400">
              Kechikkan topshiriqlarda
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar: Views & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all' as FilterType, label: 'Barchasi' },
            { id: 'today' as FilterType, label: 'Bugun' },
            { id: 'week' as FilterType, label: 'Hafta' },
            { id: 'urgent' as FilterType, label: 'Muhim' },
            { id: 'uncompleted' as FilterType, label: 'Bajarilmagan' },
            { id: 'completed' as FilterType, label: 'Bajarilgan' },
            { id: 'overdue' as FilterType, label: 'Muddati o‘tgan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === item.id
                  ? 'bg-[#00E5FF] text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* View Switcher: List vs Kanban */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Vazifalardan qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
          />
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-[#00E5FF]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ro‘yxat ko‘rinishi"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-slate-800 text-[#00E5FF]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban doskasi"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: List View or Kanban View */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-[#0D1424] border border-slate-800 p-8">
              <CheckSquare className="w-12 h-12 mx-auto text-slate-600 mb-3 stroke-1" />
              <h3 className="text-base font-bold text-white">Hali vazifalar mavjud emas</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Birinchi vazifangizni qo‘shib, kuningizni tartibli va samarali rejalashtiring.
              </p>
              <button
                onClick={() => onOpenQuickAdd('task')}
                className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Vazifa qo‘shish</span>
              </button>
            </div>
          ) : (
            filteredTasks.map((t) => {
              const isCompleted = t.status === 'bajarildi';
              const timing = t.completedDate
                ? calculateTaskTiming(t.plannedDate, t.plannedTime, t.completedDate, t.completedTime)
                : null;

              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-slate-950/60 border-slate-800/80 opacity-80'
                      : 'glass-panel border-slate-800 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(t)}
                        className={`w-6 h-6 rounded-xl border mt-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isCompleted
                            ? 'bg-[#00E5FF] border-[#00E5FF] text-slate-950'
                            : 'border-slate-600 hover:border-[#00E5FF]'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-bold ${
                              isCompleted ? 'line-through text-slate-500' : 'text-white'
                            }`}
                          >
                            {t.title}
                          </span>
                          {getPriorityBadge(t.priority)}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                            {t.category}
                          </span>
                        </div>

                        {t.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {t.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {formatUzbekDate(t.plannedDate, false)} {t.plannedTime || ''}
                          </span>
                          {t.estimatedMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              {t.estimatedMinutes} daqiqa
                            </span>
                          )}
                          {t.tags && t.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-slate-500" />
                              {t.tags.map((tag, idx) => (
                                <span key={idx} className="text-cyan-400 font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Performance timing status or actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {timing && (
                        <div
                          className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${
                            timing.status === 'early'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : timing.status === 'on_time'
                              ? 'bg-cyan-500/15 text-[#00E5FF] border-cyan-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {timing.text}
                        </div>
                      )}
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'boshlanmagan' as TaskStatus, title: 'Boshlanmagan', color: 'border-slate-700' },
            { id: 'jarayonda' as TaskStatus, title: 'Jarayonda', color: 'border-cyan-500/40' },
            { id: 'bajarildi' as TaskStatus, title: 'Bajarildi', color: 'border-emerald-500/40' },
          ].map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="rounded-3xl bg-[#0D1424] border border-slate-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{col.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 min-h-64">
                  {colTasks.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      Bu holatda vazifalar yo‘q
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {t.category}
                          </span>
                          {getPriorityBadge(t.priority)}
                        </div>
                        <div className="text-sm font-bold text-white">{t.title}</div>
                        {t.description && (
                          <div className="text-xs text-slate-400 line-clamp-2">
                            {t.description}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                          <span className="text-slate-400 font-mono">
                            {formatUzbekDate(t.plannedDate, false)}
                          </span>
                          <div className="flex items-center gap-1">
                            {col.id !== 'boshlanmagan' && (
                              <button
                                onClick={() => handleStatusChange(t.id, 'boshlanmagan')}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                              >
                                ← Kutilmoqda
                              </button>
                            )}
                            {col.id !== 'jarayonda' && (
                              <button
                                onClick={() => handleStatusChange(t.id, 'jarayonda')}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-[#00E5FF]"
                              >
                                Jarayonda
                              </button>
                            )}
                            {col.id !== 'bajarildi' && (
                              <button
                                onClick={() => handleStatusChange(t.id, 'bajarildi')}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400"
                              >
                                ✓ Bajarildi
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
