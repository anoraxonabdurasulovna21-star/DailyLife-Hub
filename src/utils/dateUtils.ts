export const UZBEK_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

export const UZBEK_MONTHS_GENITIVE = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

export const UZBEK_DAYS = [
  'Yakshanba',
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
];

export const UZBEK_DAYS_SHORT = [
  'Yak',
  'Dush',
  'Sesh',
  'Chor',
  'Pay',
  'Jum',
  'Shan',
];

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatUzbekDate(dateStr?: string, includeYear: boolean = true): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const monthName = UZBEK_MONTHS_GENITIVE[monthIdx] || '';
  if (includeYear) {
    return `${day}-${monthName}, ${year}-yil`;
  }
  return `${day}-${monthName}`;
}

export function getUzbekDayName(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return UZBEK_DAYS[date.getDay()];
}

export function getGreeting(userName: string): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Xayrli kun';
  if (hour >= 5 && hour < 12) {
    timeGreeting = 'Xayrli tong';
  } else if (hour >= 12 && hour < 18) {
    timeGreeting = 'Xayrli kun';
  } else if (hour >= 18 && hour < 23) {
    timeGreeting = 'Xayrli kech';
  } else {
    timeGreeting = 'Xayrli tun';
  }
  return `${timeGreeting}, ${userName || 'Foydalanuvchi'}! 👋`;
}

/**
 * Calculates whether task was completed early, on time, or late,
 * returning human-readable natural Uzbek string.
 */
export function calculateTaskTiming(
  plannedDate?: string,
  plannedTime?: string,
  completedDate?: string,
  completedTime?: string
): {
  status: 'early' | 'on_time' | 'late' | 'unknown';
  text: string;
  diffMinutes: number;
} {
  if (!plannedDate || !completedDate) {
    return { status: 'unknown', text: 'Vaqt ma\'lumotlari to‘liq emas', diffMinutes: 0 };
  }

  const pTime = plannedTime || '23:59';
  const cTime = completedTime || '12:00';

  const planned = new Date(`${plannedDate}T${pTime}:00`);
  const completed = new Date(`${completedDate}T${cTime}:00`);

  const diffMs = planned.getTime() - completed.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  // If completed within 15 minutes of deadline or on the exact same hour/day
  if (Math.abs(diffMinutes) <= 15) {
    return {
      status: 'on_time',
      text: 'O‘z vaqtida bajarildi',
      diffMinutes,
    };
  }

  const absMinutes = Math.abs(diffMinutes);
  const days = Math.floor(absMinutes / (24 * 60));
  const remainingHours = Math.floor((absMinutes % (24 * 60)) / 60);
  const minutes = absMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} kun`);
  if (remainingHours > 0) parts.push(`${remainingHours} soat`);
  if (minutes > 0 && days === 0) parts.push(`${minutes} daqiqa`);

  const durationStr = parts.join(' ') || '1 daqiqa';

  if (diffMinutes > 0) {
    return {
      status: 'early',
      text: `${durationStr} oldin bajarildi`,
      diffMinutes,
    };
  } else {
    return {
      status: 'late',
      text: `${durationStr} kechikib bajarildi`,
      diffMinutes,
    };
  }
}

/**
 * Get date range for current week (Dushanba -> Yakshanba)
 */
export function getCurrentWeekRange(referenceDate: Date = new Date()): { start: string; end: string } {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 is Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const da = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  return {
    start: format(monday),
    end: format(sunday),
  };
}

/**
 * Add or subtract days
 */
export function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
