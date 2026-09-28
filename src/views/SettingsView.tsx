import React, { useState } from 'react';
import {
  Settings,
  User as UserIcon,
  Download,
  Upload,
  Trash2,
  Sparkles,
  ShieldAlert,
  Check,
  Globe,
  DollarSign,
  Clock,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { User } from '../types';
import {
  updateUser,
  exportAllDataJSON,
  exportTransactionsCSV,
  importDataJSON,
  resetAllData,
  loadDemoData,
  clearDemoData,
  isDemoMode,
} from '../services/storage';

interface SettingsViewProps {
  user: User | null;
  onUserUpdated: (u: User) => void;
  onResetApp: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUserUpdated,
  onResetApp,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '👨‍💻');
  const [nameSaved, setNameSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const isDemo = isDemoMode();

  const avatarOptions = ['👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '🚀', '⚡', '🎯', '💡', '🌟', '👤'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const updated = updateUser({ name: name.trim(), avatar });
    if (updated) {
      onUserUpdated(updated);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dailylife-hub-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvStr = exportTransactionsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dailylife-moliya-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON File
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataJSON(content);
      if (res.success) {
        setImportStatus('Ma’lumotlar muvaffaqiyatli tiklandi!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Xatolik: ' + (res.error || 'Fayl formati noto‘g‘ri'));
      }
    };
    reader.readAsText(file);
  };

  // Handle Full Reset
  const handleConfirmReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    onResetApp();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-cyan-500/20 shadow-xl">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#00E5FF]" />
          <span>Tizim va shaxsiy sozlamalar</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Profil, til, valyuta, ma'lumotlar eksporti va xavfsizlik
        </p>
      </div>

      {/* 1. PROFIL VA ISMNI O‘ZGARTIRISH */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-[#00E5FF]" />
          <span>Profil ma'lumotlari</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Avatar tanlang
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {avatarOptions.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                    avatar === av
                      ? 'bg-[#00E5FF]/20 border border-[#00E5FF] shadow-sm'
                      : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ismingiz (Tizim sizga shu ism bilan murojaat qiladi)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Aziz"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              Saqlash
            </button>
            {nameSaved && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Muvaffaqiyatli saqlandi!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. MAHALLIYLASHTIRISH VA PREFERENSIYALAR */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#00E5FF]" />
          <span>Tizim parametrlari</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400">Asosiy til</span>
            <div className="text-sm font-bold text-white">O‘zbekcha (Lotin)</div>
            <p className="text-[10px] text-slate-500">Standart platforma tili</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400">Asosiy valyuta</span>
            <div className="text-sm font-bold text-emerald-400 font-mono">UZS — so‘m</div>
            <p className="text-[10px] text-slate-500">Moliyaviy hisob-kitoblar</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400">Vaqt formati</span>
            <div className="text-sm font-bold text-white font-mono">24-soatlik</div>
            <p className="text-[10px] text-slate-500">Dushanba → Yakshanba</p>
          </div>
        </div>
      </div>

      {/* 3. DEMO MA'LUMOTLARINI BOSHQARISH */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Universitet tanlovi uchun demo rejim</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hakamlar va taqdimot uchun 30 kunlik to‘liq talabalik namunaviy ma'lumotlarini yuklash
            </p>
          </div>
          {isDemo && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
              Faol
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => loadDemoData(user?.name)}
            className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Demo ma'lumotlarini yuklash</span>
          </button>
          <button
            onClick={() => clearDemoData()}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Demo ma'lumotlarini tozalash</span>
          </button>
        </div>
      </div>

      {/* 4. MA'LUMOTLARNI EKSPORT VA IMPORT QILISH */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-[#00E5FF]" />
          <span>Ma'lumotlar zaxirasi (Backup & Export)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Shaxsiy ma'lumotlaringizni to‘liq JSON yoki CSV formatida yuklab oling va istalgan vaqtda qayta tiklang.
        </p>

        <div className="flex items-center gap-3 flex-wrap pt-1">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#00E5FF]" />
            <span>Barcha ma'lumotlarni eksport qilish (JSON)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Moliyani eksport qilish (CSV)</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-purple-400" />
            <span>JSON zaxirasidan tiklash</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        {importStatus && (
          <p className="text-xs font-semibold text-[#00E5FF] mt-2">{importStatus}</p>
        )}
      </div>

      {/* 5. DANGER ZONE: BARCHA MA'LUMOTLARNI TOZALASH */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 space-y-4 bg-rose-950/10">
        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Xavfli hudud (Barcha ma'lumotlarni o‘chirish)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Tizimdan barcha shaxsiy vazifalar, odatlar, moliyaviy yozuvlar va profil butunlay o‘chiriladi.
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Tizimni to‘liq tozalash (Zavod holati)</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-3">
            <p className="text-xs text-rose-300 font-bold leading-relaxed">
              Diqqat! Barcha tarixiy ma'lumotlaringiz o‘chiriladi. Bu amalni qaytarib bo‘lmaydi. Rozimisiz?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-xs text-slate-300 hover:text-white"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white"
              >
                Ha, barchasini o‘chirish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
