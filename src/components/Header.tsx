import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Check,
  Trash2,
  Calendar as CalendarIcon,
  X,
  ExternalLink,
} from 'lucide-react';
import { User, AppNotification } from '../types';
import { NavSection } from './Sidebar';
import { formatUzbekDate, getTodayString } from '../utils/dateUtils';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../services/storage';

interface HeaderProps {
  currentSection: NavSection;
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  onSelectSection: (section: NavSection) => void;
  user: User | null;
}

const SECTION_TITLES: Record<NavSection, { title: string; subtitle: string }> = {
  dashboard: { title: 'Bosh sahifa', subtitle: 'Kuningizning to‘liq nazorat markazi' },
  tasks: { title: 'Vazifalar', subtitle: 'Rejalar, ustuvorliklar va muddatlar' },
  goals: { title: 'Maqsadlar', subtitle: 'Katta va kichik marralarga erishish' },
  finance: { title: 'Moliya', subtitle: 'Kalkulyator, daromad va xarajatlar tahlili' },
  habits: { title: 'Odatlar', subtitle: 'Intizom, zanjirlar va barqarorlik' },
  notes: { title: 'Qaydlar', subtitle: 'Fikrlar, loyihalar va muhim eslatmalar' },
  reminders: { title: 'Eslatgichlar', subtitle: 'Muhim voqealar va xabarlar' },
  study: { title: 'O‘qish markazi', subtitle: 'Dars jadvali, topshiriqlar va imtihonlar' },
  timer: { title: 'O‘qish taymeri', subtitle: 'Pomodoro va konsentratsiya seanslari' },
  calendar: { title: 'Kalendar', subtitle: 'Barcha rejalarning yaxlit taqvimi' },
  statistics: { title: 'Statistika va tahlil', subtitle: 'Faktik natijalar va AI xulosalari' },
  settings: { title: 'Sozlamalar', subtitle: 'Profil va ma’lumotlarni boshqarish' },
};

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onOpenQuickAdd,
  onOpenSearch,
  onSelectSection,
  user,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const today = getTodayString();
  const formattedToday = formatUzbekDate(today, true);
  const meta = SECTION_TITLES[currentSection] || { title: 'DailyLife Hub', subtitle: '' };

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.linkSection) {
      onSelectSection(notif.linkSection as NavSection);
      setShowNotifications(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#070B14]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Page Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
            {meta.title}
          </h1>
          <p className="hidden md:block text-[11px] text-slate-400 font-medium">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-medium text-slate-300">
          <CalendarIcon className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>{formattedToday}</span>
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          title="Qidirish (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Qidirish...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden xs:inline">Qo‘shish</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Bildirishnomalar"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-2xl z-50 p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Bildirishnomalar</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00E5FF] font-semibold">
                      {unreadCount} yangi
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
                      title="Barchasini o‘qilgan deb belgilash"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>O‘qildi</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 mt-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Hozircha yangi bildirishnomalar yo‘q
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-2 my-1 ${
                        !n.isRead
                          ? 'bg-slate-800/40 border border-cyan-500/20'
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shrink-0" />
                          )}
                          <div className="text-xs font-bold text-white">{n.title}</div>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">{n.message}</p>
                        <div className="text-[10px] text-slate-400">
                          {formatUzbekDate(n.date, false)} {n.time}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
