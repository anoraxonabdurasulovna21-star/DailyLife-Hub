import React from 'react';
import {
  Home,
  CheckSquare,
  Target,
  Wallet,
  Droplet,
  FileText,
  Clock,
  BookOpen,
  Timer,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { User } from '../types';
import { isDemoMode, loadDemoData, clearDemoData } from '../services/storage';

export type NavSection =
  | 'dashboard'
  | 'tasks'
  | 'goals'
  | 'finance'
  | 'habits'
  | 'notes'
  | 'reminders'
  | 'study'
  | 'timer'
  | 'calendar'
  | 'statistics'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  user,
}) => {
  const isDemo = isDemoMode();

  const navGroups = [
    {
      label: 'ASOSIY',
      items: [
        { id: 'dashboard' as NavSection, label: 'Bosh sahifa', icon: Home },
        { id: 'tasks' as NavSection, label: 'Vazifalar', icon: CheckSquare },
        { id: 'goals' as NavSection, label: 'Maqsadlar', icon: Target },
      ],
    },
    {
      label: 'KUNDALIK HAYOT',
      items: [
        { id: 'finance' as NavSection, label: 'Moliya', icon: Wallet },
        { id: 'habits' as NavSection, label: 'Odatlar', icon: Droplet },
        { id: 'notes' as NavSection, label: 'Qaydlar', icon: FileText },
        { id: 'reminders' as NavSection, label: 'Eslatgichlar', icon: Clock },
      ],
    },
    {
      label: 'O‘QISH',
      items: [
        { id: 'study' as NavSection, label: 'O‘qish markazi', icon: BookOpen },
        { id: 'timer' as NavSection, label: 'O‘qish taymeri', icon: Timer },
      ],
    },
    {
      label: 'TAHLIL',
      items: [
        { id: 'calendar' as NavSection, label: 'Kalendar', icon: Calendar },
        { id: 'statistics' as NavSection, label: 'Statistika', icon: BarChart3 },
      ],
    },
    {
      label: 'TIZIM',
      items: [
        { id: 'settings' as NavSection, label: 'Sozlamalar', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 h-screen bg-[#070B14]/95 border-r border-slate-800/80 flex flex-col justify-between select-none shrink-0 overflow-y-auto">
      {/* Top Branding */}
      <div>
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-cyan-500/20">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-950 fill-none stroke-current stroke-2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M7 16l3-3 2 2 4-5" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white flex items-center leading-tight">
                DailyLife <span className="text-[#00E5FF] ml-1">Hub</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium leading-none mt-1">
                Hayot boshqaruv markazi
              </div>
            </div>
          </div>
        </div>

        {/* Demo banner indicator */}
        <div className="px-4 mb-2">
          {isDemo ? (
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Demo rejim faol</span>
              </div>
              <button
                onClick={() => clearDemoData()}
                title="Demo ma'lumotlarini tozalash"
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Tozalash</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => loadDemoData(user?.name)}
              className="w-full py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Demo ma'lumotlarini yuklash</span>
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="px-3 py-2 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 shadow-sm shadow-cyan-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00E5FF]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <button
          onClick={() => onSelectSection('settings')}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
            {user?.avatar || '👤'}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors">
              {user?.name || 'Foydalanuvchi'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Profil va sozlamalar
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};
