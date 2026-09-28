import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Target,
  ArrowDownLeft,
  ArrowUpRight,
  Droplet,
  FileText,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  addTask,
  addGoal,
  addTransaction,
  addHabit,
  addNote,
  addReminder,
  addClassSchedule,
  addAssignment,
  addStudySession,
  getSubjects,
} from '../services/storage';
import { Priority, TransactionType, FinanceCategory } from '../types';
import { getTodayString, getCurrentTimeString } from '../utils/dateUtils';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
  onCreated?: () => void;
}

type TabType =
  | 'task'
  | 'goal'
  | 'income'
  | 'expense'
  | 'habit'
  | 'note'
  | 'reminder'
  | 'class'
  | 'assignment'
  | 'session';

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'task',
  onCreated,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab as TabType);
  const subjects = getSubjects();
  const today = getTodayString();
  const currentTime = getCurrentTimeString();

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('O‘qish');
  const [taskPriority, setTaskPriority] = useState<Priority>('yuqori');
  const [taskPlannedDate, setTaskPlannedDate] = useState(today);
  const [taskPlannedTime, setTaskPlannedTime] = useState('18:00');
  const [taskEstimatedMins, setTaskEstimatedMins] = useState(45);
  const [taskTags, setTaskTags] = useState('Topshiriq');

  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTarget, setGoalTarget] = useState(10);
  const [goalUnit, setGoalUnit] = useState('ta');
  const [goalPeriod, setGoalPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Finance form state
  const [financeAmount, setFinanceAmount] = useState('');
  const [financeCategory, setFinanceCategory] = useState<FinanceCategory>('Oziq-ovqat');
  const [financeDesc, setFinanceDesc] = useState('');
  const [financeDate, setFinanceDate] = useState(today);
  const [financeMethod, setFinanceMethod] = useState<'Karta' | 'Naqd' | 'Bank'>('Karta');

  // Habit form state
  const [habitTitle, setHabitTitle] = useState('');
  const [habitIcon, setHabitIcon] = useState('💧');
  const [habitTarget, setHabitTarget] = useState(8);
  const [habitUnit, setHabitUnit] = useState('stakan');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('Muhim');

  // Reminder form state
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState(today);
  const [reminderTime, setReminderTime] = useState('15:00');
  const [reminderRepeat, setReminderRepeat] = useState<any>('once');

  // Class form state
  const [classSubject, setClassSubject] = useState(subjects[0]?.name || 'Web dasturlash');
  const [classTeacher, setClassTeacher] = useState('');
  const [classRoom, setClassRoom] = useState('');
  const [classDay, setClassDay] = useState(1);
  const [classStartTime, setClassStartTime] = useState('09:00');
  const [classEndTime, setClassEndTime] = useState('10:30');

  // Assignment form state
  const [assignTitle, setAssignTitle] = useState('');
  const [assignSubject, setAssignSubject] = useState(subjects[0]?.name || 'Web dasturlash');
  const [assignDeadline, setAssignDeadline] = useState(today);
  const [assignDeadlineTime, setAssignDeadlineTime] = useState('23:59');

  // Study session form state
  const [sessionSubject, setSessionSubject] = useState(subjects[0]?.name || 'Web dasturlash');
  const [sessionDuration, setSessionDuration] = useState(25);
  const [sessionNotes, setSessionNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'task') {
      if (!taskTitle.trim()) return;
      addTask({
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        category: taskCategory,
        priority: taskPriority,
        status: 'boshlanmagan',
        plannedDate: taskPlannedDate,
        plannedTime: taskPlannedTime,
        estimatedMinutes: Number(taskEstimatedMins) || 30,
        tags: taskTags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    } else if (activeTab === 'goal') {
      if (!goalTitle.trim()) return;
      addGoal({
        title: goalTitle.trim(),
        description: goalDesc.trim(),
        type: 'number',
        period: goalPeriod,
        startDate: today,
        endDate: today,
        targetValue: Number(goalTarget) || 1,
        currentValue: 0,
        unit: goalUnit.trim() || 'ta',
        isCompleted: false,
      });
    } else if (activeTab === 'income' || activeTab === 'expense') {
      const amt = Number(financeAmount);
      if (!amt || amt <= 0) return;
      addTransaction({
        type: activeTab === 'income' ? 'daromad' : 'xarajat',
        amount: amt,
        category: financeCategory,
        description: financeDesc.trim() || (activeTab === 'income' ? 'Daromad' : 'Xarajat'),
        date: financeDate || today,
        time: currentTime,
        paymentMethod: financeMethod,
      });
    } else if (activeTab === 'habit') {
      if (!habitTitle.trim()) return;
      addHabit({
        title: habitTitle.trim(),
        icon: habitIcon || '✨',
        targetValue: Number(habitTarget) || 1,
        unit: habitUnit.trim() || 'marta',
        frequency: 'daily',
        startDate: today,
      });
    } else if (activeTab === 'note') {
      if (!noteTitle.trim() && !noteContent.trim()) return;
      addNote({
        title: noteTitle.trim() || 'Nomsiz qayd',
        content: noteContent.trim(),
        tags: noteTags.split(',').map((t) => t.trim()).filter(Boolean),
        isPinned: false,
        isArchived: false,
      });
    } else if (activeTab === 'reminder') {
      if (!reminderTitle.trim()) return;
      addReminder({
        title: reminderTitle.trim(),
        date: reminderDate,
        time: reminderTime,
        repeat: reminderRepeat,
        priority: 'yuqori',
        isCompleted: false,
      });
    } else if (activeTab === 'class') {
      addClassSchedule({
        subjectId: subjects.find((s) => s.name === classSubject)?.id || 'sbj_custom',
        subjectName: classSubject,
        teacher: classTeacher.trim(),
        room: classRoom.trim(),
        dayOfWeek: Number(classDay),
        startTime: classStartTime,
        endTime: classEndTime,
      });
    } else if (activeTab === 'assignment') {
      if (!assignTitle.trim()) return;
      addAssignment({
        subjectName: assignSubject,
        title: assignTitle.trim(),
        deadlineDate: assignDeadline,
        deadlineTime: assignDeadlineTime,
        priority: 'juda_muhim',
        status: 'kutilmoqda',
      });
    } else if (activeTab === 'session') {
      addStudySession({
        subjectName: sessionSubject,
        date: today,
        startTime: currentTime,
        endTime: currentTime,
        durationMinutes: Number(sessionDuration) || 25,
        sessionType: 'pomodoro',
        notes: sessionNotes.trim(),
      });
    }

    if (onCreated) onCreated();
    onClose();
  };

  const tabs = [
    { id: 'task' as TabType, label: 'Vazifa', icon: CheckSquare },
    { id: 'goal' as TabType, label: 'Maqsad', icon: Target },
    { id: 'expense' as TabType, label: 'Xarajat', icon: ArrowUpRight },
    { id: 'income' as TabType, label: 'Daromad', icon: ArrowDownLeft },
    { id: 'habit' as TabType, label: 'Odat', icon: Droplet },
    { id: 'note' as TabType, label: 'Qayd', icon: FileText },
    { id: 'reminder' as TabType, label: 'Eslatma', icon: Clock },
    { id: 'assignment' as TabType, label: 'Deadline', icon: Calendar },
    { id: 'class' as TabType, label: 'Dars', icon: BookOpen },
    { id: 'session' as TabType, label: 'O‘qish', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B14]/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#0D1424] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6] flex items-center justify-center text-slate-950 font-bold">
              +
            </div>
            <h2 className="font-bold text-lg text-white">Yangi ma’lumot qo‘shish</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00E5FF] text-slate-950 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* TASK FORM */}
          {activeTab === 'task' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Vazifa nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Ma'lumotlar bazasi hisobotini topshirish"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tavsif</label>
                <textarea
                  rows={2}
                  placeholder="Batafsil izoh yoki topshiriq shartlari..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kategoriya
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="O‘qish">O‘qish</option>
                    <option value="Ish">Ish</option>
                    <option value="Shaxsiy">Shaxsiy</option>
                    <option value="Rivojlanish">Rivojlanish</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Muhimlik
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="past">Past</option>
                    <option value="orta">O‘rta</option>
                    <option value="yuqori">Yuqori</option>
                    <option value="juda_muhim">Juda muhim</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sana</label>
                  <input
                    type="date"
                    value={taskPlannedDate}
                    onChange={(e) => setTaskPlannedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vaqt</label>
                  <input
                    type="time"
                    value={taskPlannedTime}
                    onChange={(e) => setTaskPlannedTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* GOAL FORM */}
          {activeTab === 'goal' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Maqsad nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 20 ta yangi kitob o‘qish"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Maqsad qiymati
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    O‘lchov birligi
                  </label>
                  <input
                    type="text"
                    placeholder="kitob, soat, %"
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Davr</label>
                  <select
                    value={goalPeriod}
                    onChange={(e) => setGoalPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="daily">Kunlik</option>
                    <option value="weekly">Haftalik</option>
                    <option value="monthly">Oylik</option>
                    <option value="yearly">Yillik</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* FINANCE FORM (INCOME / EXPENSE) */}
          {(activeTab === 'income' || activeTab === 'expense') && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Summa (so‘m) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Masalan: 35000"
                  value={financeAmount}
                  onChange={(e) => setFinanceAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kategoriya
                  </label>
                  <select
                    value={financeCategory}
                    onChange={(e) => setFinanceCategory(e.target.value as FinanceCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="Oziq-ovqat">Oziq-ovqat</option>
                    <option value="Transport">Transport</option>
                    <option value="Ta'lim">Ta'lim</option>
                    <option value="Sog‘liq">Sog‘liq</option>
                    <option value="Xarid">Xarid</option>
                    <option value="Ko‘ngilochar">Ko‘ngilochar</option>
                    <option value="Uy-joy">Uy-joy</option>
                    <option value="Aloqa">Aloqa</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    To‘lov turi
                  </label>
                  <select
                    value={financeMethod}
                    onChange={(e) => setFinanceMethod(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  >
                    <option value="Karta">Plastik karta</option>
                    <option value="Naqd">Naqd pul</option>
                    <option value="Bank">Bank o‘tkazmasi</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Izoh</label>
                <input
                  type="text"
                  placeholder="Masalan: Tushlik yoki darslik uchun to‘lov"
                  value={financeDesc}
                  onChange={(e) => setFinanceDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* HABIT FORM */}
          {activeTab === 'habit' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Odat nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Kitob mutolaasi"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ikonka</label>
                  <input
                    type="text"
                    value={habitIcon}
                    onChange={(e) => setHabitIcon(e.target.value)}
                    className="w-full px-3 py-2 text-center rounded-xl bg-slate-950 border border-slate-700 text-lg text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kunlik maqsad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={habitTarget}
                    onChange={(e) => setHabitTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Birlik
                  </label>
                  <input
                    type="text"
                    placeholder="stakan, sahifa"
                    value={habitUnit}
                    onChange={(e) => setHabitUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* NOTE FORM */}
          {activeTab === 'note' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sarlavha</label>
                <input
                  type="text"
                  placeholder="Masalan: Imtihon savollari ro‘yxati"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mazmun</label>
                <textarea
                  rows={4}
                  placeholder="Qaydlaringizni bu yerga yozing..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* DEADLINE / ASSIGNMENT FORM */}
          {activeTab === 'assignment' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Topshiriq nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Kurs ishi taqdimoti"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Fan nomi
                  </label>
                  <input
                    type="text"
                    value={assignSubject}
                    onChange={(e) => setAssignSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Muddati (Sana)
                  </label>
                  <input
                    type="date"
                    value={assignDeadline}
                    onChange={(e) => setAssignDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
