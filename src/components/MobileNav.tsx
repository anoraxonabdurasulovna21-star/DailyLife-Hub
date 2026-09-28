import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  Wallet,
  Droplet,
  BookOpen,
  MoreHorizontal,
  Target,
  FileText,
  Clock,
  Timer,
  Calendar,
  BarChart3,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { NavSection } from './Sidebar';
import { isDemoMode, loadDemoData, clearDemoData } from '../services/storage';

interface MobileNavProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  userName?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentSection,
  onSelectSection,
  userName,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const isDemo = isDemoMode();

  const primaryItems = [
    { id: 'dashboard' as NavSection, label: 'Asosiy', icon: Home },
    { id: 'tasks' as NavSection, label: 'Vazifalar', icon: CheckSquare },
    { id: 'habits' as NavSection, label: 'Odatlar', icon: Droplet },
    { id: 'finance' as NavSection, label: 'Moliya', icon: Wallet },
    { id: 'study' as NavSection, label: 'O‘qish', icon: BookOpen },
  ];

  const secondaryItems = [
    { id: 'goals' as NavSection, label: 'Maqsadlar', icon: Target },
    { id: 'timer' as NavSection, label: 'O‘qish taymeri', icon: Timer },
    { id: 'calendar' as NavSection, label: 'Kalendar', icon: Calendar },
    { id: 'statistics' as NavSection, label: 'Statistika', icon: BarChart3 },
    { id: 'notes' as NavSection, label: 'Qaydlar', icon: FileText },
    { id: 'reminders' as NavSection, label: 'Eslatgichlar', icon: Clock },
    { id: 'settings' as NavSection, label: 'Sozlamalar', icon: Settings },
  ];

  const handleSelect = (section: NavSection) => {
    onSelectSection(section);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* "Ko‘proq" Drawer Modal */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-[#070B14]/80 backdrop-blur-md flex flex-col justify-end p-4">
          <div className="w-full bg-[#0D1424] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="font-bold text-base text-white">Barcha bo‘limlar</div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demo button inside more menu */}
            <div className="py-1">
              {isDemo ? (
                <button
                  onClick={() => {
                    clearDemoData();
                    setShowMoreMenu(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs font-semibold text-purple-300 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Demo ma'lumotlarini tozalash</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    loadDemoData(userName);
                    setShowMoreMenu(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#00E5FF]" />
                  <span>Demo ma'lumotlarini yuklash</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
                        : 'bg-slate-900/60 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#00E5FF]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070B14]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-[#00E5FF]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            showMoreMenu || secondaryItems.some((s) => s.id === currentSection)
              ? 'text-[#00E5FF]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Ko‘proq</span>
        </button>
      </nav>
    </>
  );
};
