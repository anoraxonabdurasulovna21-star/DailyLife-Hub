import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  BookOpen,
  CheckCircle2,
  Settings,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {
  getSubjects,
  addStudySession,
  getStudySessions,
} from '../services/storage';
import {
  getTodayString,
  getCurrentTimeString,
  formatUzbekDate,
} from '../utils/dateUtils';
import { calculateStudyStats } from '../services/analyticsEngine';

type TimerMode = 'pomodoro' | 'short_break' | 'long_break';

export const StudyTimerView: React.FC = () => {
  const subjects = getSubjects();
  const today = getTodayString();
  const sessions = getStudySessions();

  // Settings
  const [studyDuration, setStudyDuration] = useState(25); // minutes
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'Dasturlash');
  const [sessionNotes, setSessionNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Timer state
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(studyDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const startTimeRef = useRef<string>(getCurrentTimeString());

  // Update timeLeft when duration changes and timer is not running
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'pomodoro') setTimeLeft(studyDuration * 60);
      else if (mode === 'short_break') setTimeLeft(shortBreakDuration * 60);
      else if (mode === 'long_break') setTimeLeft(longBreakDuration * 60);
    }
  }, [studyDuration, shortBreakDuration, longBreakDuration, mode]);

  // Interval loop
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Completed timer!
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    const endTime = getCurrentTimeString();

    if (mode === 'pomodoro') {
      // Store completed study session permanently
      addStudySession({
        subjectName: selectedSubject,
        date: today,
        startTime: startTimeRef.current,
        endTime,
        durationMinutes: studyDuration,
        sessionType: 'pomodoro',
        notes: sessionNotes.trim() || undefined,
      });

      const nextCount = completedSessionsCount + 1;
      setCompletedSessionsCount(nextCount);

      // Play audio chime if available
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch (e) {
        // audio ctx ignored if blocked
      }

      // Transition to break
      if (nextCount % 4 === 0) {
        setMode('long_break');
        setTimeLeft(longBreakDuration * 60);
      } else {
        setMode('short_break');
        setTimeLeft(shortBreakDuration * 60);
      }
    } else {
      // Break completed, back to study
      setMode('pomodoro');
      setTimeLeft(studyDuration * 60);
    }
  };

  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = getCurrentTimeString();
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') setTimeLeft(studyDuration * 60);
    else if (mode === 'short_break') setTimeLeft(shortBreakDuration * 60);
    else setTimeLeft(longBreakDuration * 60);
  };

  const handleSkip = () => {
    handleReset();
    if (mode === 'pomodoro') {
      setMode('short_break');
      setTimeLeft(shortBreakDuration * 60);
    } else {
      setMode('pomodoro');
      setTimeLeft(studyDuration * 60);
    }
  };

  // Time format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentTotalSeconds =
    mode === 'pomodoro'
      ? studyDuration * 60
      : mode === 'short_break'
      ? shortBreakDuration * 60
      : longBreakDuration * 60;
  const progressRatio = Math.max(0, 1 - timeLeft / (currentTotalSeconds || 1));

  // Study stats
  const todaySessions = sessions.filter((s) => s.date === today);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-cyan-500/20 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#00E5FF]" />
            <span>O‘qish va Pomodoro konsentratsiya taymeri</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            25 daqiqa dars + 5 daqiqa tanaffus: har bir seans avtomatik ravishda akademik statistikaga yoziladi
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Taymer sozlamalari"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Drawer / Accordion */}
      {showSettings && (
        <div className="glass-panel p-5 rounded-3xl border border-slate-700 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Taymer davomiyligi sozlamalari (daqiqa)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dars (Pomodoro)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={studyDuration}
                onChange={(e) => setStudyDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Qisqa tanaffus
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Uzoq tanaffus (har 4-seansda)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Big Timer Card */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-8">
          <button
            onClick={() => {
              setMode('pomodoro');
              setIsRunning(false);
              setTimeLeft(studyDuration * 60);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-[#00E5FF] text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📚 O‘qish (Pomodoro)
          </button>
          <button
            onClick={() => {
              setMode('short_break');
              setIsRunning(false);
              setTimeLeft(shortBreakDuration * 60);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ☕ Qisqa tanaffus
          </button>
          <button
            onClick={() => {
              setMode('long_break');
              setIsRunning(false);
              setTimeLeft(longBreakDuration * 60);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛋 Uzoq tanaffus
          </button>
        </div>

        {/* Big Circular Clock */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-800/80 fill-none"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`fill-none transition-all duration-1000 ${
                mode === 'pomodoro'
                  ? 'stroke-[#00E5FF]'
                  : mode === 'short_break'
                  ? 'stroke-purple-500'
                  : 'stroke-emerald-400'
              }`}
              strokeWidth="6"
              strokeDasharray={276}
              strokeDashoffset={276 - 276 * progressRatio}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-mono font-extrabold text-white tracking-tighter">
              {timeString}
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">
              {mode === 'pomodoro'
                ? selectedSubject
                : mode === 'short_break'
                ? 'Tanaffus vaqti'
                : 'Dam olish'}
            </span>
          </div>
        </div>

        {/* Subject & Topic Selector */}
        {mode === 'pomodoro' && (
          <div className="w-full max-w-sm my-6 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">Fan:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
                <option value="Dasturlash">Dasturlash</option>
                <option value="Ingliz tili">Ingliz tili</option>
                <option value="Matematika">Matematika</option>
                <option value="Kitob mutolaasi">Kitob mutolaasi</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Qaysi mavzuni o‘rganyapsiz? (ixtiyoriy)"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Qayta boshlash"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Boshlash</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-4 rounded-2xl bg-amber-400 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-400/25 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Pause className="w-5 h-5 fill-slate-950" />
              <span>Pauza</span>
            </button>
          )}

          <button
            onClick={handleSkip}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="O‘tkazib yuborish"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Today's Pomodoro Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400 uppercase font-bold">Bugungi o‘qish</span>
          <div className="text-2xl font-mono font-extrabold text-[#00E5FF] mt-1">
            {todayMinutes} daqiqa
          </div>
          <span className="text-[10px] text-slate-500">
            {Number((todayMinutes / 60).toFixed(1))} soat
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400 uppercase font-bold">Yakunlangan seanslar</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">
            {todaySessions.length} ta
          </div>
          <span className="text-[10px] text-slate-500">Bugungi kun hisobida</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400 uppercase font-bold">Jami tarixiy seanslar</span>
          <div className="text-2xl font-mono font-extrabold text-purple-400 mt-1">
            {sessions.length} ta
          </div>
          <span className="text-[10px] text-slate-500">Barcha davrlarda</span>
        </div>
      </div>
    </div>
  );
};
