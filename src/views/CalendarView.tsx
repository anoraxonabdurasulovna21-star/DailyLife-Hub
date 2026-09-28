import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  BookOpen,
  Clock,
  Wallet,
  Droplet,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import {
  getTasks,
  getAssignments,
  getExams,
  getClassSchedules,
  getTransactions,
  getHabitLogs,
  getReminders,
  getStudySessions,
} from '../services/storage';
import {
  formatUzbekDate,
  getTodayString,
  UZBEK_MONTHS,
  UZBEK_DAYS,
  shiftDate,
} from '../utils/dateUtils';
import { NavSection } from '../components/Sidebar';

interface CalendarViewProps {
  onNavigate: (section: NavSection) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onNavigate }) => {
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Month navigation state
  const [currentYear, setCurrentYear] = useState<number>(() => parseInt(today.split('-')[0], 10));
  const [currentMonth, setCurrentMonth] = useState<number>(() => parseInt(today.split('-')[1], 10) - 1);

  // All entities for aggregation
  const tasks = getTasks();
  const assignments = getAssignments();
  const exams = getExams();
  const classes = getClassSchedules();
  const transactions = getTransactions();
  const habitLogs = getHabitLogs();
  const reminders = getReminders();
  const studySessions = getStudySessions();

  // Navigate month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar matrix (Dushanba..Yakshanba)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  // Convert Sunday (0) to 7, Monday is 1
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const matrixDays: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = startDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthDaysCount - i;
    const prevM = currentMonth === 0 ? 12 : currentMonth;
    const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    matrixDays.push({ dayNumber: dayNum, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    matrixDays.push({ dayNumber: d, dateStr, isCurrentMonth: true });
  }

  // Next month leading days to complete full grid of 35 or 42
  const remaining = (7 - (matrixDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextM = currentMonth === 11 ? 1 : currentMonth + 2;
    const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    matrixDays.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  // Get data for selected date
  const selTasks = tasks.filter((t) => t.plannedDate === selectedDate || t.completedDate === selectedDate);
  const selAssignments = assignments.filter((a) => a.deadlineDate === selectedDate);
  const selExams = exams.filter((e) => e.date === selectedDate);
  const selTransactions = transactions.filter((t) => t.date === selectedDate);
  const selHabitLogs = habitLogs.filter((l) => l.date === selectedDate && l.isCompleted);
  const selReminders = reminders.filter((r) => r.date === selectedDate);
  const selStudySessions = studySessions.filter((s) => s.date === selectedDate);

  // Classes on selected date day of week
  const [sY, sM, sD] = selectedDate.split('-').map(Number);
  const selDayOfWeek = new Date(sY, sM - 1, sD).getDay();
  const normalizedDow = selDayOfWeek === 0 ? 7 : selDayOfWeek;
  const selClasses = classes.filter((c) => c.dayOfWeek === normalizedDow);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#00E5FF]" />
            <span>Yaxlit hayot taqvimi (Kalendar)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Barcha modullar integratsiyasi: vazifalar, darslar, topshiriqlar, imtihonlar va moliyaviy faollik
          </p>
        </div>
        <button
          onClick={() => {
            const now = new Date();
            setCurrentYear(now.getFullYear());
            setCurrentMonth(now.getMonth());
            setSelectedDate(today);
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-[#00E5FF] transition-all cursor-pointer shrink-0"
        >
          Bugunga qaytish
        </button>
      </div>

      {/* Main Grid: Calendar on Left, Selected Day Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month View Matrix */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          {/* Header Month Nav */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-base text-white">
              {UZBEK_MONTHS[currentMonth]}, {currentYear}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers (Dushanba -> Yakshanba) */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 py-1">
            <span>Dush</span>
            <span>Sesh</span>
            <span>Chor</span>
            <span>Pay</span>
            <span>Jum</span>
            <span>Shan</span>
            <span className="text-rose-400">Yak</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {matrixDays.map((item, idx) => {
              const isSelected = item.dateStr === selectedDate;
              const isToday = item.dateStr === today;

              // Indicators on this day
              const hasTasks = tasks.some((t) => t.plannedDate === item.dateStr);
              const hasAssignments = assignments.some((a) => a.deadlineDate === item.dateStr);
              const hasExams = exams.some((e) => e.date === item.dateStr);
              const hasFinance = transactions.some((t) => t.date === item.dateStr);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`min-h-[58px] p-1.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-[#00E5FF] shadow-sm shadow-cyan-500/20'
                      : isToday
                      ? 'bg-slate-900/90 border-cyan-500/40'
                      : item.isCurrentMonth
                      ? 'bg-slate-950/60 border-slate-850 hover:bg-slate-900/60 border-slate-800/80'
                      : 'bg-slate-950/20 border-transparent opacity-30'
                  }`}
                >
                  <span
                    className={`text-xs font-mono font-bold ${
                      isSelected
                        ? 'text-[#00E5FF]'
                        : isToday
                        ? 'text-cyan-400'
                        : item.isCurrentMonth
                        ? 'text-slate-200'
                        : 'text-slate-600'
                    }`}
                  >
                    {item.dayNumber}
                  </span>

                  {/* Indicator Dots */}
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    {hasTasks && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" title="Vazifa" />}
                    {hasAssignments && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Topshiriq" />}
                    {hasExams && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Imtihon" />}
                    {hasFinance && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Moliya" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]" /> Vazifa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Deadline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Imtihon
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Moliya
            </span>
          </div>
        </div>

        {/* Selected Day Agenda Detail */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <span className="text-[11px] font-bold text-[#00E5FF] uppercase tracking-wider">
              Tanlangan sana jadvali
            </span>
            <h3 className="text-lg font-extrabold text-white mt-0.5">
              {formatUzbekDate(selectedDate, true)}
            </h3>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 divide-y divide-slate-800/60">
            {/* TASKS */}
            {selTasks.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-[#00E5FF]">
                    <CheckSquare className="w-3.5 h-3.5" />
                    Vazifalar ({selTasks.length})
                  </span>
                  <button
                    onClick={() => onNavigate('tasks')}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Bo‘limga o‘tish →
                  </button>
                </div>
                {selTasks.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="font-bold text-white">{t.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {t.plannedTime || 'Vaqt belgilanmagan'} • {t.category}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DEADLINES */}
            {selAssignments.length > 0 && (
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Topshiriq va Deadline ({selAssignments.length})
                  </span>
                  <button
                    onClick={() => onNavigate('study')}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    O‘qish bo‘limi →
                  </button>
                </div>
                {selAssignments.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs">
                    <div className="font-bold text-amber-300">{a.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {a.subjectName} • Soat: {a.deadlineTime || '23:59'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EXAMS */}
            {selExams.length > 0 && (
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Imtihonlar ({selExams.length})
                  </span>
                </div>
                {selExams.map((e) => (
                  <div key={e.id} className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs">
                    <div className="font-bold text-rose-300">{e.subjectName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Soat: {e.time} • Xona: {e.location || 'Belgilanmagan'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CLASSES */}
            {selClasses.length > 0 && (
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Dars jadvali ({selClasses.length})
                  </span>
                </div>
                {selClasses.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="font-bold text-white">{c.subjectName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {c.startTime} - {c.endTime} • Xona: {c.room || '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FINANCE */}
            {selTransactions.length > 0 && (
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    Moliyaviy operatsiyalar ({selTransactions.length})
                  </span>
                </div>
                {selTransactions.map((tx) => (
                  <div key={tx.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{tx.description}</div>
                      <div className="text-[10px] text-slate-400">{tx.category} • {tx.time}</div>
                    </div>
                    <div className={`font-mono font-bold ${tx.type === 'daromad' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'daromad' ? '+' : '-'}{tx.amount.toLocaleString()} so‘m
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EMPTY STATE FOR SELECTED DAY */}
            {selTasks.length === 0 &&
              selAssignments.length === 0 &&
              selExams.length === 0 &&
              selClasses.length === 0 &&
              selTransactions.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  Bu kun uchun rejalashtirilgan voqealar yoki tranzaksiyalar mavjud emas.
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
