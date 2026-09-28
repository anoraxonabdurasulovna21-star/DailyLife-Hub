import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  CheckSquare,
  Target,
  Wallet,
  Droplet,
  FileText,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import {
  getTasks,
  getGoals,
  getTransactions,
  getNotes,
  getHabits,
  getAssignments,
  getClassSchedules,
} from '../services/storage';
import { NavSection } from './Sidebar';
import { formatUzbekDate } from '../utils/dateUtils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavSection) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search through all entities
  const tasks = getTasks();
  const goals = getGoals();
  const transactions = getTransactions();
  const notes = getNotes();
  const habits = getHabits();
  const assignments = getAssignments();
  const classes = getClassSchedules();

  const matchingTasks = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    : [];

  const matchingGoals = q
    ? goals.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q)
      )
    : [];

  const matchingFinance = q
    ? transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    : [];

  const matchingNotes = q
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    : [];

  const matchingHabits = q
    ? habits.filter((h) => h.title.toLowerCase().includes(q))
    : [];

  const matchingStudy = q
    ? [
        ...assignments
          .filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.subjectName.toLowerCase().includes(q)
          )
          .map((a) => ({
            type: 'assignment',
            title: a.title,
            subtitle: `${a.subjectName} — Deadline: ${formatUzbekDate(a.deadlineDate, false)}`,
          })),
        ...classes
          .filter(
            (c) =>
              c.subjectName.toLowerCase().includes(q) ||
              c.teacher?.toLowerCase().includes(q) ||
              c.room?.toLowerCase().includes(q)
          )
          .map((c) => ({
            type: 'class',
            title: c.subjectName,
            subtitle: `${c.teacher || 'O‘qituvchi'} — Xona: ${c.room || '-'}`,
          })),
      ]
    : [];

  const totalResults =
    matchingTasks.length +
    matchingGoals.length +
    matchingFinance.length +
    matchingNotes.length +
    matchingHabits.length +
    matchingStudy.length;

  const handleSelect = (section: NavSection) => {
    onNavigate(section);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#070B14]/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0D1424] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#00E5FF] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tizim bo‘yicha qidiring (masalan: Dasturlash, Kitob, Tushlik)..."
            className="w-full bg-transparent border-none text-white text-base placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto divide-y divide-slate-800/60 space-y-4">
          {!q ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-500 stroke-1" />
              <p className="text-sm font-medium">Qidiruv so‘zini kiriting</p>
              <p className="text-xs text-slate-500">
                Vazifalar, maqsadlar, xarajatlar, darslar, odatlar va qaydlar bo‘ylab qidiring.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium">"{query}" bo‘yicha hech narsa topilmadi.</p>
              <p className="text-xs text-slate-500 mt-1">
                Boshqa kalit so‘z bilan qayta urinib ko‘ring.
              </p>
            </div>
          ) : (
            <>
              {/* Tasks Results */}
              {matchingTasks.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Vazifalar ({matchingTasks.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelect('tasks')}
                        className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-[#00E5FF]">
                            {t.title}
                          </div>
                          <div className="text-xs text-slate-400">
                            {t.category} • {formatUzbekDate(t.plannedDate, false)}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00E5FF]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals Results */}
              {matchingGoals.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-purple-400" />
                    <span>Maqsadlar ({matchingGoals.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingGoals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => handleSelect('goals')}
                        className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-purple-400">
                            {g.title}
                          </div>
                          <div className="text-xs text-slate-400">
                            {g.currentValue} / {g.targetValue} {g.unit}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Finance Results */}
              {matchingFinance.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Moliya ({matchingFinance.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingFinance.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => handleSelect('finance')}
                        className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-emerald-400">
                            {f.description}
                          </div>
                          <div className="text-xs text-slate-400">
                            {f.category} • {formatUzbekDate(f.date, false)}
                          </div>
                        </div>
                        <div className="font-mono text-sm font-bold text-white">
                          {f.type === 'daromad' ? '+' : '-'}
                          {f.amount.toLocaleString()} so‘m
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Results */}
              {matchingNotes.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Qaydlar ({matchingNotes.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingNotes.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleSelect('notes')}
                        className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-amber-400">
                            {n.title}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">{n.content}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study & Classes Results */}
              {matchingStudy.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>O‘qish va darslar ({matchingStudy.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingStudy.map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelect('study')}
                        className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-cyan-400">
                            {s.title}
                          </div>
                          <div className="text-xs text-slate-400">{s.subtitle}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
