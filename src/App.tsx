import React, { useState, useEffect } from 'react';
import { User } from './types';
import { getUser } from './services/storage';
import { OnboardingModal } from './components/OnboardingModal';
import { Sidebar, NavSection } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { QuickAddModal } from './components/QuickAddModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Views
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { GoalsView } from './views/GoalsView';
import { FinanceView } from './views/FinanceView';
import { HabitsView } from './views/HabitsView';
import { NotesView } from './views/NotesView';
import { RemindersView } from './views/RemindersView';
import { StudyView } from './views/StudyView';
import { StudyTimerView } from './views/StudyTimerView';
import { CalendarView } from './views/CalendarView';
import { StatisticsView } from './views/StatisticsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [user, setUser] = useState<User | null>(() => getUser());
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState('task');
  const [searchOpen, setSearchOpen] = useState(false);
  const [storageTick, setStorageTick] = useState(0);

  // Subscribe to storage update events
  useEffect(() => {
    const handleStorageChange = () => {
      setStorageTick((t) => t + 1);
      setUser(getUser());
    };

    window.addEventListener('dailylife_storage_change', handleStorageChange);
    return () => {
      window.removeEventListener('dailylife_storage_change', handleStorageChange);
    };
  }, []);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenQuickAdd = (tab: string = 'task') => {
    setQuickAddTab(tab);
    setQuickAddOpen(true);
  };

  // If user is not yet set, show Onboarding
  if (!user) {
    return <OnboardingModal onComplete={(newUser) => setUser(newUser)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070B14] text-slate-100 font-sans">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentSection={currentSection}
          onSelectSection={(sec) => setCurrentSection(sec)}
          user={user}
        />
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky Header */}
        <Header
          currentSection={currentSection}
          onOpenQuickAdd={() => handleOpenQuickAdd('task')}
          onOpenSearch={() => setSearchOpen(true)}
          onSelectSection={(sec) => setCurrentSection(sec)}
          user={user}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-8">
          {currentSection === 'dashboard' && (
            <DashboardView
              user={user}
              onNavigate={(sec) => setCurrentSection(sec)}
              onOpenQuickAdd={handleOpenQuickAdd}
            />
          )}

          {currentSection === 'tasks' && (
            <TasksView onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentSection === 'goals' && (
            <GoalsView onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentSection === 'finance' && <FinanceView />}

          {currentSection === 'habits' && (
            <HabitsView onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentSection === 'notes' && (
            <NotesView onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentSection === 'reminders' && (
            <RemindersView onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentSection === 'study' && (
            <StudyView
              onOpenQuickAdd={handleOpenQuickAdd}
              onNavigateToTimer={() => setCurrentSection('timer')}
            />
          )}

          {currentSection === 'timer' && <StudyTimerView />}

          {currentSection === 'calendar' && (
            <CalendarView onNavigate={(sec) => setCurrentSection(sec)} />
          )}

          {currentSection === 'statistics' && <StatisticsView user={user} />}

          {currentSection === 'settings' && (
            <SettingsView
              user={user}
              onUserUpdated={(u) => setUser(u)}
              onResetApp={() => {
                setUser(null);
                setCurrentSection('dashboard');
              }}
            />
          )}
        </main>
      </div>

      {/* Mobile Responsive Bottom Navigation */}
      <MobileNav
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        userName={user.name}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultTab={quickAddTab}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(sec) => setCurrentSection(sec)}
      />
    </div>
  );
}
