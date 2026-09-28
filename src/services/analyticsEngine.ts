import {
  Task,
  Goal,
  Transaction,
  Habit,
  HabitLog,
  StudySession,
  Assignment,
} from '../types';
import { calculateTaskTiming, shiftDate, formatUzbekDate, UZBEK_MONTHS } from '../utils/dateUtils';

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  urgent: number;
  completionRate: number; // 0..100
  earlyCount: number;
  onTimeCount: number;
  lateCount: number;
  earlyRate: number;
  onTimeRate: number;
  lateRate: number;
  avgDelayMinutes: number;
}

export interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  averageDailyExpense: number;
  largestExpense: {
    amount: number;
    category: string;
    description: string;
  } | null;
  categoryDistribution: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface HabitStats {
  totalHabits: number;
  averageConsistency: number; // 0..100
  bestHabit: {
    title: string;
    streak: number;
  } | null;
  habitsWithStreaks: {
    id: string;
    title: string;
    targetValue: number;
    unit: string;
    icon: string;
    currentStreak: number;
    bestStreak: number;
    consistency: number;
    todayValue: number;
    isCompletedToday: boolean;
  }[];
}

export interface StudyStats {
  totalMinutes: number;
  totalHours: number;
  sessionsCount: number;
  bySubject: {
    subjectName: string;
    minutes: number;
    percentage: number;
  }[];
}

export interface DailyProgressResult {
  hasData: boolean;
  score: number; // 0..100
  scoreLabel: string;
  taskPart: { completed: number; total: number; percentage: number };
  habitPart: { completed: number; total: number; percentage: number };
  studyPart: { minutes: number; targetMinutes: number; percentage: number };
  goalPart: { achieved: number; total: number; percentage: number };
}

/**
 * Calculate task statistics for a given list of tasks (optionally filtered by date)
 */
export function calculateTaskStats(tasks: Task[], filterDate?: string): TaskStats {
  let filtered = tasks;
  if (filterDate) {
    filtered = tasks.filter((t) => t.plannedDate === filterDate || t.completedDate === filterDate);
  }

  const total = filtered.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      overdue: 0,
      urgent: 0,
      completionRate: 0,
      earlyCount: 0,
      onTimeCount: 0,
      lateCount: 0,
      earlyRate: 0,
      onTimeRate: 0,
      lateRate: 0,
      avgDelayMinutes: 0,
    };
  }

  const completedTasks = filtered.filter((t) => t.status === 'bajarildi');
  const inProgress = filtered.filter((t) => t.status === 'jarayonda').length;
  const pending = filtered.filter((t) => t.status === 'boshlanmagan').length;
  const overdue = filtered.filter((t) => t.status === 'muddati_otgan').length;
  const urgent = filtered.filter((t) => t.priority === 'juda_muhim' || t.priority === 'yuqori').length;

  let earlyCount = 0;
  let onTimeCount = 0;
  let lateCount = 0;
  let totalDelayMinutes = 0;
  let delaySamplesCount = 0;

  completedTasks.forEach((t) => {
    if (t.plannedDate && t.completedDate) {
      const timing = calculateTaskTiming(t.plannedDate, t.plannedTime, t.completedDate, t.completedTime);
      if (timing.status === 'early') earlyCount++;
      else if (timing.status === 'on_time') onTimeCount++;
      else if (timing.status === 'late') {
        lateCount++;
        totalDelayMinutes += Math.abs(timing.diffMinutes);
        delaySamplesCount++;
      }
    } else {
      onTimeCount++;
    }
  });

  const completed = completedTasks.length;
  const completionRate = Math.round((completed / total) * 100);
  const evaluatedCount = earlyCount + onTimeCount + lateCount || completed || 1;

  const earlyRate = Math.round((earlyCount / evaluatedCount) * 100);
  const onTimeRate = Math.round((onTimeCount / evaluatedCount) * 100);
  const lateRate = Math.round((lateCount / evaluatedCount) * 100);
  const avgDelayMinutes = delaySamplesCount > 0 ? Math.round(totalDelayMinutes / delaySamplesCount) : 0;

  return {
    total,
    completed,
    inProgress,
    pending,
    overdue,
    urgent,
    completionRate,
    earlyCount,
    onTimeCount,
    lateCount,
    earlyRate,
    onTimeRate,
    lateRate,
    avgDelayMinutes,
  };
}

/**
 * Calculate finance statistics
 */
export function calculateFinanceStats(
  transactions: Transaction[],
  startDate?: string,
  endDate?: string
): FinanceStats {
  let filtered = transactions;
  if (startDate && endDate) {
    filtered = transactions.filter((t) => t.date >= startDate && t.date <= endDate);
  } else if (startDate) {
    filtered = transactions.filter((t) => t.date === startDate);
  }

  if (filtered.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      averageDailyExpense: 0,
      largestExpense: null,
      categoryDistribution: [],
    };
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  let largestExpense: { amount: number; category: string; description: string } | null = null;
  const categoryMap: Record<string, number> = {};
  const activeExpenseDays = new Set<string>();

  filtered.forEach((t) => {
    if (t.type === 'daromad') {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
      activeExpenseDays.add(t.date);
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;

      if (!largestExpense || t.amount > largestExpense.amount) {
        largestExpense = {
          amount: t.amount,
          category: t.category,
          description: t.description || 'Xarajat',
        };
      }
    }
  });

  const daysCount = activeExpenseDays.size || 1;
  const averageDailyExpense = Math.round(totalExpenses / daysCount);

  const categoryDistribution = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    averageDailyExpense,
    largestExpense,
    categoryDistribution,
  };
}

/**
 * Calculate habits and streaks
 */
export function calculateHabitStats(
  habits: Habit[],
  habitLogs: HabitLog[],
  targetDate: string
): HabitStats {
  if (habits.length === 0) {
    return {
      totalHabits: 0,
      averageConsistency: 0,
      bestHabit: null,
      habitsWithStreaks: [],
    };
  }

  let totalConsistencySum = 0;
  let bestHabitCandidate: { title: string; streak: number } | null = null;

  const habitsWithStreaks = habits.map((habit) => {
    const logs = habitLogs.filter((l) => l.habitId === habit.id);
    const logMap = new Map<string, number>();
    logs.forEach((l) => logMap.set(l.date, l.value));

    const todayVal = logMap.get(targetDate) || 0;
    const isCompletedToday = todayVal >= habit.targetValue;

    // Calculate current streak backwards from targetDate (or yesterday if today isn't done yet)
    let currentStreak = 0;
    let checkDate = targetDate;
    if (!isCompletedToday) {
      checkDate = shiftDate(targetDate, -1);
    }

    while (true) {
      const val = logMap.get(checkDate) || 0;
      if (val >= habit.targetValue) {
        currentStreak++;
        checkDate = shiftDate(checkDate, -1);
      } else {
        break;
      }
      if (currentStreak > 365) break; // safety bound
    }

    // Consistency over last 30 days
    let completedIn30Days = 0;
    for (let i = 0; i < 30; i++) {
      const d = shiftDate(targetDate, -i);
      if ((logMap.get(d) || 0) >= habit.targetValue) {
        completedIn30Days++;
      }
    }
    const consistency = Math.round((completedIn30Days / 30) * 100);
    totalConsistencySum += consistency;

    const bestStreak = Math.max(currentStreak, Math.round(consistency * 0.4) + currentStreak);

    if (!bestHabitCandidate || currentStreak > bestHabitCandidate.streak) {
      bestHabitCandidate = {
        title: habit.title,
        streak: currentStreak,
      };
    }

    return {
      id: habit.id,
      title: habit.title,
      targetValue: habit.targetValue,
      unit: habit.unit,
      icon: habit.icon,
      currentStreak,
      bestStreak,
      consistency,
      todayValue: todayVal,
      isCompletedToday,
    };
  });

  const averageConsistency = Math.round(totalConsistencySum / habits.length);

  return {
    totalHabits: habits.length,
    averageConsistency,
    bestHabit: bestHabitCandidate,
    habitsWithStreaks,
  };
}

/**
 * Calculate study statistics
 */
export function calculateStudyStats(
  sessions: StudySession[],
  startDate?: string,
  endDate?: string
): StudyStats {
  let filtered = sessions;
  if (startDate && endDate) {
    filtered = sessions.filter((s) => s.date >= startDate && s.date <= endDate);
  } else if (startDate) {
    filtered = sessions.filter((s) => s.date === startDate);
  }

  if (filtered.length === 0) {
    return {
      totalMinutes: 0,
      totalHours: 0,
      sessionsCount: 0,
      bySubject: [],
    };
  }

  let totalMinutes = 0;
  const subjectMap: Record<string, number> = {};

  filtered.forEach((s) => {
    totalMinutes += s.durationMinutes;
    const name = s.subjectName || 'Umumiy dars';
    subjectMap[name] = (subjectMap[name] || 0) + s.durationMinutes;
  });

  const bySubject = Object.entries(subjectMap)
    .map(([subjectName, minutes]) => ({
      subjectName,
      minutes,
      percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    totalMinutes,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    sessionsCount: filtered.length,
    bySubject,
  };
}

/**
 * Transparent, weighted daily progress score calculation
 */
export function calculateDailyProgress(
  targetDate: string,
  tasks: Task[],
  habits: Habit[],
  habitLogs: HabitLog[],
  goals: Goal[],
  studySessions: StudySession[]
): DailyProgressResult {
  // 1. Tasks scheduled for today or completed today
  const todayTasks = tasks.filter((t) => t.plannedDate === targetDate || t.completedDate === targetDate);
  const tasksCompleted = todayTasks.filter((t) => t.status === 'bajarildi').length;
  const taskPct = todayTasks.length > 0 ? (tasksCompleted / todayTasks.length) * 100 : null;

  // 2. Habits for today
  let habitCompleted = 0;
  habits.forEach((h) => {
    const log = habitLogs.find((l) => l.habitId === h.id && l.date === targetDate);
    if (log && log.value >= h.targetValue) {
      habitCompleted++;
    }
  });
  const habitPct = habits.length > 0 ? (habitCompleted / habits.length) * 100 : null;

  // 3. Study time for today (target: 60 minutes)
  const todaySessions = studySessions.filter((s) => s.date === targetDate);
  const studyMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const targetStudyMinutes = 60;
  const studyPct = Math.min(100, (studyMinutes / targetStudyMinutes) * 100);

  // 4. Active goals
  const activeGoals = goals.filter((g) => !g.isCompleted && g.startDate <= targetDate && g.endDate >= targetDate);
  const completedGoals = goals.filter((g) => g.achievedDate === targetDate);
  const goalPct = activeGoals.length > 0 ? Math.min(100, (completedGoals.length / activeGoals.length) * 100) : null;

  // Weighted calculation based on active categories
  let totalWeight = 0;
  let weightedSum = 0;

  if (taskPct !== null) {
    weightedSum += taskPct * 0.4;
    totalWeight += 0.4;
  }
  if (habitPct !== null) {
    weightedSum += habitPct * 0.35;
    totalWeight += 0.35;
  }
  if (studyMinutes > 0 || todaySessions.length > 0) {
    weightedSum += studyPct * 0.25;
    totalWeight += 0.25;
  }

  const hasData = todayTasks.length > 0 || habits.length > 0 || studyMinutes > 0 || completedGoals.length > 0;

  if (!hasData || totalWeight === 0) {
    return {
      hasData: false,
      score: 0,
      scoreLabel: 'Ma\'lumot mavjud emas',
      taskPart: { completed: 0, total: 0, percentage: 0 },
      habitPart: { completed: 0, total: 0, percentage: 0 },
      studyPart: { minutes: 0, targetMinutes: targetStudyMinutes, percentage: 0 },
      goalPart: { achieved: 0, total: 0, percentage: 0 },
    };
  }

  const finalScore = Math.min(100, Math.round(weightedSum / totalWeight));

  return {
    hasData: true,
    score: finalScore,
    scoreLabel: `${finalScore}%`,
    taskPart: {
      completed: tasksCompleted,
      total: todayTasks.length,
      percentage: taskPct !== null ? Math.round(taskPct) : 0,
    },
    habitPart: {
      completed: habitCompleted,
      total: habits.length,
      percentage: habitPct !== null ? Math.round(habitPct) : 0,
    },
    studyPart: {
      minutes: studyMinutes,
      targetMinutes: targetStudyMinutes,
      percentage: Math.round(studyPct),
    },
    goalPart: {
      achieved: completedGoals.length,
      total: activeGoals.length,
      percentage: goalPct !== null ? Math.round(goalPct) : 0,
    },
  };
}

/**
 * Generate automated daily summary report (Kunlik hisobot)
 */
export function generateDailySummary(
  targetDate: string,
  tasks: Task[],
  habits: Habit[],
  habitLogs: HabitLog[],
  transactions: Transaction[],
  studySessions: StudySession[]
) {
  const taskStats = calculateTaskStats(tasks, targetDate);
  const habitStats = calculateHabitStats(habits, habitLogs, targetDate);
  const financeStats = calculateFinanceStats(transactions, targetDate);
  const studyStats = calculateStudyStats(studySessions, targetDate);

  const hasAnyActivity =
    taskStats.total > 0 ||
    habitStats.totalHabits > 0 ||
    financeStats.totalIncome > 0 ||
    financeStats.totalExpenses > 0 ||
    studyStats.totalMinutes > 0;

  return {
    date: targetDate,
    title: `${formatUzbekDate(targetDate)} — Kunlik hisobot`,
    hasData: hasAnyActivity,
    taskStats,
    habitStats,
    financeStats,
    studyStats,
  };
}

/**
 * Weekly comparative review
 */
export function generateWeeklyReview(
  startDate: string,
  endDate: string,
  tasks: Task[],
  habits: Habit[],
  habitLogs: HabitLog[],
  transactions: Transaction[],
  studySessions: StudySession[]
) {
  const currentTasks = tasks.filter((t) => t.plannedDate >= startDate && t.plannedDate <= endDate);
  const currentFinance = calculateFinanceStats(transactions, startDate, endDate);
  const currentStudy = calculateStudyStats(studySessions, startDate, endDate);

  // Compare with previous week
  const prevStart = shiftDate(startDate, -7);
  const prevEnd = shiftDate(endDate, -7);
  const prevTasks = tasks.filter((t) => t.plannedDate >= prevStart && t.plannedDate <= prevEnd);
  const prevStudy = calculateStudyStats(studySessions, prevStart, prevEnd);

  const currentTaskRate = currentTasks.length > 0 ? (currentTasks.filter((t) => t.status === 'bajarildi').length / currentTasks.length) * 100 : 0;
  const prevTaskRate = prevTasks.length > 0 ? (prevTasks.filter((t) => t.status === 'bajarildi').length / prevTasks.length) * 100 : 0;
  const taskDiff = Math.round(currentTaskRate - prevTaskRate);

  const studyDiffHours = Number((currentStudy.totalHours - prevStudy.totalHours).toFixed(1));

  return {
    startDate,
    endDate,
    title: `Haftalik hisobot (${formatUzbekDate(startDate, false)} — ${formatUzbekDate(endDate)})`,
    currentTasksCount: currentTasks.length,
    completedTasksCount: currentTasks.filter((t) => t.status === 'bajarildi').length,
    taskCompletionRate: Math.round(currentTaskRate),
    taskDiff,
    studyHours: currentStudy.totalHours,
    studyDiffHours,
    income: currentFinance.totalIncome,
    expenses: currentFinance.totalExpenses,
    balance: currentFinance.balance,
  };
}

/**
 * Monthly review
 */
export function generateMonthlyReview(
  year: number,
  monthIndex: number, // 0..11
  tasks: Task[],
  goals: Goal[],
  transactions: Transaction[],
  studySessions: StudySession[]
) {
  const mStr = String(monthIndex + 1).padStart(2, '0');
  const prefix = `${year}-${mStr}`;

  const mTasks = tasks.filter((t) => t.plannedDate?.startsWith(prefix));
  const mTransactions = transactions.filter((t) => t.date.startsWith(prefix));
  const mStudy = studySessions.filter((s) => s.date.startsWith(prefix));

  const finance = calculateFinanceStats(mTransactions);
  const study = calculateStudyStats(mStudy);
  const taskStats = calculateTaskStats(mTasks);

  return {
    year,
    monthName: UZBEK_MONTHS[monthIndex],
    tasks: taskStats,
    finance,
    study,
  };
}
