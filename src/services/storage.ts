import {
  User,
  Task,
  Goal,
  Transaction,
  Note,
  Reminder,
  Habit,
  HabitLog,
  Subject,
  ClassSchedule,
  Assignment,
  Exam,
  StudySession,
  AppNotification,
} from '../types';
import { getTodayString, getCurrentTimeString, shiftDate } from '../utils/dateUtils';

const KEYS = {
  USER: 'dailylife_user',
  TASKS: 'dailylife_tasks',
  GOALS: 'dailylife_goals',
  TRANSACTIONS: 'dailylife_transactions',
  NOTES: 'dailylife_notes',
  REMINDERS: 'dailylife_reminders',
  HABITS: 'dailylife_habits',
  HABIT_LOGS: 'dailylife_habit_logs',
  SUBJECTS: 'dailylife_subjects',
  CLASSES: 'dailylife_classes',
  ASSIGNMENTS: 'dailylife_assignments',
  EXAMS: 'dailylife_exams',
  STUDY_SESSIONS: 'dailylife_study_sessions',
  NOTIFICATIONS: 'dailylife_notifications',
  IS_DEMO: 'dailylife_is_demo',
};

// Dispatch storage change event for reactive updates in app
export function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dailylife_storage_change'));
  }
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse storage key ${key}`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyDataChanged();
  } catch (e) {
    console.error(`Failed to save storage key ${key}`, e);
  }
}

// User Profile
export function getUser(): User | null {
  return getItem<User | null>(KEYS.USER, null);
}

export function saveUser(name: string, avatar: string = '👤'): User {
  const existing = getUser();
  const user: User = {
    id: existing?.id || 'usr_' + Date.now(),
    name: name.trim(),
    avatar: avatar || '👤',
    createdAt: existing?.createdAt || new Date().toISOString(),
    settings: existing?.settings || {
      language: 'uz',
      currency: 'UZS',
      timeFormat: '24h',
      notificationsEnabled: true,
      soundEnabled: true,
    },
  };
  setItem(KEYS.USER, user);
  return user;
}

export function updateUser(partial: Partial<User>): User | null {
  const current = getUser();
  if (!current) return null;
  const updated = { ...current, ...partial };
  setItem(KEYS.USER, updated);
  return updated;
}

// Tasks
export function getTasks(): Task[] {
  return getItem<Task[]>(KEYS.TASKS, []);
}

export function saveTasks(tasks: Task[]): void {
  setItem(KEYS.TASKS, tasks);
}

export function addTask(taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Task {
  const tasks = getTasks();
  const user = getUser();
  const now = new Date().toISOString();
  const newTask: Task = {
    ...taskData,
    id: 'tsk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
    createdAt: now,
    updatedAt: now,
  };
  tasks.unshift(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTask(id: string, partial: Partial<Task>): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated: Task = {
    ...tasks[index],
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  saveTasks(tasks);
  return updated;
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
}

// Goals
export function getGoals(): Goal[] {
  return getItem<Goal[]>(KEYS.GOALS, []);
}

export function saveGoals(goals: Goal[]): void {
  setItem(KEYS.GOALS, goals);
}

export function addGoal(goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Goal {
  const goals = getGoals();
  const user = getUser();
  const now = new Date().toISOString();
  const newGoal: Goal = {
    ...goalData,
    id: 'gol_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
    createdAt: now,
    updatedAt: now,
  };
  goals.unshift(newGoal);
  saveGoals(goals);
  return newGoal;
}

export function updateGoal(id: string, partial: Partial<Goal>): Goal | null {
  const goals = getGoals();
  const index = goals.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const updated: Goal = {
    ...goals[index],
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  goals[index] = updated;
  saveGoals(goals);
  return updated;
}

export function deleteGoal(id: string): void {
  const goals = getGoals().filter((g) => g.id !== id);
  saveGoals(goals);
}

// Transactions
export function getTransactions(): Transaction[] {
  return getItem<Transaction[]>(KEYS.TRANSACTIONS, []);
}

export function saveTransactions(txs: Transaction[]): void {
  setItem(KEYS.TRANSACTIONS, txs);
}

export function addTransaction(
  data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
): Transaction {
  const txs = getTransactions();
  const user = getUser();
  const newTx: Transaction = {
    ...data,
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
    createdAt: new Date().toISOString(),
  };
  txs.unshift(newTx);
  saveTransactions(txs);
  return newTx;
}

export function deleteTransaction(id: string): void {
  const txs = getTransactions().filter((t) => t.id !== id);
  saveTransactions(txs);
}

// Habits
export function getHabits(): Habit[] {
  return getItem<Habit[]>(KEYS.HABITS, []);
}

export function saveHabits(habits: Habit[]): void {
  setItem(KEYS.HABITS, habits);
}

export function addHabit(data: Omit<Habit, 'id' | 'userId' | 'createdAt'>): Habit {
  const habits = getHabits();
  const user = getUser();
  const newHabit: Habit = {
    ...data,
    id: 'hbt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
    createdAt: new Date().toISOString(),
  };
  habits.push(newHabit);
  saveHabits(habits);
  return newHabit;
}

export function updateHabit(id: string, partial: Partial<Habit>): Habit | null {
  const habits = getHabits();
  const index = habits.findIndex((h) => h.id === id);
  if (index === -1) return null;
  habits[index] = { ...habits[index], ...partial };
  saveHabits(habits);
  return habits[index];
}

export function deleteHabit(id: string): void {
  const habits = getHabits().filter((h) => h.id !== id);
  saveHabits(habits);
  // remove associated logs
  const logs = getHabitLogs().filter((l) => l.habitId !== id);
  saveHabitLogs(logs);
}

export function getHabitLogs(): HabitLog[] {
  return getItem<HabitLog[]>(KEYS.HABIT_LOGS, []);
}

export function saveHabitLogs(logs: HabitLog[]): void {
  setItem(KEYS.HABIT_LOGS, logs);
}

export function setHabitLog(
  habitId: string,
  date: string,
  value: number,
  isCompleted?: boolean
): HabitLog {
  const logs = getHabitLogs();
  const habit = getHabits().find((h) => h.id === habitId);
  const target = habit?.targetValue || 1;
  const completed = isCompleted !== undefined ? isCompleted : value >= target;

  const existingIndex = logs.findIndex((l) => l.habitId === habitId && l.date === date);

  if (existingIndex >= 0) {
    logs[existingIndex] = {
      ...logs[existingIndex],
      value,
      isCompleted: completed,
    };
    saveHabitLogs(logs);
    return logs[existingIndex];
  } else {
    const newLog: HabitLog = {
      id: 'hlog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      habitId,
      date,
      value,
      isCompleted: completed,
    };
    logs.push(newLog);
    saveHabitLogs(logs);
    return newLog;
  }
}

// Notes
export function getNotes(): Note[] {
  return getItem<Note[]>(KEYS.NOTES, []);
}

export function saveNotes(notes: Note[]): void {
  setItem(KEYS.NOTES, notes);
}

export function addNote(data: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Note {
  const notes = getNotes();
  const user = getUser();
  const now = new Date().toISOString();
  const newNote: Note = {
    ...data,
    id: 'not_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
    createdAt: now,
    updatedAt: now,
  };
  notes.unshift(newNote);
  saveNotes(notes);
  return newNote;
}

export function updateNote(id: string, partial: Partial<Note>): Note | null {
  const notes = getNotes();
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return null;
  notes[index] = {
    ...notes[index],
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  saveNotes(notes);
  return notes[index];
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((n) => n.id !== id);
  saveNotes(notes);
}

// Reminders
export function getReminders(): Reminder[] {
  return getItem<Reminder[]>(KEYS.REMINDERS, []);
}

export function saveReminders(reminders: Reminder[]): void {
  setItem(KEYS.REMINDERS, reminders);
}

export function addReminder(
  data: Omit<Reminder, 'id' | 'userId' | 'createdAt'>
): Reminder {
  const reminders = getReminders();
  const user = getUser();
  const newReminder: Reminder = {
    ...data,
    id: 'rem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
    createdAt: new Date().toISOString(),
  };
  reminders.unshift(newReminder);
  saveReminders(reminders);
  return newReminder;
}

export function updateReminder(id: string, partial: Partial<Reminder>): Reminder | null {
  const reminders = getReminders();
  const index = reminders.findIndex((r) => r.id === id);
  if (index === -1) return null;
  reminders[index] = { ...reminders[index], ...partial };
  saveReminders(reminders);
  return reminders[index];
}

export function deleteReminder(id: string): void {
  const reminders = getReminders().filter((r) => r.id !== id);
  saveReminders(reminders);
}

// Study Center: Subjects, Timetable, Assignments, Exams, Sessions
export function getSubjects(): Subject[] {
  return getItem<Subject[]>(KEYS.SUBJECTS, []);
}

export function saveSubjects(subjects: Subject[]): void {
  setItem(KEYS.SUBJECTS, subjects);
}

export function addSubject(data: Omit<Subject, 'id' | 'userId'>): Subject {
  const subjects = getSubjects();
  const user = getUser();
  const newSubject: Subject = {
    ...data,
    id: 'sbj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
  };
  subjects.push(newSubject);
  saveSubjects(subjects);
  return newSubject;
}

export function deleteSubject(id: string): void {
  const subjects = getSubjects().filter((s) => s.id !== id);
  saveSubjects(subjects);
}

export function getClassSchedules(): ClassSchedule[] {
  return getItem<ClassSchedule[]>(KEYS.CLASSES, []);
}

export function saveClassSchedules(classes: ClassSchedule[]): void {
  setItem(KEYS.CLASSES, classes);
}

export function addClassSchedule(data: Omit<ClassSchedule, 'id' | 'userId'>): ClassSchedule {
  const classes = getClassSchedules();
  const user = getUser();
  const newClass: ClassSchedule = {
    ...data,
    id: 'cls_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
  };
  classes.push(newClass);
  saveClassSchedules(classes);
  return newClass;
}

export function deleteClassSchedule(id: string): void {
  const classes = getClassSchedules().filter((c) => c.id !== id);
  saveClassSchedules(classes);
}

export function getAssignments(): Assignment[] {
  return getItem<Assignment[]>(KEYS.ASSIGNMENTS, []);
}

export function saveAssignments(assignments: Assignment[]): void {
  setItem(KEYS.ASSIGNMENTS, assignments);
}

export function addAssignment(
  data: Omit<Assignment, 'id' | 'userId' | 'createdAt'>
): Assignment {
  const assignments = getAssignments();
  const user = getUser();
  const newAssignment: Assignment = {
    ...data,
    id: 'asg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
    createdAt: new Date().toISOString(),
  };
  assignments.unshift(newAssignment);
  saveAssignments(assignments);
  return newAssignment;
}

export function updateAssignment(id: string, partial: Partial<Assignment>): Assignment | null {
  const assignments = getAssignments();
  const index = assignments.findIndex((a) => a.id === id);
  if (index === -1) return null;
  assignments[index] = { ...assignments[index], ...partial };
  saveAssignments(assignments);
  return assignments[index];
}

export function deleteAssignment(id: string): void {
  const assignments = getAssignments().filter((a) => a.id !== id);
  saveAssignments(assignments);
}

export function getExams(): Exam[] {
  return getItem<Exam[]>(KEYS.EXAMS, []);
}

export function saveExams(exams: Exam[]): void {
  setItem(KEYS.EXAMS, exams);
}

export function addExam(data: Omit<Exam, 'id' | 'userId' | 'createdAt'>): Exam {
  const exams = getExams();
  const user = getUser();
  const newExam: Exam = {
    ...data,
    id: 'exm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
    createdAt: new Date().toISOString(),
  };
  exams.push(newExam);
  saveExams(exams);
  return newExam;
}

export function updateExam(id: string, partial: Partial<Exam>): Exam | null {
  const exams = getExams();
  const index = exams.findIndex((e) => e.id === id);
  if (index === -1) return null;
  exams[index] = { ...exams[index], ...partial };
  saveExams(exams);
  return exams[index];
}

export function deleteExam(id: string): void {
  const exams = getExams().filter((e) => e.id !== id);
  saveExams(exams);
}

export function getStudySessions(): StudySession[] {
  return getItem<StudySession[]>(KEYS.STUDY_SESSIONS, []);
}

export function saveStudySessions(sessions: StudySession[]): void {
  setItem(KEYS.STUDY_SESSIONS, sessions);
}

export function addStudySession(
  data: Omit<StudySession, 'id' | 'userId' | 'createdAt'>
): StudySession {
  const sessions = getStudySessions();
  const user = getUser();
  const newSession: StudySession = {
    ...data,
    id: 'ses_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user?.id || 'default_user',
    createdAt: new Date().toISOString(),
  };
  sessions.unshift(newSession);
  saveStudySessions(sessions);
  return newSession;
}

// Notifications
export function getNotifications(): AppNotification[] {
  return getItem<AppNotification[]>(KEYS.NOTIFICATIONS, []);
}

export function saveNotifications(notifications: AppNotification[]): void {
  setItem(KEYS.NOTIFICATIONS, notifications);
}

export function addNotification(
  data: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>
): AppNotification {
  const notifications = getNotifications();
  const newNotif: AppNotification = {
    ...data,
    id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotif);
  saveNotifications(notifications);
  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const list = getNotifications().map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveNotifications(list);
}

export function markAllNotificationsAsRead(): void {
  const list = getNotifications().map((n) => ({ ...n, isRead: true }));
  saveNotifications(list);
}

export function deleteNotification(id: string): void {
  const list = getNotifications().filter((n) => n.id !== id);
  saveNotifications(list);
}

// Demo Mode Indicator
export function isDemoMode(): boolean {
  return getItem<boolean>(KEYS.IS_DEMO, false);
}

export function setDemoMode(val: boolean): void {
  setItem(KEYS.IS_DEMO, val);
}

// Load comprehensive demo dataset for university competition presentation
export function loadDemoData(preferredName?: string): void {
  const today = getTodayString();
  const user = getUser() || saveUser(preferredName || 'Aziz', '👨‍🎓');
  if (preferredName && user.name !== preferredName) {
    updateUser({ name: preferredName });
  }

  const yesterday = shiftDate(today, -1);
  const twoDaysAgo = shiftDate(today, -2);
  const tomorrow = shiftDate(today, 1);
  const dayAfterTomorrow = shiftDate(today, 2);

  // 1. Subjects
  const demoSubjects: Subject[] = [
    { id: 'sbj_1', userId: user.id, name: 'Web dasturlash', code: 'CS301', teacher: 'Prof. Xoliqov', color: '#00E5FF' },
    { id: 'sbj_2', userId: user.id, name: 'Ma\'lumotlar bazasi', code: 'CS204', teacher: 'Dots. Rahimova', color: '#8B5CF6' },
    { id: 'sbj_3', userId: user.id, name: 'Sun\'iy intellekt', code: 'CS402', teacher: 'Dr. Karimov', color: '#22C55E' },
    { id: 'sbj_4', userId: user.id, name: 'Ingliz tili (Academic)', code: 'ENG201', teacher: 'Smith J.', color: '#F59E0B' },
  ];
  saveSubjects(demoSubjects);

  // 2. Class schedule (Timetable)
  const demoClasses: ClassSchedule[] = [
    { id: 'cls_1', userId: user.id, subjectId: 'sbj_1', subjectName: 'Web dasturlash', teacher: 'Prof. Xoliqov', room: '402-bino A', dayOfWeek: 1, startTime: '09:00', endTime: '10:30' },
    { id: 'cls_2', userId: user.id, subjectId: 'sbj_2', subjectName: 'Ma\'lumotlar bazasi', teacher: 'Dots. Rahimova', room: '215-lab', dayOfWeek: 1, startTime: '10:45', endTime: '12:15' },
    { id: 'cls_3', userId: user.id, subjectId: 'sbj_3', subjectName: 'Sun\'iy intellekt', teacher: 'Dr. Karimov', room: 'Bosh bino 101', dayOfWeek: 2, startTime: '13:30', endTime: '15:00' },
    { id: 'cls_4', userId: user.id, subjectId: 'sbj_4', subjectName: 'Ingliz tili (Academic)', teacher: 'Smith J.', room: '308-aud', dayOfWeek: 3, startTime: '09:00', endTime: '10:30' },
    { id: 'cls_5', userId: user.id, subjectId: 'sbj_1', subjectName: 'Web dasturlash (Amaliyot)', teacher: 'Prof. Xoliqov', room: 'IT Park lab 3', dayOfWeek: 4, startTime: '11:00', endTime: '12:30' },
  ];
  saveClassSchedules(demoClasses);

  // 3. Tasks
  const demoTasks: Task[] = [
    {
      id: 'tsk_1',
      userId: user.id,
      title: 'Ma\'lumotlar bazasi loyihasini topshirish',
      description: 'SQL queries, relational indexing va ERD diagrammasini yakunlab portalga yuklash.',
      category: 'O‘qish',
      priority: 'juda_muhim',
      status: 'jarayonda',
      plannedDate: today,
      plannedTime: '18:00',
      estimatedMinutes: 90,
      tags: ['Dars', 'Loyiha', 'Database'],
      createdAt: twoDaysAgo,
      updatedAt: today,
    },
    {
      id: 'tsk_2',
      userId: user.id,
      title: 'Dasturlash darsiga tayyorlanish (React Hooks)',
      description: 'useEffect, useMemo va context API mavzularini takrorlash.',
      category: 'O‘qish',
      priority: 'yuqori',
      status: 'bajarildi',
      plannedDate: today,
      plannedTime: '14:00',
      completedDate: today,
      completedTime: '12:30',
      estimatedMinutes: 60,
      tags: ['Frontend', 'Vazifa'],
      createdAt: yesterday,
      updatedAt: today,
    },
    {
      id: 'tsk_3',
      userId: user.id,
      title: 'Kutubxonadan yangi kitob olish (Clean Code)',
      description: 'Robert Martinning kitobini fakultet kutubxonasidan buyurtma qilish.',
      category: 'Shaxsiy',
      priority: 'orta',
      status: 'boshlanmagan',
      plannedDate: today,
      plannedTime: '16:30',
      estimatedMinutes: 30,
      tags: ['Mutolaa'],
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'tsk_4',
      userId: user.id,
      title: 'Ingliz tili essay yozish',
      description: '500 so‘zlik "Impact of AI in modern education" mavzusidagi insho.',
      category: 'O‘qish',
      priority: 'yuqori',
      status: 'bajarildi',
      plannedDate: yesterday,
      plannedTime: '20:00',
      completedDate: yesterday,
      completedTime: '18:45',
      estimatedMinutes: 75,
      tags: ['Academic', 'Writing'],
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
    },
    {
      id: 'tsk_5',
      userId: user.id,
      title: 'Algoritmik masalalar (LeetCode 3 ta)',
      description: 'Array va Two Pointer mavzulari bo‘yicha mashq.',
      category: 'Rivojlanish',
      priority: 'orta',
      status: 'bajarildi',
      plannedDate: twoDaysAgo,
      plannedTime: '21:00',
      completedDate: twoDaysAgo,
      completedTime: '20:15',
      estimatedMinutes: 60,
      tags: ['LeetCode', 'Coding'],
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: 'tsk_6',
      userId: user.id,
      title: 'Web dasturlash taqdimot slaydlarini tayyorlash',
      description: 'Next.js va server komponentlar arxitekturasi.',
      category: 'O‘qish',
      priority: 'yuqori',
      status: 'boshlanmagan',
      plannedDate: tomorrow,
      plannedTime: '17:00',
      estimatedMinutes: 120,
      tags: ['Presentation'],
      createdAt: today,
      updatedAt: today,
    },
  ];
  saveTasks(demoTasks);

  // 4. Measurable Habits & Logs across 14 days
  const demoHabits: Habit[] = [
    { id: 'hbt_1', userId: user.id, title: 'Suv ichish', icon: '💧', targetValue: 8, unit: 'stakan', frequency: 'daily', startDate: shiftDate(today, -14), color: '#00E5FF', createdAt: twoDaysAgo },
    { id: 'hbt_2', userId: user.id, title: 'Kitob mutolaasi', icon: '📖', targetValue: 30, unit: 'sahifa', frequency: 'daily', startDate: shiftDate(today, -14), color: '#8B5CF6', createdAt: twoDaysAgo },
    { id: 'hbt_3', userId: user.id, title: 'Dasturlash amaliyoti', icon: '💻', targetValue: 60, unit: 'daqiqa', frequency: 'daily', startDate: shiftDate(today, -14), color: '#22C55E', createdAt: twoDaysAgo },
    { id: 'hbt_4', userId: user.id, title: 'Sport / Badantarbiya', icon: '🏃', targetValue: 30, unit: 'daqiqa', frequency: 'daily', startDate: shiftDate(today, -14), color: '#F59E0B', createdAt: twoDaysAgo },
  ];
  saveHabits(demoHabits);

  const demoHabitLogs: HabitLog[] = [];
  for (let i = 14; i >= 0; i--) {
    const dStr = shiftDate(today, -i);
    // Habit 1: Suv (almost always done)
    const waterVal = i === 0 ? 6 : (i % 5 === 0 ? 7 : 8);
    demoHabitLogs.push({ id: `hl_w_${i}`, habitId: 'hbt_1', date: dStr, value: waterVal, isCompleted: waterVal >= 8 });

    // Habit 2: Kitob
    const bookVal = i === 0 ? 20 : (i % 4 === 0 ? 15 : 35);
    demoHabitLogs.push({ id: `hl_b_${i}`, habitId: 'hbt_2', date: dStr, value: bookVal, isCompleted: bookVal >= 30 });

    // Habit 3: Code
    const codeVal = i === 0 ? 45 : (i % 6 === 0 ? 30 : 60);
    demoHabitLogs.push({ id: `hl_c_${i}`, habitId: 'hbt_3', date: dStr, value: codeVal, isCompleted: codeVal >= 60 });

    // Habit 4: Sport
    if (i % 2 === 0) {
      demoHabitLogs.push({ id: `hl_s_${i}`, habitId: 'hbt_4', date: dStr, value: 30, isCompleted: true });
    }
  }
  saveHabitLogs(demoHabitLogs);

  // 5. Goals
  const demoGoals: Goal[] = [
    {
      id: 'gol_1',
      userId: user.id,
      title: '2026-yilda 20 ta foydali kitob o‘qish',
      description: 'Shaxsiy rivojlanish, muhandislik va ilmiy adabiyotlar.',
      type: 'number',
      period: 'yearly',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      targetValue: 20,
      currentValue: 14,
      unit: 'ta kitob',
      isCompleted: false,
      createdAt: '2026-01-01',
      updatedAt: today,
    },
    {
      id: 'gol_2',
      userId: user.id,
      title: 'LeetCode masalalar sonini 100 taga yetkazish',
      description: 'Data Structures and Algorithms bo‘yicha intervyuga tayyorgarlik.',
      type: 'number',
      period: 'monthly',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      targetValue: 100,
      currentValue: 78,
      unit: 'masala',
      isCompleted: false,
      createdAt: '2026-09-01',
      updatedAt: today,
    },
    {
      id: 'gol_3',
      userId: user.id,
      title: 'IELTS Academic tayyorgarligi (7.5 ball)',
      description: 'Har kuni reading va listening amaliyoti.',
      type: 'percentage',
      period: 'custom',
      startDate: '2026-08-01',
      endDate: '2026-11-15',
      targetValue: 100,
      currentValue: 65,
      unit: '%',
      isCompleted: false,
      createdAt: '2026-08-01',
      updatedAt: today,
    },
  ];
  saveGoals(demoGoals);

  // 6. Financial Transactions
  const demoTransactions: Transaction[] = [
    { id: 'tx_1', userId: user.id, type: 'daromad', amount: 1500000, category: 'Ta\'lim', description: 'Oylik talabalik stipendiyasi', date: shiftDate(today, -5), time: '10:00', paymentMethod: 'Karta', createdAt: shiftDate(today, -5) },
    { id: 'tx_2', userId: user.id, type: 'daromad', amount: 800000, category: 'Boshqa', description: 'Freelance frontend loyihasi bo‘nak', date: shiftDate(today, -3), time: '15:20', paymentMethod: 'Karta', createdAt: shiftDate(today, -3) },
    { id: 'tx_3', userId: user.id, type: 'xarajat', amount: 35000, category: 'Oziq-ovqat', description: 'Universitet oshxonasida tushlik', date: today, time: '13:10', paymentMethod: 'Karta', createdAt: today },
    { id: 'tx_4', userId: user.id, type: 'xarajat', amount: 12000, category: 'Transport', description: 'Metro va avtobus yo‘l haqi', date: today, time: '08:40', paymentMethod: 'Karta', createdAt: today },
    { id: 'tx_5', userId: user.id, type: 'xarajat', amount: 125000, category: 'Ta\'lim', description: 'Dasturlash bo‘yicha qo‘llanma kitob', date: yesterday, time: '16:00', paymentMethod: 'Naqd', createdAt: yesterday },
    { id: 'tx_6', userId: user.id, type: 'xarajat', amount: 45000, category: 'Aloqa', description: 'Mobil internet tarifi to‘lovi', date: shiftDate(today, -4), time: '11:15', paymentMethod: 'Karta', createdAt: shiftDate(today, -4) },
    { id: 'tx_7', userId: user.id, type: 'xarajat', amount: 90000, category: 'Ko‘ngilochar', description: 'Guruhdoshlar bilan kinoteatr', date: shiftDate(today, -2), time: '19:30', paymentMethod: 'Karta', createdAt: shiftDate(today, -2) },
  ];
  saveTransactions(demoTransactions);

  // 7. Study Sessions (Pomodoro)
  const demoSessions: StudySession[] = [
    { id: 'ses_1', userId: user.id, subjectId: 'sbj_1', subjectName: 'Web dasturlash', date: today, startTime: '11:00', endTime: '11:50', durationMinutes: 50, sessionType: 'pomodoro', notes: 'TypeScript generics va interfaces', createdAt: today },
    { id: 'ses_2', userId: user.id, subjectId: 'sbj_2', subjectName: 'Ma\'lumotlar bazasi', date: today, startTime: '14:30', endTime: '15:15', durationMinutes: 45, sessionType: 'pomodoro', notes: 'PostgreSQL joins va aggregations', createdAt: today },
    { id: 'ses_3', userId: user.id, subjectId: 'sbj_3', subjectName: 'Sun\'iy intellekt', date: yesterday, startTime: '16:00', endTime: '17:00', durationMinutes: 60, sessionType: 'pomodoro', notes: 'Gradient descent va linear regression', createdAt: yesterday },
    { id: 'ses_4', userId: user.id, subjectId: 'sbj_4', subjectName: 'Ingliz tili (Academic)', date: yesterday, startTime: '19:00', endTime: '19:40', durationMinutes: 40, sessionType: 'pomodoro', notes: 'Reading passage 3 tahlili', createdAt: yesterday },
    { id: 'ses_5', userId: user.id, subjectId: 'sbj_1', subjectName: 'Web dasturlash', date: shiftDate(today, -2), startTime: '10:00', endTime: '11:30', durationMinutes: 90, sessionType: 'pomodoro', notes: 'State management', createdAt: shiftDate(today, -2) },
  ];
  saveStudySessions(demoSessions);

  // 8. Assignments & Deadlines
  const demoAssignments: Assignment[] = [
    { id: 'asg_1', userId: user.id, subjectId: 'sbj_2', subjectName: 'Ma\'lumotlar bazasi', title: 'Laboratoriya ishi #4 (Indexation & Triggers)', description: 'Jadval indekslari samaradorligini tahlil qilish va trigger yozish.', deadlineDate: today, deadlineTime: '23:59', priority: 'juda_muhim', status: 'kutilmoqda', createdAt: twoDaysAgo },
    { id: 'asg_2', userId: user.id, subjectId: 'sbj_1', subjectName: 'Web dasturlash', title: 'Kurs ishi oraliq taqdimoti', description: 'Loyiha frontend qismi to‘liq ishlashi kerak.', deadlineDate: dayAfterTomorrow, deadlineTime: '12:00', priority: 'yuqori', status: 'kutilmoqda', createdAt: yesterday },
    { id: 'asg_3', userId: user.id, subjectId: 'sbj_4', subjectName: 'Ingliz tili (Academic)', title: 'Writing Task 1 hisoboti', description: 'Grafik va diagrammalar tavsifi.', deadlineDate: shiftDate(today, 4), deadlineTime: '18:00', priority: 'orta', status: 'kutilmoqda', createdAt: today },
  ];
  saveAssignments(demoAssignments);

  // 9. Exams
  const demoExams: Exam[] = [
    { id: 'exm_1', userId: user.id, subjectId: 'sbj_2', subjectName: 'Ma\'lumotlar bazasi', date: shiftDate(today, 6), time: '09:00', location: 'Bosh bino, 3-etaj, 305-zal', preparationProgress: 75, notes: 'Normal shakllar va tranzaksiyalar (ACID) ga ko‘proq urg‘u berish', createdAt: twoDaysAgo },
    { id: 'exm_2', userId: user.id, subjectId: 'sbj_1', subjectName: 'Web dasturlash', date: shiftDate(today, 12), time: '11:30', location: 'IT bino, 204-auditoriya', preparationProgress: 60, notes: 'JavaScript event loop, microtasks va async/await', createdAt: yesterday },
  ];
  saveExams(demoExams);

  // 10. Notes
  const demoNotes: Note[] = [
    { id: 'not_1', userId: user.id, title: 'Universitet kurs ishi g‘oyalari', content: '1. Talabalar uchun rejalashtirish platformasi (DailyLife Hub)\n2. AI yordamida ilmiy maqolalarni tahlil qilish\n3. Avtomatlashtirilgan dars jadvali tuzish algoritmi.', tags: ['Loyiha', 'G‘oya'], isPinned: true, isArchived: false, color: '#00E5FF', createdAt: twoDaysAgo, updatedAt: yesterday },
    { id: 'not_2', userId: user.id, title: 'Algoritmlar bo‘yicha foydali formulalar', content: 'Binary search: mid = low + (high - low) / 2;\nDynamic programming: subproblem memoization;\nGraph traversal: BFS navbat, DFS stek.', tags: ['Algoritmlar', 'Formula'], isPinned: false, isArchived: false, color: '#8B5CF6', createdAt: shiftDate(today, -3), updatedAt: shiftDate(today, -3) },
  ];
  saveNotes(demoNotes);

  // 11. Reminders
  const demoReminders: Reminder[] = [
    { id: 'rem_1', userId: user.id, title: 'Kutubxonaga kitob topshirish', description: 'Fakultet kutubxonasiga darslikni qaytarish muddati bugun.', date: today, time: '15:00', repeat: 'once', priority: 'yuqori', isCompleted: false, createdAt: yesterday },
    { id: 'rem_2', userId: user.id, title: 'Suv ichish eslatmasi', description: 'Har 2 soatda 1 stakan toza suv iching.', date: today, time: '16:00', repeat: '2h', priority: 'orta', isCompleted: false, createdAt: today },
  ];
  saveReminders(demoReminders);

  // 12. Notifications
  const demoNotifications: AppNotification[] = [
    { id: 'ntf_1', title: 'Yaqinlashayotgan deadline', message: 'Bugun soat 23:59 da "Laboratoriya ishi #4" topshirilishi kerak.', date: today, time: '09:00', type: 'deadline', isRead: false, linkSection: 'study', createdAt: today },
    { id: 'ntf_2', title: 'Odat muvaffaqiyati 🔥', message: 'Siz ketma-ket 14 kundan buyon suv ichish rejasini ajoyib bajarmoqdasiz!', date: today, time: '10:30', type: 'habit', isRead: false, linkSection: 'habits', createdAt: today },
    { id: 'ntf_3', title: 'Vazifa o‘z vaqtida bajarildi', message: '"Dasturlash darsiga tayyorlanish" vazifasi 1 soat 30 daqiqa oldin yakunlandi.', date: today, time: '12:35', type: 'task', isRead: true, linkSection: 'tasks', createdAt: today },
  ];
  saveNotifications(demoNotifications);

  setDemoMode(true);
  notifyDataChanged();
}

// Clear demo data and reset to fresh initial user state
export function clearDemoData(): void {
  const user = getUser();
  const userName = user?.name || '';
  
  // Clear all modules
  localStorage.removeItem(KEYS.TASKS);
  localStorage.removeItem(KEYS.GOALS);
  localStorage.removeItem(KEYS.TRANSACTIONS);
  localStorage.removeItem(KEYS.NOTES);
  localStorage.removeItem(KEYS.REMINDERS);
  localStorage.removeItem(KEYS.HABITS);
  localStorage.removeItem(KEYS.HABIT_LOGS);
  localStorage.removeItem(KEYS.SUBJECTS);
  localStorage.removeItem(KEYS.CLASSES);
  localStorage.removeItem(KEYS.ASSIGNMENTS);
  localStorage.removeItem(KEYS.EXAMS);
  localStorage.removeItem(KEYS.STUDY_SESSIONS);
  localStorage.removeItem(KEYS.NOTIFICATIONS);
  localStorage.removeItem(KEYS.IS_DEMO);

  if (userName) {
    saveUser(userName);
  }

  notifyDataChanged();
}

// Complete factory reset (deletes all data including user)
export function resetAllData(): void {
  localStorage.clear();
  notifyDataChanged();
}

// Export all application data as JSON
export function exportAllDataJSON(): string {
  const exportPayload = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    appName: 'DailyLife Hub',
    user: getUser(),
    tasks: getTasks(),
    goals: getGoals(),
    transactions: getTransactions(),
    notes: getNotes(),
    reminders: getReminders(),
    habits: getHabits(),
    habitLogs: getHabitLogs(),
    subjects: getSubjects(),
    classes: getClassSchedules(),
    assignments: getAssignments(),
    exams: getExams(),
    studySessions: getStudySessions(),
    notifications: getNotifications(),
  };
  return JSON.stringify(exportPayload, null, 2);
}

// Export financial transactions as CSV
export function exportTransactionsCSV(): string {
  const txs = getTransactions();
  const headers = ['ID', 'Turi', 'Summa', 'Kategoriya', 'Izoh', 'Sana', 'Vaqt', 'To‘lov usuli'];
  const rows = txs.map((t) => [
    t.id,
    t.type === 'daromad' ? 'Daromad' : 'Xarajat',
    t.amount,
    `"${t.category}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.date,
    t.time,
    t.paymentMethod,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// Import JSON
export function importDataJSON(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (data.user) setItem(KEYS.USER, data.user);
    if (Array.isArray(data.tasks)) setItem(KEYS.TASKS, data.tasks);
    if (Array.isArray(data.goals)) setItem(KEYS.GOALS, data.goals);
    if (Array.isArray(data.transactions)) setItem(KEYS.TRANSACTIONS, data.transactions);
    if (Array.isArray(data.notes)) setItem(KEYS.NOTES, data.notes);
    if (Array.isArray(data.reminders)) setItem(KEYS.REMINDERS, data.reminders);
    if (Array.isArray(data.habits)) setItem(KEYS.HABITS, data.habits);
    if (Array.isArray(data.habitLogs)) setItem(KEYS.HABIT_LOGS, data.habitLogs);
    if (Array.isArray(data.subjects)) setItem(KEYS.SUBJECTS, data.subjects);
    if (Array.isArray(data.classes)) setItem(KEYS.CLASSES, data.classes);
    if (Array.isArray(data.assignments)) setItem(KEYS.ASSIGNMENTS, data.assignments);
    if (Array.isArray(data.exams)) setItem(KEYS.EXAMS, data.exams);
    if (Array.isArray(data.studySessions)) setItem(KEYS.STUDY_SESSIONS, data.studySessions);
    if (Array.isArray(data.notifications)) setItem(KEYS.NOTIFICATIONS, data.notifications);
    setDemoMode(false);
    notifyDataChanged();
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Noto‘g‘ri JSON format' };
  }
}
