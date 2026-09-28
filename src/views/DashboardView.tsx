import React from 'react';
import {
  CheckSquare,
  Clock,
  Wallet,
  Droplet,
  BookOpen,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Plus,
  Flame,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  getTasks,
  getHabits,
  getHabitLogs,
  getGoals,
  getTransactions,
  getStudySessions,
  getAssignments,
  getClassSchedules,
  getExams,
  updateTask,
  setHabitLog,
} from '../services/storage';
import { NavSection } from '../components/Sidebar';
import { User, Task, Habit } from '../types';
import {
  getTodayString,
  formatUzbekDate,
  getGreeting,
  getUzbekDayName,
} from '../utils/dateUtils';
import {
  calculateDailyProgress,
  calculateFinanceStats,
  calculateHabitStats,
  calculateStudyStats,
} from '../services/analyticsEngine';

interface DashboardViewProps {
  user: User | null;
  onNavigate: (section: NavSection) => void;
  onOpenQuickAdd: (defaultTab?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
  onOpenQuickAdd,
}) => {
  const today = getTodayString();
  const userName = user?.name || '';
  const greeting = getGreeting(userName);
  const formattedToday = formatUzbekDate(today, true);
  const dayName = getUzbekDayName(today);

  // Entities from storage
  const tasks = getTasks();
  const habits = getHabits();
  const habitLogs = getHabitLogs();
  const goals = getGoals();
  const transactions = getTransactions();
  const studySessions = getStudySessions();
  const assignments = getAssignments();
  const classes = getClassSchedules();
  const exams = getExams();

  // Progress calculations
  const progress = calculateDailyProgress(
    today,
    tasks,
    habits,
    habitLogs,
    goals,
    studySessions
  );

  const financeStats = calculateFinanceStats(transactions, today, today);
  const habitStats = calculateHabitStats(habits, habitLogs, today);
  const studyStats = calculateStudyStats(studySessions, today, today);

  // Filter today's specific items
  const todayTasks = tasks.filter(
    (t) => t.plannedDate === today || t.status === 'jarayonda'
  );
  const urgentTasks = todayTasks.filter(
    (t) => (t.priority === 'juda_muhim' || t.priority === 'yuqori') && t.status !== 'bajarildi'
  );

  // Upcoming deadlines
  const upcomingAssignments = assignments
    .filter((a) => a.status === 'kutilmoqda' && a.deadlineDate >= today)
    .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));

  // Today's classes
  const jsDay = new Date().getDay(); // 0 is Sunday, 1 is Monday
  const todayDayOfWeek = jsDay === 0 ? 7 : jsDay;
  const todayClasses = classes
    .filter((c) => c.dayOfWeek === todayDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Nearest upcoming exam
  const upcomingExams = exams
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Quick habit increment
  const handleQuickHabitIncrement = (habit: Habit, currentVal: number) => {
    const nextVal = currentVal + 1;
    setHabitLog(habit.id, today, nextVal, nextVal >= habit.targetValue);
  };

  // Toggle task complete
  const handleToggleTask = (task: Task) => {
    const isCompleted = task.status === 'bajarildi';
    const nextStatus = isCompleted ? 'boshlanmagan' : 'bajarildi';
    updateTask(task.id, {
      status: nextStatus,
      completedDate: !isCompleted ? today : undefined,
      completedTime: !isCompleted ? new Date().toTimeString().slice(0, 5) : undefined,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0D1424] via-[#0F1C36] to-[#0D1424] border border-cyan-500/20 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#00E5FF] tracking-wider uppercase mb-1">
              {dayName} • {formattedToday}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Bugun ajoyib natijalar va yangi marralar sari qadam tashlash uchun eng yaxshi fursat!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQuickAdd('task')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Vazifa qo‘shish</span>
            </button>
            <button
              onClick={() => onNavigate('statistics')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
              <span>Tahlillar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Progress Ring & Smart Daily Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BUGUNGI NATIJA Circular Progress */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Bugungi natija
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00E5FF]">
              Dinamik
            </span>
          </div>

          {/* Dynamic Circular SVG indicator */}
          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800/80 fill-none"
                  strokeWidth="8"
                />
                {progress.hasData && (
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-[#00E5FF] fill-none transition-all duration-700 ease-out"
                    strokeWidth="8"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * progress.score) / 100}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                {progress.hasData ? (
                  <>
                    <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                      {progress.score}%
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Bajarildi
                    </span>
                  </>
                ) : (
                  <div className="px-2">
                    <span className="text-xs font-semibold text-slate-400 leading-tight">
                      Ma'lumot mavjud emas
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Reja qo‘shing</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub progress breakdowns */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#00E5FF]" />
                Vazifalar
              </span>
              <span className="font-mono font-semibold">
                {progress.taskPart.completed} / {progress.taskPart.total}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                Odatlar
              </span>
              <span className="font-mono font-semibold">
                {progress.habitPart.completed} / {progress.habitPart.total}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                O‘qish vaqti
              </span>
              <span className="font-mono font-semibold">
                {progress.studyPart.minutes} daqiqa
              </span>
            </div>
          </div>
        </div>

        {/* BUGUNGI FOKUS (Smart Daily Focus) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Bugungi asosiy e'tibor (Smart Focus)
                </h2>
              </div>
              <span className="text-xs text-slate-400">Avtomatik saralangan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Focus Item 1: Urgent task */}
              {urgentTasks.length > 0 ? (
                <div
                  onClick={() => onNavigate('tasks')}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Muhim topshiriq
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {urgentTasks[0].plannedTime || 'Bugun'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {urgentTasks[0].title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {urgentTasks[0].description || 'Tafsilotlar uchun bosing'}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Bugun uchun kechiktirib bo‘lmas shoshilinch vazifalar yo‘q!</span>
                </div>
              )}

              {/* Focus Item 2: Imminent assignment / deadline */}
              {upcomingAssignments.length > 0 ? (
                <div
                  onClick={() => onNavigate('study')}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-[#00E5FF] font-semibold mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Yaqin deadline
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatUzbekDate(upcomingAssignments[0].deadlineDate, false)}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors line-clamp-1">
                    {upcomingAssignments[0].title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {upcomingAssignments[0].subjectName}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Yaqin orada topshirilishi kerak bo‘lgan deadline yo‘q.</span>
                </div>
              )}

              {/* Focus Item 3: Today's water & habit challenge */}
              {habits.length > 0 ? (
                <div
                  onClick={() => onNavigate('habits')}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-1">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      Odatlar zanjiri
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {habitStats.bestHabit ? `Streak: ${habitStats.bestHabit.streak} kun` : 'Intizom'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {habits[0].icon} {habits[0].title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Kunlik reja: {habits[0].targetValue} {habits[0].unit}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                  <Droplet className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>Odatlar hali qo‘shilmagan. Birinchi odatingizni kiriting!</span>
                </div>
              )}

              {/* Focus Item 4: Upcoming Exam */}
              {upcomingExams.length > 0 ? (
                <div
                  onClick={() => onNavigate('study')}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-rose-400 font-semibold mb-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Yaqin imtihon
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatUzbekDate(upcomingExams[0].date, false)}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                    {upcomingExams[0].subjectName}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Tayyorgarlik: {upcomingExams[0].preparationProgress}%
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Yaqin kunlarda imtihonlar rejalashtirilmagan.</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Ma'lumotlar real vaqt rejimida avtomatik hisoblanadi.</span>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>Barcha vazifalar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: MUHIM VAZIFALAR */}
        <div
          onClick={() => onNavigate('tasks')}
          className="glass-panel-interactive p-5 rounded-2xl border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Vazifalar</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-[#00E5FF]">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {todayTasks.filter((t) => t.status === 'bajarildi').length} / {todayTasks.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {urgentTasks.length > 0 ? `${urgentTasks.length} ta muhim vazifa qoldi` : 'Barcha muhimlar bajarildi'}
          </p>
        </div>

        {/* CARD 2: BUGUNGI MOLIYA */}
        <div
          onClick={() => onNavigate('finance')}
          className="glass-panel-interactive p-5 rounded-2xl border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Bugungi moliya</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {financeStats.totalExpenses.toLocaleString()} <span className="text-xs font-normal text-slate-400">so‘m</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span>Daromad: {financeStats.totalIncome.toLocaleString()}</span>
            <span className={financeStats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              Qoldiq: {financeStats.balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* CARD 3: ODATLAR & SUV */}
        <div
          onClick={() => onNavigate('habits')}
          className="glass-panel-interactive p-5 rounded-2xl border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Odatlar va suv</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {habitStats.habitsWithStreaks.filter((h) => h.isCompletedToday).length} / {habits.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Intizom ko‘rsatkichi: {habitStats.averageConsistency}%
          </p>
        </div>

        {/* CARD 4: O‘QISH VA POMODORO */}
        <div
          onClick={() => onNavigate('study')}
          className="glass-panel-interactive p-5 rounded-2xl border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">O‘qish vaqti</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {studyStats.totalMinutes} <span className="text-xs font-normal text-slate-400">daqiqa</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {todayClasses.length > 0 ? `Bugun ${todayClasses.length} ta dars jadvalda` : 'Bugun darslar yo‘q'}
          </p>
        </div>
      </div>

      {/* Quick Action Lists: Tasks & Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks Quick Check */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="font-bold text-sm text-white">Bugungi vazifalar</h3>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-[#00E5FF] hover:underline"
            >
              Barchasini ko‘rish
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <p>Bugun uchun vazifalar rejalashtirilmagan.</p>
                <button
                  onClick={() => onOpenQuickAdd('task')}
                  className="mt-2 text-[#00E5FF] font-semibold hover:underline"
                >
                  + Birinchi vazifani qo‘shish
                </button>
              </div>
            ) : (
              todayTasks.map((t) => (
                <div
                  key={t.id}
                  className="py-2.5 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      onClick={() => handleToggleTask(t)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        t.status === 'bajarildi'
                          ? 'bg-[#00E5FF] border-[#00E5FF] text-slate-950'
                          : 'border-slate-600 hover:border-[#00E5FF]'
                      }`}
                    >
                      {t.status === 'bajarildi' && (
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                    </button>
                    <div className="truncate">
                      <div
                        className={`text-sm font-medium truncate ${
                          t.status === 'bajarildi'
                            ? 'line-through text-slate-500'
                            : 'text-white'
                        }`}
                      >
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.plannedTime ? `${t.plannedTime} • ` : ''}
                        {t.category}
                      </div>
                    </div>
                  </div>
                  {t.priority === 'juda_muhim' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold shrink-0">
                      Muhim
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Schedule & Habits Quick Track */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Odatlar va kunlik maqsadlar</h3>
            </div>
            <button
              onClick={() => onNavigate('habits')}
              className="text-xs text-purple-400 hover:underline"
            >
              Odatlar bo‘limi
            </button>
          </div>

          <div className="space-y-3">
            {habits.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <p>Hali odatlar kiritilmagan.</p>
                <button
                  onClick={() => onOpenQuickAdd('habit')}
                  className="mt-2 text-[#00E5FF] font-semibold hover:underline"
                >
                  + Odat qo‘shish (Suv, Kitob, Sport...)
                </button>
              </div>
            ) : (
              habits.slice(0, 3).map((h) => {
                const log = habitLogs.find((l) => l.habitId === h.id && l.date === today);
                const currentVal = log?.value || 0;
                const isCompleted = currentVal >= h.targetValue;
                const pct = Math.min(100, Math.round((currentVal / h.targetValue) * 100));

                return (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                        {h.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{h.title}</div>
                        <div className="text-xs text-slate-400">
                          {currentVal} / {h.targetValue} {h.unit} ({pct}%)
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickHabitIncrement(h, currentVal)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-slate-950'
                      }`}
                    >
                      {isCompleted ? '✓ Bajarildi' : '+1 Qo‘shish'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
