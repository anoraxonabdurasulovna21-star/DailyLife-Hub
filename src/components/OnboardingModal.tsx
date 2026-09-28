import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { saveUser } from '../services/storage';
import { User } from '../types';

interface OnboardingModalProps {
  onComplete: (user: User) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Iltimos, ismingizni kiriting.');
      return;
    }
    const user = saveUser(name.trim(), '👨‍💻');
    onComplete(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B14]/80 backdrop-blur-xl">
      <div className="relative w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-[#0D1424] border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden">
        {/* Glow ambient backgrounds */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo Branding */}
        <div className="relative z-10 flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-none stroke-current stroke-2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M7 16l3-3 2 2 4-5" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              DailyLife <span className="text-[#00E5FF]">Hub</span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Shaxsiy hayot boshqaruv markazi</div>
          </div>
        </div>

        {/* Welcome Headers */}
        <div className="relative z-10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            DailyLife Hub'ga xush kelibsiz! 👋
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Kundalik hayotingizni, rejalaringizni, o‘qish va moliyangizni bitta qulay platformada boshqaring.
          </p>
        </div>

        {/* Feature pillars */}
        <div className="relative z-10 grid grid-cols-2 gap-3 mb-8">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E5FF] shrink-0" />
            <span>Keng qamrovli tahlil</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
            <span>Maxfiy va ishonchli</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Sizga qanday murojaat qilaylik?
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Masalan: Aziz"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all text-base"
              />
            </div>
            {error && <p className="mt-2 text-xs font-medium text-rose-400">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Boshlash</span>
            <ArrowRight className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </button>
        </form>

        <p className="relative z-10 mt-5 text-center text-xs text-slate-400">
          Ismingizni keyinchalik sozlamalar bo‘limidan o‘zgartirishingiz mumkin.
        </p>
      </div>
    </div>
  );
};
