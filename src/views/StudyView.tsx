import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  MapPin,
  UserCheck,
} from 'lucide-react';
import {
  getSubjects,
  getClassSchedules,
  getAssignments,
  getExams,
  getStudySessions,
  deleteClassSchedule,
  deleteAssignment,
  deleteExam,
  updateAssignment,
  updateExam,
  deleteSubject,
} from '../services/storage';
import {
  formatUzbekDate,
  getTodayString,
  UZBEK_DAYS,
} from '../utils/dateUtils';
import { calculateStudyStats } from '../services/analyticsEngine';

interface StudyViewProps {
  onOpenQuickAdd: (tab?: string) => void;
  onNavigateToTimer: () => void;
}

type StudySubTab = 'timetable' | 'assignments' | 'exams' | 'subjects' | 'stats';

export const StudyView: React.FC<StudyViewProps> = ({
  onOpenQuickAdd,
  onNavigateToTimer,
}) => {
  const [subTab, setSubTab] = useState<StudySubTab>('timetable');
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Dushanba

  const subjects = getSubjects();
  const classes = getClassSchedules();
  const assignments = getAssignments();
  const exams = getExams();
  const studySessions = getStudySessions();
  const today = getTodayString();

  const studyStats = calculateStudyStats(studySessions);

  const daysList = [
    { id: 1, name: 'Dushanba' },
    { id: 2, name: 'Seshanba' },
    { id: 3, name: 'Chorshanba' },
    { id: 4, name: 'Payshanba' },
    { id: 5, name: 'Juma' },
    { id: 6, name: 'Shanba' },
  ];

  const handleToggleAssignment = (id: string, currentStatus: string) => {
    updateAssignment(id, {
      status: currentStatus === 'topshirildi' ? 'kutilmoqda' : 'topshirildi',
    });
  };

  const handleUpdateExamProgress = (id: string, currentVal: number, change: number) => {
    const nextVal = Math.min(100, Math.max(0, currentVal + change));
    updateExam(id, { preparationProgress: nextVal });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#00E5FF]" />
            <span>O‘qish va akademik markaz</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dars jadvali, topshiriqlar, yaqinlashayotgan imtihonlar va o‘qish statistikasi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToTimer}
            className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Pomodoro taymeri</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd('class')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Yangi dars qo‘shish</span>
          </button>
        </div>
      </div>

      {/* Subsections Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'timetable' as StudySubTab, label: '📅 Dars jadvali' },
          { id: 'assignments' as StudySubTab, label: '⏳ Topshiriqlar va Deadline' },
          { id: 'exams' as StudySubTab, label: '🎓 Imtihonlar' },
          { id: 'subjects' as StudySubTab, label: '📚 Fanlar' },
          { id: 'stats' as StudySubTab, label: '📊 O‘qish statistikasi' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subTab === tab.id
                ? 'bg-[#00E5FF] text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. DARS JADVALI (TIMETABLE) */}
      {subTab === 'timetable' && (
        <div className="space-y-4">
          {/* Day selection tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {daysList.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDay === day.id
                    ? 'bg-slate-800 text-[#00E5FF] border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-900'
                }`}
              >
                {day.name}
              </button>
            ))}
          </div>

          {/* Classes for selected day */}
          <div className="space-y-3">
            {classes.filter((c) => c.dayOfWeek === selectedDay).length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-[#0D1424] border border-slate-800 p-8">
                <Calendar className="w-12 h-12 mx-auto text-slate-600 mb-3 stroke-1" />
                <h3 className="text-base font-bold text-white">Bu kunga darslar kiritilmagan</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Dars jadvalini qo‘shib, auditoriya va o‘qituvchi ma'lumotlarini kuzating.
                </p>
                <button
                  onClick={() => onOpenQuickAdd('class')}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Dars qo‘shish</span>
                </button>
              </div>
            ) : (
              classes
                .filter((c) => c.dayOfWeek === selectedDay)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((cls) => (
                  <div
                    key={cls.id}
                    className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col items-center justify-center text-xs font-mono font-bold text-[#00E5FF] shrink-0">
                        <span>{cls.startTime}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{cls.endTime}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{cls.subjectName}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          {cls.teacher && (
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                              {cls.teacher}
                            </span>
                          )}
                          {cls.room && (
                            <span className="flex items-center gap-1 font-mono">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              {cls.room}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteClassSchedule(cls.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 2. TOPSHIRIQLAR VA DEADLINE */}
      {subTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Topshiriqlar va muddatlar ({assignments.length})
            </h3>
            <button
              onClick={() => onOpenQuickAdd('assignment')}
              className="text-xs font-bold text-[#00E5FF] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Topshiriq qo‘shish</span>
            </button>
          </div>

          <div className="space-y-3">
            {assignments.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-[#0D1424] border border-slate-800 p-8">
                <Clock className="w-12 h-12 mx-auto text-slate-600 mb-3 stroke-1" />
                <h3 className="text-base font-bold text-white">Topshiriqlar mavjud emas</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Laboratoriya, kurs ishi yoki referat topshiriqlarini kiritib, muddatlarni nazorat qiling.
                </p>
              </div>
            ) : (
              assignments.map((asg) => {
                const isDone = asg.status === 'topshirildi';
                const isOverdue = asg.deadlineDate < today && !isDone;

                return (
                  <div
                    key={asg.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-slate-950/60 border-slate-800 opacity-75'
                        : isOverdue
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : 'glass-panel border-slate-800 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleAssignment(asg.id, asg.status)}
                          className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-600 hover:border-cyan-400'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                isDone ? 'line-through text-slate-500' : 'text-white'
                              }`}
                            >
                              {asg.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              {asg.subjectName}
                            </span>
                            {isOverdue && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                                Kechikkan
                              </span>
                            )}
                          </div>
                          {asg.description && (
                            <p className="text-xs text-slate-400 mt-1">{asg.description}</p>
                          )}
                          <div className="text-[11px] text-slate-400 font-mono mt-1">
                            Muddati: {formatUzbekDate(asg.deadlineDate, false)} {asg.deadlineTime || ''}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteAssignment(asg.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. IMTIHONLAR (EXAMS) */}
      {subTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Imtihonlar jadvali va tayyorgarlik darajasi
            </h3>
            <button
              onClick={() => onOpenQuickAdd('class')}
              className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Imtihon qo‘shish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.length === 0 ? (
              <div className="col-span-full py-16 text-center rounded-3xl bg-[#0D1424] border border-slate-800 p-8">
                <GraduationCap className="w-12 h-12 mx-auto text-slate-600 mb-3 stroke-1" />
                <h3 className="text-base font-bold text-white">Imtihonlar ro‘yxati bo‘sh</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Oraliq va yakuniy nazoratlarni kiritib, tayyorgarlik foizini belgilang.
                </p>
              </div>
            ) : (
              exams.map((ex) => (
                <div
                  key={ex.id}
                  className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                        {formatUzbekDate(ex.date, false)} • {ex.time}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">{ex.subjectName}</h4>
                      {ex.location && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {ex.location}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteExam(ex.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preparation progress slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Tayyorgarlik darajasi:</span>
                      <span className="font-mono font-bold text-[#00E5FF]">
                        {ex.preparationProgress}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-[#00E5FF] rounded-full transition-all"
                        style={{ width: `${ex.preparationProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleUpdateExamProgress(ex.id, ex.preparationProgress, -10)}
                        className="px-2 py-0.5 rounded bg-slate-900 text-xs text-slate-400 hover:text-white"
                      >
                        -10%
                      </button>
                      <button
                        onClick={() => handleUpdateExamProgress(ex.id, ex.preparationProgress, 10)}
                        className="px-2 py-0.5 rounded bg-purple-500/20 text-xs text-purple-300 hover:text-white font-semibold"
                      >
                        +10%
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. FANLAR (SUBJECTS) */}
      {subTab === 'subjects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.length === 0 ? (
              <div className="col-span-full py-16 text-center rounded-3xl bg-[#0D1424] border border-slate-800 p-8">
                <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3 stroke-1" />
                <h3 className="text-base font-bold text-white">Fanlar hali kiritilmagan</h3>
              </div>
            ) : (
              subjects.map((s) => (
                <div
                  key={s.id}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 text-sm"
                      style={{ backgroundColor: s.color || '#00E5FF' }}
                    >
                      {s.code || s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{s.name}</h4>
                      <p className="text-xs text-slate-400">{s.teacher || 'O‘qituvchi'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSubject(s.id)}
                    className="p-1 rounded text-slate-600 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. STATISTIKA (STUDY STATS) */}
      {subTab === 'stats' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            O‘qish vaqti taqsimoti
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Jami soat</span>
              <div className="text-2xl font-mono font-extrabold text-[#00E5FF] mt-1">
                {studyStats.totalHours} soat
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Pomodoro seanslari</span>
              <div className="text-2xl font-mono font-extrabold text-white mt-1">
                {studyStats.sessionsCount} ta
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3">
            <h4 className="text-xs font-bold text-slate-300">Fanlar kesimida daqiqalar:</h4>
            {studyStats.bySubject.map((sb) => (
              <div key={sb.subjectName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{sb.subjectName}</span>
                  <span className="font-mono text-slate-400">
                    {sb.minutes} daqiqa ({sb.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-[#00E5FF] rounded-full"
                    style={{ width: `${sb.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
