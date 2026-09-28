import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Bell,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { Reminder, ReminderRepeat, Priority } from '../types';
import {
  getReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  addNotification,
} from '../services/storage';
import { formatUzbekDate, getTodayString, getCurrentTimeString } from '../utils/dateUtils';

interface RemindersViewProps {
  onOpenQuickAdd: (tab?: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ onOpenQuickAdd }) => {
  const reminders = getReminders();
  const today = getTodayString();
  const currentTime = getCurrentTimeString();
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const requestBrowserPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const res = await Notification.requestPermission();
      setNotificationStatus(res);
      if (res === 'granted') {
        new Notification('DailyLife Hub', {
          body: 'Bildirishnomalar muvaffaqiyatli faollashtirildi!',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleComplete = (r: Reminder) => {
    const nextCompleted = !r.isCompleted;
    updateReminder(r.id, { isCompleted: nextCompleted });

    if (nextCompleted) {
      addNotification({
        title: 'Eslatma bajarildi',
        message: `"${r.title}" eslatmasi muvaffaqiyatli yakunlandi.`,
        date: today,
        time: currentTime,
        type: 'task',
      });
    }
  };

  const getRepeatLabel = (repeat: ReminderRepeat) => {
    switch (repeat) {
      case 'once':
        return 'Bir marta';
      case '1h':
        return 'Har soatda';
      case '2h':
        return 'Har 2 soatda';
      case '3h':
        return 'Har 3 soatda';
      case '6h':
        return 'Har 6 soatda';
      case 'daily':
        return 'Har kuni';
      case 'weekly':
        return 'Har hafta';
      default:
        return 'Maxsus';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00E5FF]" />
            <span>Eslatgichlar va bildirishnomalar</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Muhim vaqtlar, takroriy eslatmalar va brauzer bildirishnomalari
          </p>
        </div>
        <button
          onClick={() => onOpenQuickAdd('reminder')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 hover:opacity-95 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Eslatma qo‘shish</span>
        </button>
      </div>

      {/* Browser Notification Permission Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Brauzer bildirishnomalari</div>
            <div className="text-[11px] text-slate-400">
              {notificationStatus === 'granted'
                ? 'Brauzer ruxsati berilgan — eslatmalar o‘z vaqtida ko‘rsatiladi.'
                : notificationStatus === 'denied'
                ? 'Brauzer ruxsati rad etilgan. Tizim ichki bildirishnomalardan foydalanadi.'
                : 'Brauzer orqali eslatmalar olish uchun ruxsat bering.'}
            </div>
          </div>
        </div>

        {notificationStatus !== 'granted' && notificationStatus !== 'unsupported' && (
          <button
            onClick={requestBrowserPermission}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors shrink-0"
          >
            Ruxsat berish
          </button>
        )}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-[#0D1424] border border-slate-800 p-8">
            <Clock className="w-12 h-12 mx-auto text-slate-600 mb-3 stroke-1" />
            <h3 className="text-base font-bold text-white">Hozircha eslatmalar yo‘q</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Kitob qaytarish, dorilar qabul qilish yoki darsga tayyorlanish bo‘yicha eslatmalar kiriting.
            </p>
            <button
              onClick={() => onOpenQuickAdd('reminder')}
              className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Birinchi eslatmani qo‘shish</span>
            </button>
          </div>
        ) : (
          reminders.map((r) => {
            const isDone = r.isCompleted;
            return (
              <div
                key={r.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-70'
                    : 'glass-panel border-slate-800 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(r)}
                      className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 hover:border-[#00E5FF]'
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
                          {r.title}
                        </span>
                        {r.repeat !== 'once' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium flex items-center gap-1">
                            <Repeat className="w-3 h-3" />
                            {getRepeatLabel(r.repeat)}
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                      )}
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        {formatUzbekDate(r.date, false)} soat {r.time}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteReminder(r.id)}
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
  );
};
