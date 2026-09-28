export type Priority = 'past' | 'orta' | 'yuqori' | 'juda_muhim';

export type TaskStatus = 'boshlanmagan' | 'jarayonda' | 'bajarildi' | 'muddati_otgan';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
  settings: {
    language: 'uz';
    currency: 'UZS';
    timeFormat: '24h';
    notificationsEnabled: boolean;
    soundEnabled: boolean;
  };
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  startDate?: string;
  plannedDate: string; // YYYY-MM-DD
  plannedTime?: string; // HH:MM
  completedDate?: string; // YYYY-MM-DD
  completedTime?: string; // HH:MM
  estimatedMinutes?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type GoalType = 'number' | 'percentage' | 'duration' | 'currency' | 'custom';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: GoalType;
  period: GoalPeriod;
  startDate: string;
  endDate: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isCompleted: boolean;
  achievedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'daromad' | 'xarajat';

export type FinanceCategory = 
  | 'Oziq-ovqat'
  | 'Transport'
  | 'Ta\'lim'
  | 'Sog‘liq'
  | 'Xarid'
  | 'Ko‘ngilochar'
  | 'Uy-joy'
  | 'Aloqa'
  | 'Boshqa';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: FinanceCategory | string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  paymentMethod: 'Naqd' | 'Karta' | 'Bank' | 'Boshqa';
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  color?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReminderRepeat = 'once' | '1h' | '2h' | '3h' | '6h' | 'daily' | 'weekly' | 'custom';

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  repeat: ReminderRepeat;
  priority: Priority;
  isCompleted: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  icon: string;
  targetValue: number;
  unit: string; // masalan: 'stakan', 'sahifa', 'daqiqa', 'marta'
  frequency: 'daily' | 'weekly';
  startDate: string;
  endDate?: string;
  color?: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number;
  isCompleted: boolean;
  notes?: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code?: string;
  teacher?: string;
  color: string;
}

export interface ClassSchedule {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  teacher?: string;
  room?: string;
  dayOfWeek: number; // 1 = Dushanba, 7 = Yakshanba
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface Assignment {
  id: string;
  userId: string;
  subjectId?: string;
  subjectName: string;
  title: string;
  description?: string;
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:MM
  priority: Priority;
  status: 'kutilmoqda' | 'topshirildi' | 'kechikkan';
  createdAt: string;
}

export interface Exam {
  id: string;
  userId: string;
  subjectId?: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location?: string;
  preparationProgress: number; // 0..100
  notes?: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId?: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  sessionType: 'pomodoro' | 'qisqa_tanaffus' | 'uzoq_tanaffus' | 'maxsus';
  notes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  type: 'deadline' | 'task' | 'habit' | 'study' | 'finance' | 'system';
  isRead: boolean;
  linkSection?: string;
  createdAt: string;
}
